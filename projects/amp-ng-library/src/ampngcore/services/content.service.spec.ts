import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

import { ContentService, ContentServiceMethod } from './content.service';
import { LibraryConfigService } from '../../library/library-config-service';
import { AccountService } from './account.service';
import { CacheService, CacheStore } from './cache.service';
import { MediaType } from '../core';

interface MockCacheStore extends CacheStore {
  generateKey: jasmine.Spy;
  get: jasmine.Spy;
  set: jasmine.Spy;
}

describe('ContentService', () => {
  let service: ContentService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let mockLibraryConfigService: jasmine.SpyObj<LibraryConfigService>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockCacheService: jasmine.SpyObj<CacheService>;
  let mockContentStore: MockCacheStore;

  const mockServer = 'http://mockserver.com';
  const mockAccountId = 'mock-account-123';
  const mockHeadersObj = { 'X-Mock-Header': 'mock-value' }; 
  const mockHttpHeaders = new HttpHeaders(mockHeadersObj); 
  const mockResponseData = [{ id: 1, name: 'Test Data' }];
  const mockHttpResponse = new HttpResponse({ body: { responseData: mockResponseData }, status: 200 });

  // Helper function to setup mocks and service instance
  const setupService = (methodSpecificCacheEnabled: boolean, methodName: ContentServiceMethod) => {
    // Reset spies for each test
    
    mockLibraryConfigService = jasmine.createSpyObj('LibraryConfigService', ['getHeaders', 'isContentMode'], { 
      server: mockServer, 
      accountId: mockAccountId,
      contentCacheConfig: new Map([
        [methodName, methodSpecificCacheEnabled]
      ])
      
    });
    mockAccountService = jasmine.createSpyObj('AccountService', ['isContentMode']);
    mockCacheService = jasmine.createSpyObj('CacheService', ['createStore']);
    mockContentStore = jasmine.createSpyObj<MockCacheStore>('CacheStore', ['generateKey', 'get', 'set']);

    // --- Mock setup ---
    // Assume global cache is enabled (not content mode)
    mockAccountService.isContentMode.and.returnValue(false);
    mockLibraryConfigService.getHeaders.and.returnValue(mockHttpHeaders); // Return HttpHeaders instance
    // Mock createStore to return our spy store
    mockCacheService.createStore.and.returnValue(mockContentStore);
    // Mock store methods
    mockContentStore.generateKey.and.callFake((keyInput: any) => `mockCacheKey:${JSON.stringify(keyInput)}`);
    mockContentStore.get.and.returnValue(null); // Assume cache miss initially

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ContentService,
        { provide: LibraryConfigService, useValue: mockLibraryConfigService },
        { provide: AccountService, useValue: mockAccountService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Spy on http.get AFTER getting the instance but BEFORE creating the service instance
    // This ensures the service uses the spied-upon HttpClient
    spyOn(httpClient, 'get').and.returnValue(of(mockHttpResponse));

    // Create the service instance AFTER setting up mocks
    service = TestBed.inject(ContentService);
  };

  afterEach(() => {
    httpMock.verify(); // Verify that no unexpected HTTP requests were made
  });

  // --- Test Suites for each method ---

  const testFetchMethod = (
    methodName: ContentServiceMethod, 
    methodCall: () => void, 
    expectedUrlPattern: RegExp, 
    isTextHeader: boolean = true // Most methods use text header
  ) => {
    describe(methodName, () => {
      it('should set cache when cacheEnabled is true', () => {
        setupService(true, methodName);
        methodCall();

        // Expect http.get to have been called (even though we mock its return)
        expect(httpClient.get).toHaveBeenCalled();
        
        // Check the actual call to the mock store's set method
        expect(mockContentStore.set).toHaveBeenCalled();
        expect(mockContentStore.set).toHaveBeenCalledWith(jasmine.stringMatching(/^mockCacheKey:/), mockResponseData);
      });

      it('should NOT set cache when cacheEnabled is false', () => {
        setupService(false, methodName);
        methodCall();

        // Expect http.get to have been called
        expect(httpClient.get).toHaveBeenCalled();

        // Check that the mock store's set method was NOT called
        expect(mockContentStore.set).not.toHaveBeenCalled();
      });
       
    });
  };

  // Define tests for each method
  testFetchMethod(ContentServiceMethod.FETCH_TAGS, () => service.fetchTags().subscribe(), /\/tags$/);
  testFetchMethod(ContentServiceMethod.FETCH_CONTENT_BY_CATEGORY_TYPE_AND_TAG_ID, () => service.fetchContentByCategoryTypeAndTagID(1, 'tag1').subscribe(), /\/contentitems\/1\/cattype\/1\/tag\/tag1$/);
  testFetchMethod(ContentServiceMethod.FETCH_CONTENT_BY_CATEGORY_TYPE_AND_ARTIST_ID, () => service.fetchContentByCategoryTypeAndArtistId(1, 123).subscribe(), /\/contentitems\/1\/cattype\/1\/artist\/123$/);
  testFetchMethod(ContentServiceMethod.FETCH_CONTENT_BY_CATEGORY_TYPE_AND_CATEGORY_ID, () => service.fetchContentByCategoryTypeAndCategoryId(1, 456).subscribe(), /\/contentitems\/1\/category\/456$/);
  
  // Special handling for fetchContentItemMovies (calls executeGetRequest multiple times)
  describe(ContentServiceMethod.FETCH_CONTENT_ITEM_MOVIES, () => {
      const movieIds = [10, 20];
      const expectedUrls = movieIds.map(id => new RegExp(`/contentitem/${id}/movies$`));

      it('should set cache for each movie when cacheEnabled is true', () => {
          setupService(true, ContentServiceMethod.FETCH_CONTENT_ITEM_MOVIES);
          service.fetchContentItemMovies(movieIds).subscribe();

          expect(httpClient.get).toHaveBeenCalledTimes(movieIds.length);
          expect(mockContentStore.set).toHaveBeenCalledTimes(movieIds.length);
          movieIds.forEach((id, index) => {
              expect(mockContentStore.set.calls.argsFor(index)[0]).toContain(`contentitem/${id}/movies`); // Check key contains relevant part
              expect(mockContentStore.set.calls.argsFor(index)[1]).toEqual(mockResponseData);
          });
      });

      it('should NOT set cache for any movie when cacheEnabled is false', () => {
          setupService(false, ContentServiceMethod.FETCH_CONTENT_ITEM_MOVIES);
          service.fetchContentItemMovies(movieIds).subscribe();

          expect(httpClient.get).toHaveBeenCalledTimes(movieIds.length);
          expect(mockContentStore.set).not.toHaveBeenCalled();
      });
  });

  testFetchMethod(ContentServiceMethod.FETCH_CATEGORIES, () => service.fetchCategories(MediaType.AUDIO).subscribe(), /\/categories\/1$/); // Assuming MediaType.AUDIO = 1
  testFetchMethod(ContentServiceMethod.FETCH_CHANNELS, () => service.fetchChannels([], MediaType.VIDEO).subscribe(), /\/contentitems\/5\/cattype\/2\/recent\/100$/); // Assuming MediaType.VIDEO = 2
  testFetchMethod(ContentServiceMethod.FETCH_SERIES, () => service.fetchSeries().subscribe(), /\/contentitems\/3\/cattype\/1\/recent\/0$/);
  testFetchMethod(ContentServiceMethod.FETCH_ALBUMS, () => service.fetchAlbums().subscribe(), /\/contentitems\/2\/cattype\/1\/recent\/100$/);
  testFetchMethod(ContentServiceMethod.FETCH_ARTISTS, () => service.fetchArtists(MediaType.AUDIO).subscribe(), /\/artists\/mediatype\/1$/, false); // Uses JSON header
  testFetchMethod(ContentServiceMethod.FETCH_RECENT_ITEMS, () => service.fetchRecentItems(MediaType.AUDIO).subscribe(), /\/contentitems\/1\/cattype\/1\/recent\/400$/); // Assuming MediaType.AUDIO = 1

});

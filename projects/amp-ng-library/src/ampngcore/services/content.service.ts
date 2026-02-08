import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { forkJoin, Observable, of, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AMPContentItem, Artist, Category, Tag } from '../models';
import { MediaType } from '../core';
import { LibraryConfigService } from '../../library/library-config-service';
import { AccountService } from './account.service';
import { CacheService, CacheStore } from './cache.service';
import { CacheUtils } from '../helpers/cache-utils';

export enum ContentServiceMethod {
    FETCH_TAGS = 'fetchTags',
    FETCH_CONTENT_BY_CATEGORY_TYPE_AND_TAG_ID = 'fetchContentByCategoryTypeAndTagID',
    FETCH_CONTENT_BY_CATEGORY_TYPE_AND_ARTIST_ID = 'fetchContentByCategoryTypeAndArtistId',
    FETCH_CONTENT_BY_CATEGORY_TYPE_AND_CATEGORY_ID = 'fetchContentByCategoryTypeAndCategoryId',
    FETCH_CONTENT_ITEM_MOVIES = 'fetchContentItemMovies',
    FETCH_CATEGORIES = 'fetchCategories',
    FETCH_CHANNELS = 'fetchChannels',
    FETCH_SERIES = 'fetchSeries',
    FETCH_ALBUMS = 'fetchAlbums',
    FETCH_ARTISTS = 'fetchArtists',
    FETCH_RECENT_ITEMS = 'fetchRecentItems',
}

@Injectable({ providedIn: 'root' })
export class ContentService {
    private contentStore: CacheStore;
    private useCacheGlobal: boolean;

    constructor(
        private http: HttpClient,
        private configService: LibraryConfigService,
        private accountService: AccountService,
        private cacheService: CacheService,
    ) {
        this.useCacheGlobal = !this.accountService.isContentMode();

        this.contentStore = this.cacheService.createStore('content', {
            enabled: this.useCacheGlobal,
            duration: 1000 * 60 * 30, // 30 minutes
            keyGenerator: CacheUtils.generateGenericCacheKey,
        });
    }

    private executeGetRequest(
        url: string,
        useTextHeader: boolean,
        cacheEnabledKey?: ContentServiceMethod,
    ): Observable<any> {
        let cacheKey;

        const useCache = this.useCacheGlobal && this.configService.contentCacheConfig?.get(cacheEnabledKey);

        if (useCache) {
            cacheKey = this.contentStore.generateKey(url);
            const cachedData = this.contentStore.get<AMPContentItem[]>(cacheKey);
            if (cachedData) {
                return of(cachedData);
            }
        }

        const options = useTextHeader ? this.makeOptionsHeaderText() : this.makeOptionsHeader();

        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
            tap(data => {
                if (useCache) {
                    this.contentStore.set(cacheKey, data);
                }
            }),
        );
    }

    private makeOptionsHeaderText() {
        return {
            headers: this.configService.getHeaders(),
            observe: 'response' as 'response',
            responseType: 'text' as const,
        };
    }

    private makeOptionsHeader() {
        return { headers: this.configService.getHeaders(), observe: 'response' as 'response' };
    }

    public fetchTags(productFilters: any[] = []): Observable<Tag[]> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/tags`;
        const productList = this.createProductList(productFilters);
        if (productList) {
            url += '?' + productList;
        }

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_TAGS);
    }

    private createProductList(productFilters: any[]): string | null {
        if (productFilters == null || productFilters.length === 0) {
            return null;
        }

        // Sort the filters numerically in ascending order.
        // Take a copy to be multithreaded.
        const filters = [...productFilters];
        filters.sort((a, b) => a - b);
        const ids = filters.join(',');
        return 'products=' + ids;
    }

    public fetchContentByCategoryTypeAndTagID(
        categoryType: number,
        tagId: string | bigint,
        productFilters: any[] = [],
    ): Observable<any> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${categoryType}/tag/${tagId}`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_CONTENT_BY_CATEGORY_TYPE_AND_TAG_ID);
    }

    public fetchContentByCategoryTypeAndArtistId(
        categoryType: number,
        artistId: number,
        productFilters: any[] = [],
    ): Observable<any> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${categoryType}/artist/${artistId}`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_CONTENT_BY_CATEGORY_TYPE_AND_ARTIST_ID);
    }

    public fetchContentByCategoryTypeAndCategoryId(
        categoryType: number,
        categoryId: number | bigint,
        productFilters: any[] = [],
    ): Observable<any> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/${categoryType}/category/${categoryId}`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_CONTENT_BY_CATEGORY_TYPE_AND_CATEGORY_ID);
    }

    public fetchContentItemMovies(contentItemIds: number[]): Observable<any> {
        const includeDraft = this.configService.isContentMode();
        const responseList = [];

        for (const id of contentItemIds) {
            let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitem/${id}/movies`;
            if (includeDraft) {
                url += '?draft=true';
            }

            responseList.push(this.executeGetRequest(url, true, ContentServiceMethod.FETCH_CONTENT_ITEM_MOVIES));
        }

        return forkJoin(responseList);
    }

    public fetchCategories(mediaType: MediaType): Observable<Category[]> {
        const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/categories/${mediaType}`;

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_CATEGORIES).pipe(
            map((responseData: any[]) => {
                return responseData.map((category: any) => {
                    return new Category(category.id, category.name, category.translations, category.type);
                });
            }),
        );
    }

    public fetchChannels(productFilters: any[] = [], mediaType: MediaType = MediaType.VIDEO): Observable<any[]> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/5/cattype/${mediaType}/recent/100`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_CHANNELS);
    }

    public fetchSeries(productFilters: any[] = []): Observable<any[]> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/3/cattype/1/recent/0`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_SERIES);
    }

    public fetchAlbums(productFilters: any[] = [], type: number = 1): Observable<any[]> {
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/2/cattype/${type}/recent/100`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_ALBUMS);
    }

    public fetchArtists(mediaType: MediaType): Observable<Artist[]> {
        const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/artists/mediatype/${mediaType}`;

        return this.executeGetRequest(url, false, ContentServiceMethod.FETCH_ARTISTS).pipe(
            map((artistPayloads: object[]) => {
                return artistPayloads.map(artistPayload => new Artist(artistPayload['id'], artistPayload['name']));
            }),
        );
    }

    public fetchRecentItems(mediaType: number, productFilters = []): Observable<any> {
        const itemAmount = mediaType == MediaType.AUDIO ? 400 : 200;
        let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${mediaType}/recent/${itemAmount}`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);

        return this.executeGetRequest(url, true, ContentServiceMethod.FETCH_RECENT_ITEMS);
    }

    private modifyFetchUrlBasedOnMode(url: string, productFilters: any[]): string {
        if (this.configService.isContentMode()) {
            return this.addDraftToUrl(url);
        } else {
            return this.addProductIdsToURL(url, productFilters);
        }
    }

    private addDraftToUrl(url: string): string {
        return url + '/draft/true';
    }

    private addProductIdsToURLInternal(url: string, productIds, hasQuery: boolean): string {
        const productList = this.createProductList(productIds);
        let modifiedUrl = url;
        if (productList != null) {
            modifiedUrl += (hasQuery ? '&' : '?') + productList;
        }
        return modifiedUrl;
    }

    private addProductIdsToURL(url: string, productIds): string {
        return this.addProductIdsToURLInternal(url, productIds, false);
    }

    public searchServer(phrases: string, type: number, productFilters = []): Observable<any> {
        const termsArr = phrases.split(' ');
        const terms = termsArr.join(',');
        var url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/search/1/cattype/${type}`;
        url = this.modifyFetchUrlBasedOnMode(url, productFilters);
        const condition = this.configService.isContentMode() || productFilters.length == 0;
        url = url + (condition ? '?' : '&') + `terms=${terms}`;
        console.log('URL:' + url);
        return this.executeGetRequest(url, true);
    }

    public getContentItemTags(itemId): Observable<any> {
        const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitembyid/${itemId}/tags`;
        return this.executeGetRequest(url, true);
    }
        
}

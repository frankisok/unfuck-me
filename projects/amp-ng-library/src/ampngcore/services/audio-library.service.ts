// // import {environment} from '../../environments/environment';
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpResponse } from '@angular/common/http';
// // import 'rxjs/add/operator/map';
// import { Router } from '@angular/router';
// // import {Observable} from 'rxjs/Observable';

// // import {Programme} from '../_models/programme';
// import { AMPFolder, AMPProduct, Artist, Category, Tag } from '../models';
// // import {PlaybackContentPlaylist, Playlist} from '../_models/playlist';
// import { forkJoin, Observable } from 'rxjs';
// import { ArtistListResponse, FolderType, MediaType } from '../core';
// // import {PlaylistFilter} from '../_models/playlist-filter';
// import { ProductFilterService } from '../service';
// import { LibraryConfigService } from '../../library/library-config-service';
// import { map } from 'rxjs/operators';

// @Injectable()
// export class AudioLibraryService {
//     // fetchArtistsCounter = 0

//     constructor(
//         private http: HttpClient,
//         private router: Router,
//         // private account: AccountService,
//         private configService: LibraryConfigService,
//         private productFilterService: ProductFilterService,
//     ) {}

//     public fetchTags(productFilters = []): Observable<Tag[]> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/tags`;
//         const productList = this.createProductList(productFilters);
//         if (productList != null) {
//             url += '?' + productList;
//         }
//         return this.executeGetRequest(url, true);
//     }

//     public fetchContentByCategoryTypeAndTagID(
//         categoryType: number,
//         tagid: string | bigint,
//         productFilters = [],
//     ): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${categoryType}/tag/${tagid}`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchContentByCategoryTypeAndArtistId(
//         categoryType: number,
//         artistId: number,
//         productFilters = [],
//     ): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${categoryType}/artist/${artistId}`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchContentByCategoryTypeAndCategoryId(
//         categoryType: number,
//         categoryId: number | bigint,
//         productFilters = [],
//     ): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/${categoryType}/category/${categoryId}`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     // public addOrUpdateContentToPlaylist(playlist: Playlist): Observable<any> {
//     //     const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/playlist`;
//     //     playlist.accountId = this.getAccountNumber(this.configService.accountId);
//     //     const options = this.makeOptionsHeaderText();

//     //     const body = playlist;
//     //     return this.http.post(url, body, options)
//     //         .map((response: HttpResponse<any>) => {
//     //             return response.body.responseData;
//     //         });
//     // }

//     // public copyPlaylist(playlist: Playlist, playlistType: number, folderId: number): Observable<any> {
//     //     const u = `${this.configService.server}/ampapi/account/${this.configService.accountId}/playlist/${playlist.id}/copy/${playlistType}/folder/${folderId}`;
//     //     const url = this.addProductsToURL(u, playlist.mediaType);
//     //     return this.executeGetRequest(url, true)
//     // }

//     public fetchFoldersByTypeIdentifier(typeIdentifier: number, mediaType: MediaType): Observable<any> {
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/folders/${typeIdentifier}/mediatype/${mediaType}/system/false`;
//         return this.executeGetRequest(url, false);
//     }

//     public fetchPlaylists(type: MediaType): Observable<any[]> {
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/playlists/${type}/system/false`;
//         return this.executeGetRequest(url, true);
//     }

//     // public fetchInternalPlaylists1(playlistId: number): Observable<Playlist[]> {
//     //     const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/playlist/${playlistId}/internal`;
//     //     return this.executeGetRequest(url, true)
//     // }

//     private addProductIdsToURLInternal(url: string, productIds, hasQuery: boolean): string {
//         const productList = this.createProductList(productIds);
//         let modifiedUrl = url;
//         if (productList != null) {
//             modifiedUrl += (hasQuery ? '&' : '?') + productList;
//         }
//         return modifiedUrl;
//     }

//     private addProductIdsToURL(url: string, productIds): string {
//         return this.addProductIdsToURLInternal(url, productIds, false);
//     }

//     private addProductsToURL(url: string, mediaType: MediaType): string {
//         const products = this.productFilterService.getSelectedProducts(mediaType);
//         const productBundleIds = products.map((product: AMPProduct) => product.contentBundleId);
//         const modifiedURL = this.addProductIdsToURL(url, productBundleIds);
//         return modifiedURL;
//     }

//     // public generatePlaylistMovies(playlist: Playlist): Observable<any[]> {
//     //     const u = `${this.configService.server}/ampapi/account/${this.configService.accountId}/playlist/movies/generate`;
//     //     const url = this.addProductsToURL(u, playlist.mediaType);

//     //     const options = this.makeOptionsHeaderText();

//     //     const body = {
//     //         ...playlist,
//     //         internalPlaylists: playlist.internalPlaylists.map(internalPlaylist => {
//     //             return {
//     //                 ...internalPlaylist,
//     //                 filters: internalPlaylist.filters.map(filter => {
//     //                     return {
//     //                         ...filter,
//     //                         id: 0
//     //                     } as PlaylistFilter
//     //                 }),
//     //             }
//     //         }),
//     //         movieIdentifiers: []
//     //     };

//     //     return this.http.post(url, body, options)
//     //         .map((response: HttpResponse<any>) => {
//     //             return response.body.responseData;
//     //         });
//     // }

//     public fetchPlaylistMovies(playlist): Observable<any> {
//         const u = `${this.configService.server}/ampapi/account/${this.configService.accountId}/playlist/${playlist.id}/movies`;
//         const url = this.addProductsToURL(u, playlist.mediaType);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchContentItemMovies(contentItemIds: Array<number>): Observable<any> {
//         const includeDraft = this.configService.isContentMode();
//         const responseList = [];

//         for (const id of contentItemIds) {
//             let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitem/${id}/movies`;
//             if (includeDraft) {
//                 url = this.addDraftToUrl(url);
//             }
//             // else {
//             //     url = this.addProductIdsToURL(url, productFilters)
//             // }
//             const options = this.makeOptionsHeaderText();

//             responseList.push(
//                 this.http.get(url, options).pipe(
//                     map((response: HttpResponse<any>) => {
//                         return this.convertToJson(response);
//                     }),
//                 ),
//             );
//         }
//         return forkJoin(responseList);
//     }

//     private modifyFetchUrlBasedOnMode(url: string, productFilters: any[]): string {
//         if (this.configService.isContentMode()) {
//             return this.addDraftToUrl(url);
//         } else {
//             return this.addProductIdsToURL(url, productFilters);
//         }
//     }

//     public fetchAudioLibrary(productFilters = []): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${2}/recent/400`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         console.log('Final URL:', url);

//         return this.executeGetRequest(url, true);
//     }

//     public fetchVideoLibrary(productFilters = []): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/1/cattype/${1}/recent/200`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchArtists(mediaType: MediaType): Observable<any> {
//         // this.fetchArtistsCounter ++
//         // console.log(`fetchArtists called ${this.fetchArtistsCounter} times}`)
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/artists/mediatype/${mediaType}`;
//         const options = this.makeOptionsHeader();

//         return this.http.get(url, options).pipe(
//             map((response: HttpResponse<ArtistListResponse>) => this.convertToJson(response)),
//             map((artistPayloads: object[]) => {
//                 const artists: Artist[] = [];

//                 for (const artistPayload of artistPayloads) {
//                     const artist = new Artist(artistPayload['id'], artistPayload['name']);
//                     artists.push(artist);
//                 }
//                 return artists;
//             }),
//         );
//     }

//     public fetchSchedules(mediaType: MediaType): Observable<any> {
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/schedules/${mediaType}/system/false`;
//         const options = this.makeOptionsHeaderText();

//         return this.http.get(url, options).pipe(
//             map((response: HttpResponse<any>) => {
//                 return this.convertToJson(response);
//             }),
//         );
//     }

//     public fetchSystemSchedules(mediaType: MediaType): Observable<any> {
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/schedules/${mediaType}/system/true`;
//         return this.executeGetRequest(url, true);
//     }

//     private getAccountNumber(accountId: string): number {
//         const accountNumber = accountId.substr(2);
//         return +accountNumber;
//     }

//     public fetchCategories(mediaType: MediaType): Observable<any> {
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/categories/${mediaType}`;
//         const options = this.makeOptionsHeaderText();

//         return this.http.get(url, options).pipe(
//             map((response: HttpResponse<any>) => {
//                 const responseData = this.convertToJson(response);
//                 return responseData.map((category: any) => {
//                     return new Category(category.id, category.name, category.translations, category.type);
//                 });
//             }),
//         );
//     }

//     public fetchChannels(productFilters = [], mediaType = 1): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/5/cattype/${mediaType}/recent/100`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchSeries(productFilters = []): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/3/cattype/1/recent/0`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchAlbums(productFilters = [], type = 1): Observable<any> {
//         let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/contentitems/2/cattype/${type}/recent/100`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         return this.executeGetRequest(url, true);
//     }

//     public searchServer(phrases: string, type: number, productFilters = []): Observable<any> {
//         const termsArr = phrases.split(' ');
//         const terms = termsArr.join(',');
//         var url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/search/1/cattype/${type}`;
//         url = this.modifyFetchUrlBasedOnMode(url, productFilters);
//         const condition = this.configService.isContentMode() || productFilters.length == 0;
//         url = url + (condition ? '?' : '&') + `terms=${terms}`;
//         console.log('URL:' + url);
//         return this.executeGetRequest(url, true);
//     }

//     public fetchSystemFoldersByType(type: FolderType, mediaType: MediaType): Observable<AMPFolder[]> {
//         const url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/folders/${type}/mediatype/${mediaType}/system/true`;
//         return this.executeGetRequest(url, false);
//     }

//     public fetchMyFoldersByType(type: FolderType, mediaType: MediaType): Observable<AMPFolder[]> {
//         return this.fetchFoldersByTypeIdentifier(type, mediaType);
//     }

//     private makeOptionsHeaderText() {
//         return {
//             headers: this.configService.getHeaders(),
//             observe: 'response' as 'response',
//             responseType: 'text' as const,
//         };
//     }

//     private makeOptionsHeader() {
//         return { headers: this.configService.getHeaders(), observe: 'response' as 'response' };
//     }

//     private executeGetRequest(url: string, text: boolean): Observable<any> {
//         const options = text ? this.makeOptionsHeaderText() : this.makeOptionsHeader();

//         return this.http.get(url, options).pipe(
//             map((response: HttpResponse<any>) => {
//                 return this.convertToJson(response);
//             }),
//         );
//     }

//     private createProductList(productFilters = []): string {
//         if (productFilters == null || productFilters.length === 0) {
//             return null;
//         }

//         // Sort the filters numerically in ascending order.
//         // Take a copy to be multithreaded.
//         const filters = [...productFilters];
//         filters.sort((a, b) => a - b);
//         const ids = filters.join(',');
//         return 'products=' + ids;
//     }

//     private addDraftToUrl(url: string): string {
//         return url + '/draft/true';
//     }

//     private convertToJson(response: any) {
//         const r =
//             typeof response.body === 'string' ? JSON.parse(response.body).responseData : response.body.responseData;
//         return r;
//     }
// }

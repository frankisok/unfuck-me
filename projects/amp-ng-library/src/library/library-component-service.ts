import { Injectable } from "@angular/core";
import { MediaType, ToolBarAction } from '../ampngcore/core';
import { MultiSelectList } from '../ampngcore/core';
import { Subject } from "rxjs";
import { FilteredItemsWithIndex } from '../ampngcore/core';

interface ConfigureBase {
    multiSelectListMediator: MultiSelectList
    contentItems: Array<any>;
}
interface ContentMode extends ConfigureBase {
    tags: Array<any>;
    artists: Array<any>;
    mediaType: MediaType;
}
interface DropdownMode extends ConfigureBase {
    mediaType: MediaType,
}

interface ILibraryComponentService {
    /**
     * configs the menu component for content mode.
     * @param config The configuration object for the library menu component.
     */
    configContentMode(config: ContentMode): void;
    /**
     * configs the menu component for dropdown mode.
     * @param config The configuration object for the library menu component.
     */
    configDropDownMode(config: DropdownMode): void;
}

/**
 * This service is used to configure the library with helper/callback component such as menu component, modal component, dam edit component and so on.
 * 
 * @Important Note: This services is used only for passing component between client and library. 
 * should you require to access or pass data between library and client, use the `LibraryConfigService` instead.
 *
 * This services configures the x mode if and only if a callback component of type `<T>` also known as generic, is provided with either `DropdownMode` or `ContentMode` for NOW.
 */
@Injectable({ providedIn: 'root' })
export class LibraryComponentService implements ILibraryComponentService {

    private _updateLibrary: Subject<boolean> = new Subject<boolean>();
    private _updateContentItems: Subject<any[]> = new Subject<any[]>();
    private _mediaType: MediaType
    private _contentItems: Array<any>;
    private _multiSelectListMediator: MultiSelectList
    private tags: Array<any>;
    private artists: Array<any>;
    private set multiSelectListMediator(multiSelectListMediator: MultiSelectList) { this._multiSelectListMediator = multiSelectListMediator; }
    private _toolBarObservable: Subject<ToolBarAction> = new Subject<ToolBarAction>();
    public toolBarObservable$ = this._toolBarObservable.asObservable();

    private _librarySpinner = new Subject<boolean>()
    public librarySpinner$ = this._librarySpinner.asObservable()

    private _generalSpinner = new Subject<boolean>()
    public generalSpinner$ = this._generalSpinner.asObservable()
    
    public updateLibObservable = this._updateLibrary.asObservable();
    public updateContentItems = this._updateContentItems.asObservable();
    public set mediaType(mediaType: MediaType) { this._mediaType = mediaType; }
    public get mediaType(): MediaType { return this._mediaType; }

    public configContentMode(config: ContentMode): void {
        this.tags = config.tags;
        this.artists = config.artists;
        this.multiSelectListMediator = config.multiSelectListMediator;
        this._contentItems = config.contentItems;
        this.mediaType = config.mediaType;
    }

    public configDropDownMode(config: DropdownMode): void {
        this.mediaType = config.mediaType;
        this.multiSelectListMediator = config.multiSelectListMediator;
        this._contentItems = config.contentItems;
    }

    public setContentItems(contentItems: Array<any>) {
        this._contentItems = contentItems;
        this._updateContentItems.next(contentItems)
    }
    public getMultiSelectListMediator(): MultiSelectList { return this._multiSelectListMediator; }
    public getContentItems(): Array<any> {
        return this._contentItems.map((entry: FilteredItemsWithIndex) => entry.contentItem);
    }
    public getConteModeTagsAndArtists() { return { tags: this.tags, artists: this.artists } };
    public startUpdateLibrary() { this._updateLibrary.next(true); }
    public finishLibraryUpdate() { this._updateLibrary.next(false); }

    // rename this to be generic
    public startLibrarySpinner() {this._librarySpinner.next(true)}
    public stopLibrarySpinner() {this._librarySpinner.next(false)}
    
    public startStopSpinner(spinner: boolean) {
        this._generalSpinner.next(spinner);
    }
    
    public updateToolBar(value: ToolBarAction): void {
        this._toolBarObservable.next(value);
    }

}

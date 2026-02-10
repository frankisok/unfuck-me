import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { AMPContentItem, AMPProduct, Category, DownloadingItem } from '../../../ampngcore/models';
import {
    FilteredItemsWithIndex,
    LibraryModalDelegate,
    ListItem,
    MediaType,
    MultiSelectListMediator,
    VirtualScrollItemSize,
    VirtualScrollViewportDelegate,
    VirtualScrollViewType,
} from '../../../ampngcore/core';
import { DAMObject } from '../../../ampngcore/types/dam-object.type';
import { LibraryDetailHeaderDelegate } from '../library-detail-header.delegate';
import { AudioLibraryDelegate } from '../audio-library.delegate';
import { VirtualScrollViewportComponent } from '../../../ampngcore/components/virtual-scroll-viewport/virtual-scroll-viewport.component';

@Component({
    selector: 'amp-video-lib-detail',
    templateUrl: './video-lib-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./video-lib-detail.component.scss'],
    standalone: true,
    imports: [NgClass, NgIf, NgTemplateOutlet, VirtualScrollViewportComponent]
})
export class VideoLibDetailComponent implements VirtualScrollViewportDelegate {
    VIDEO_MEDIA_TYPE = MediaType.VIDEO;
    virtualScrollItemSize: VirtualScrollItemSize;

    @Input() set contentItems(value: FilteredItemsWithIndex[]) {
        this._contentItems = value;
    }

    get contentItems(): FilteredItemsWithIndex[] {
        return this._contentItems;
    }

    @Input() set listType(value: VirtualScrollViewType) {
        this._listType = value;
        this.virtualScrollItemSize =
            this._listType === VirtualScrollViewType.LIST
                ? VirtualScrollItemSize.VIDEO_ITEM_LIST
                : VirtualScrollItemSize.VIDEO_ITEM_GRID;
    }

    get listType(): VirtualScrollViewType {
        return this._listType;
    }

    @Input() _contentItems: FilteredItemsWithIndex[];
    @Input() artistsMap: Map<number, string> = new Map<number, string>();
    @Input() _listType: VirtualScrollViewType;
    @Input() multiSelectListMediator: MultiSelectListMediator;
    @Input() modalDelegate: LibraryModalDelegate;
    @Input() playlistListItems: Array<ListItem>;
    @Input() searchFilter: string;
    @Input() showHeader: boolean;

    @Input() damObject: DAMObject;
    @Input() videoChannels: AMPContentItem[];
    @Input() series: AMPContentItem[];
    @Input() albums: AMPContentItem[];
    @Input() videos: AMPContentItem[];
    @Input() products: AMPProduct[];
    @Input() allProducts: AMPProduct[];
    @Input() categories: Category[];
    @Input() headerDelegate: LibraryDetailHeaderDelegate;
    @Input() headerTemplate!: TemplateRef<any>;

    @Input() audioLibraryDelegate: AudioLibraryDelegate;

    @Input() contentItemIsInEditMode;
    @Input() contentProgress: DownloadingItem[]

    @Input() isProductTab: boolean;

    @Input() isVideoLibrarySelected: boolean;

    @Output() updateLibrary: EventEmitter<any> = new EventEmitter<any>();

    constructor() {}

    contentIsSelectable(): boolean {
        return true;
    }

    contentIsDraggable(): boolean {
        return false;
    }

    reorderContent(reorderedContent: object[]) {
        // empty implementation
    }

    getGenres(item: AMPContentItem): string {
        return this.audioLibraryDelegate.getGenresFromTags(item.tags)
    }

    contentIsEditable(): boolean {
        return this.modalDelegate.isContentMode();
    }

    multiSelectEnabled(): boolean {
        return true;
    }

    singleSelectEnabled(): boolean {
        return false;
    }

    updateVideoLibrary() {
        this.updateLibrary.emit();
    }
}

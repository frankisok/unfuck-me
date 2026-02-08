import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import {
    FilteredItemsWithIndex,
    LibraryModalDelegate,
    MediaType,
    MultiSelectListMediator,
    VirtualScrollItemSize,
    VirtualScrollViewportDelegate,
    VirtualScrollViewType,
} from '../../../ampngcore/core';
import { AMPContentItem, AMPProduct, Category, DownloadingItem } from '../../../ampngcore/models';
import { AudioLibraryDelegate } from '../audio-library.delegate';
import { DAMObject } from '../../../ampngcore/types/dam-object.type';
import { LibraryDetailHeaderDelegate } from '../library-detail-header.delegate';
import { LibraryConfigService } from '../../library-config-service';

@Component({
    selector: 'amp-audio-lib-detail',
    templateUrl: './audio-lib-detail.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./audio-lib-detail.component.scss'],
    standalone: false
})
export class AudioLibraryDetailComponent implements OnInit, VirtualScrollViewportDelegate {
    AUDIO_MEDIA_TYPE = MediaType.AUDIO;
    VIRTUAL_SCROLL_ITEM_SIZE = VirtualScrollItemSize.AUDIO_ITEM;
    VIRTUAL_SCROLL_VIEW_TYPE_LIST = VirtualScrollViewType.LIST;

    @Input() artistsMap: any;
    @Input() contentItems: FilteredItemsWithIndex[];
    @Input() multiSelectListMediator: MultiSelectListMediator;
    @Input() modalDelegate: LibraryModalDelegate;
    @Input() searchFilter: string;
    @Input() audioLibraryDelegate: AudioLibraryDelegate;
    @Input() showHeader: boolean;

    @Input() damObject: DAMObject;
    @Input() audioChannels: AMPContentItem[];
    @Input() series: AMPContentItem[];
    @Input() albums: AMPContentItem[];
    @Input() songs: AMPContentItem[];
    @Input() products: AMPProduct[];
    @Input() categories: Category[];
    @Input() allProducts: AMPProduct[];
    @Input() headerDelegate: LibraryDetailHeaderDelegate;
    @Input() headerTemplate!: TemplateRef<any>;
    @Input() contentProgress: DownloadingItem[]

    @Input() contentItemIsInEditMode;

    @Input() isAudioChannelSelected: boolean

    @Input() isProductTab: boolean;

    @Output() updateLibrary: EventEmitter<MediaType> = new EventEmitter<MediaType>();

    isMobile: boolean;
    constructor(private configService: LibraryConfigService) {}

    ngOnInit(): void {
        this.isMobile = this.configService.isMobile();
    }

    contentIsDraggable(): boolean {
        return false;
    }

    contentIsSelectable(): boolean {
        return true;
    }

    reorderContent(reorderedContent: object[]) {
        // empty implementation
    }

    getGenres(item: AMPContentItem) {
        return this.audioLibraryDelegate.getGenresFromTags(item.tags);
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

    updateAudioLibrary() {
        this.updateLibrary.emit();
    }
}

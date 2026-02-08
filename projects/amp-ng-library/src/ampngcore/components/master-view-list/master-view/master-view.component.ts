import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
    ampOnDragDrop,
    DelegateType,
    ListItem,
    MasterViewListItemEventDelegate,
    masterViewReOrdered, memo,
    UnSub,
    updateDraggableRanges
} from '../../../core';
import { ContentType } from '../../../enums/content-type.enum';
import { EventBusService } from '../../../services/event-bus.service';
import { AMPEventName } from '../../../protocols/events.protocol';
import { PlaybackContentOrder } from '../../../models/playback-content-order.type';
import { LibraryAssetsService } from '../../../services/assets.service';



enum EReorderType {
    DEFAULT,
    PLAYLIST,
    PROGRAMME,
    SCHEDULE = 4
}

@Component({
    selector: 'app-master-view',
    templateUrl: './master-view.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./master-view.component.scss'],
    standalone: false
})
export class MasterViewComponent extends UnSub implements OnInit, AfterContentInit, OnChanges {

    DELEGATE_TYPE_OTHER = DelegateType.OTHER

    @Input() listItems: ListItem[];
    @Input() eventDelegate: MasterViewListItemEventDelegate;
    @Input() delegateType?: DelegateType;
    @Input() hasTabs?: boolean;
    @Input() hasToolbar?: boolean;
    @Input() contentType?: ContentType;
    @Input() className?: string;
    @Input() searchText?: string = 'Search';
    @Input() dirtyTimeStamp?: number;

    public searchFilter = '';
    public isDragAvailable: boolean = true;
    folderDraggableRanges: number[] = [];
    looseItemDraggableRanges: number[] = [];

    constructor(
        private eventBusService: EventBusService,
        protected assetsService: LibraryAssetsService,
        private cdr: ChangeDetectorRef,
    ) {
        super();
    }

    ngOnInit(): void {
        if (this.delegateType === DelegateType.OTHER) {
            this.isDragAvailable = false
        }
    }
    
    ngAfterContentInit(): void {
        setTimeout(() => {
            this.cdr.markForCheck()
        }, 800);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['listItems']?.currentValue !== changes['listItems']?.previousValue) {
            this.folderDraggableRanges = [];
            this.looseItemDraggableRanges = [];
            const listItems: Array<ListItem> = changes['listItems'].currentValue;
            updateDraggableRanges(listItems, this.folderDraggableRanges, this.looseItemDraggableRanges);
        }
        this.cdr.markForCheck()
    }

    get myListItem() {
        return this.eventDelegate.updateSearchTerm(this.searchFilter)
    }

    isDraggable(): boolean {
        return true
        // return this.delegate.contentIsDraggable()
    }

    onDrop(event: CdkDragDrop<ListItem[]>) {
        // transferArrayItem // can be used for dragging items into different folders
        const r = ampOnDragDrop(event, this.folderDraggableRanges, this.looseItemDraggableRanges)
        if (r) {
            const reorderItems = masterViewReOrdered(event.container.data)
            this.onReorderUpdateMasterView({ ids: reorderItems, folderId: event.container.data[0].folderId, folderCount: this.folderDraggableRanges.length })
        }
    }

    onReorderUpdateMasterView(items: any): void {
        let type: number
        if (this.contentType) {
            switch (this.contentType) {
                case ContentType.PLAYLIST:
                    type = EReorderType.PLAYLIST
                    break;
                case ContentType.PROGRAMME:
                    type = EReorderType.PROGRAMME
                    break;
                case ContentType.SCHEDULE:
                    type = EReorderType.SCHEDULE
                    break;
                default:
                    type = EReorderType.DEFAULT
                    break;
            }
            const updateIndexes = items.ids.map((item: number | bigint, index: number) => {
                if (index < items.folderCount) {
                    return { identifier: item, type: 0 }
                }
                return { identifier: item, type: type }
            })

            const orderData: PlaybackContentOrder = {
                folderId: items.folderId,
                identifiersOrder: updateIndexes
            }
            this.eventBusService.publish({
                eventName: AMPEventName.PLAYBACK_CONTENT_REORDER_START,
                eventPayload: {
                    eventData: orderData,
                }
            })
        }
    }

    @memo()
    /**@deprecated this can be done directly in the templates no need for function calls */
    delegateTypeIsOther(): boolean {
        return this.delegateType === DelegateType.OTHER
    }
}

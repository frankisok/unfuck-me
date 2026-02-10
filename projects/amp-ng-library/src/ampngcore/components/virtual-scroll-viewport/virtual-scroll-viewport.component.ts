import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { parse, stringify } from 'lossless-json';
import { ampEncodeURI, FilteredItemsWithIndex, getImgForContentItem, MEDIA_DIRECTORY, PUBLIC_HTML_SERVER, TruncatePipe } from '../../core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { VideoPreviewModalComponent } from '../video-preview-modal/video-preview-modal.component';
import { AudioPreviewModalComponent } from '../audio-preview-modal/audio-preview-modal.component';
import { MultiSelectListMediator } from '../../core';
import { DragDroppableComponent } from '../../core';
import { AMPProduct, Artist, DownloadingItem } from '../../models';
import { MediaType, reIndex } from '../../core';
import { UnSub } from '../../core';
import { LibraryAssetsService, ProductService, SpinnerService } from '../../service';
import { ListItem } from '../../core';
import { VirtualScrollViewportDelegate } from './virtual-scroll-viewport.delegate';
import { VirtualScrollViewType } from './_enums/virtual-scroll-list-type.enum';
import { VirtualScrollItemSize } from './_enums/virtual-scroll-item-size.enum';
import { ContentOwner } from '../../core';
import { AMPStatus } from '../../core';
import { LibraryComponentService } from '../../../library/library-component-service';
import { takeUntil } from 'rxjs/operators';
import { LibraryConfigService } from '../../../library/library-config-service';
import { DAMObject } from '../../types/dam-object.type';
import { isProductPlan } from '../../util/type-guards';
import { getEncodedAMPPath } from '../../helpers/core-thumbnail';
import { DisableActions } from '../../interfaces/disabled-actions';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CdkDragDrop, CdkDragPlaceholder, CdkDragStart, CdkDropList, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgOptimizedImage } from '@angular/common';
import { TagLoaderComponent } from './virtual-scroll-genres/tag-loader/tag-loader.component';
import { LibProgressRingComponent } from '../progress-ring/lib-progress-ring.component';
import { EditModeActionsComponent } from '../edit-mode-actions/edit-mode-actions.component';
import { LibraryToggleComponent } from '../library-toggle/library-toggle.component';

@Component({
    selector: 'app-virtual-scroll-viewport',
    templateUrl: './virtual-scroll-viewport.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./virtual-scroll-viewport.component.scss'],
    standalone: true,
    imports: [
        NgClass,
        NgFor,
        NgIf,
        NgStyle,
        FormsModule,
        TranslateModule,
        ScrollingModule,
        DragDropModule,
        NgOptimizedImage,
        TagLoaderComponent,
        LibProgressRingComponent,
        EditModeActionsComponent,
        LibraryToggleComponent,
        TruncatePipe,
    ]
})
export class VirtualScrollViewportComponent extends UnSub implements OnInit, OnChanges, DragDroppableComponent {
    static options: NgbModalOptions = {
        size: 'lg',
        centered: true,
        modalDialogClass: 'amp__system_video_preview_modal',
    };
    VIDEO_MEDIA_TYPE = MediaType.VIDEO;
    GRID_VIEW = VirtualScrollViewType.GRID;
    LIST_VIEW = VirtualScrollViewType.LIST;
    totalCardWidth: number;
    isTablet: boolean;
    isDeskTop: boolean;

    @Input() set scrollContent(content: FilteredItemsWithIndex[]) {
        this._scrollContent = content;
        this._scrollSize = content?.length;
        this.gridLayoutRows = this.visibleGridContent();
    }
    get scrollContent(): FilteredItemsWithIndex[] {
        return this._scrollContent;
    }
    private _scrollContent: FilteredItemsWithIndex[];
    private _listType: VirtualScrollViewType;

    @Input() searchFilter = '';

    @Input() artistsMap;

    @Input() multiSelectListMediator: MultiSelectListMediator;
    @Input() delegate: VirtualScrollViewportDelegate;
    @Input() mediaType: MediaType;
    @Input() contentProgress: DownloadingItem[] = []

    // after search, we might need to reset grid layout, hence this usage
    @Input() set listType(listType: VirtualScrollViewType) {
        this._listType = listType;
        if (this.GRID_VIEW === listType) {
            this.gridLayoutRows = this.visibleGridContent();
        }
        this.changeDetector.detectChanges();
    }
    get listType(): VirtualScrollViewType {
        return this._listType;
    }

    @Input() itemSize: VirtualScrollItemSize;
    @Input() isLibrary?: boolean;
    @Input() productShowing?: boolean = false;
    @Input() products: AMPProduct[];
    @Input() damObject: DAMObject;
    @Input() scheduleMap: Map<String, any>

    AUDIO_MEDIA_TYPE = MediaType.AUDIO;

    umlautMap = {
        '\u00dc': 'UE',
        '\u00c4': 'AE',
        '\u00d6': 'OE',
        '\u00fc': 'ue',
        '\u00e4': 'ae',
        '\u00f6': 'oe',
        '\u00df': 'ss',
    };
    @Input() contentItems: Array<object>;
    @Input() playlistListItems: Array<ListItem>;

    set gridLayoutRows(value: any[]) {
        this._gridLayoutRows = value;
    }

    get gridLayoutRows(): any[] {
        return this._gridLayoutRows;
    }

    private _gridLayoutRows = [];
    numberOfCols = 4;

    @ViewChild('gridContainer') gridContainer: ElementRef;
    @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;

    private _itemBufferSize: { maxBufferPx: number; minBufferPx: number } = { maxBufferPx: 500, minBufferPx: 300 };
    private _scrollSize: number = 0;

    DRAFT_STATUS = AMPStatus.DRAFT;

    disableUI = false;
    isInEditMode = false;
    deviceType: string;
    isMobile: boolean;
    disabledActions: DisableActions;
    truncateValue: number = 25;
    reIndex = reIndex;
    draggedItem: any
    hoveredIndex: number | null = null;

    // download queue related configurable
	styleRoot: HTMLElement | undefined;
    inProgress: number;
	iconSize: number;
	progressBg: number;
	progressRadius: number;
	progressRadiusAudio: number;


    @Input() isAudioChannelSelected: boolean;
    @Input() isVideoLibrarySelected: boolean;

    @Input() isProductTab: boolean;

    constructor(
        private modalService: NgbModal,
        private spinnerService: SpinnerService,
        private changeDetector: ChangeDetectorRef,
        protected configService: LibraryConfigService,
        protected assetsService: LibraryAssetsService,
        private libraryComponentService: LibraryComponentService,
        private productService: ProductService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        super();
        this.disabledActions = this.configService.device.disabledActions;
        this.isTablet = this.configService.isTablet();
        this.isDeskTop = this.configService.isDesktop();
    }

    ngOnInit(): void {
        this.deviceType = this.configService.deviceTypeNOrientation;
        this.isMobile = this.configService.isMobile();
        this.setItemBufferSize(this.itemSize);
        this.subscribeToViewportSpinner();
        this.configService.isInEditMode$.pipe().subscribe((isInEditMode: boolean) => {
            this.isInEditMode = isInEditMode;
        });
        this.styleRoot = document.documentElement;
        this.progressRadius = +getComputedStyle(this.styleRoot).getPropertyValue('--disc-radius-value').trim();
        this.progressRadiusAudio = +getComputedStyle(this.styleRoot).getPropertyValue('--disc-radius-audio-value').trim();
		this.inProgress = +getComputedStyle(this.styleRoot).getPropertyValue('--disc-inProgress-value').trim();
		this.progressBg = +getComputedStyle(this.styleRoot).getPropertyValue('--disc-progressBg-value').trim();
    }

    ngAfterViewInit(): void {
        if (this.isGridView()) {
            this.calculateWidthOfColumnBasedOnScreenWidth();
            this.gridLayoutRows = this.visibleGridContent();
            this.changeDetector.detectChanges();
        }
        window.addEventListener('orientationchange', () => {
            const timeId = setTimeout(() => {
                this.calculateWidthOfColumnBasedOnScreenWidth();
                clearTimeout(timeId);
            }, 500);
        });
    }

    ngOnChanges(_changes: SimpleChanges): void {
        if (!this.isInEditMode) {
            if (this.viewport) {
                this.viewport.scrollToIndex(0);
            } 
        }
        this.changeDetector.markForCheck();
    }

    @HostListener('window:resize', ['$event'])
    handleResize() {
        if (this.isGridView()) {
            this.calculateWidthOfColumnBasedOnScreenWidth();
            this.gridLayoutRows = this.visibleGridContent();
        }
    }

    subscribeToViewportSpinner() {
        this.spinnerService.detailLoadingInProgress$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((disableUI: boolean) => {
                this.disableUI = disableUI;
            });
    }

    isGridView(): boolean {
        return this.listType === VirtualScrollViewType.GRID;
    }

    /**
     * - Due to the implement for the spinner service, Synchronous event broadcasting it throwing this error
     * https://angular.io/errors/NG0100
     * - This is possible because of the async functionality of the virtual spinner and change detector.
     * So what happens is the child component(this) is updating the value of the parent component causing
     * a recheck after the view has been checked, hence forth resulting in the error above
     * - This is all explained here, https://indepth.dev/posts/1001/everything-you-need-to-know-about-the-expressionchangedafterithasbeencheckederror-error
     * so using the timer is the correct way to prevent the error
     */
    setUpVirtualScrollContent() {
        // const timerId = setTimeout(() => {
        //     this.spinnerService.showDetailLoadingSpinner()
        //     clearInterval(timerId)
        // }, 0)
        //
        // this.delegate.getVirtualScrollContent(this.playlist)
        //     .pipe(
        //         takeUntil(this.unsubscribe$),
        //         tap(() => {
        //             const timeId = setTimeout(() => {
        //                 this.spinnerService.hideDetailLoadingSpinner();
        //                 clearInterval(timeId);
        //             }, );
        //         })
        //     )
        //     .subscribe(
        //         (playlistMovies: any[]) => {
        //             this.playlistContent = playlistMovies
        //             this.delegate.contentLoaded$.next(playlistMovies)
        //             this.changeDetector.detectChanges()
        //         }
        //     )
    }

    visibleContent() {
        const visibleItems = this.scrollContent;
        this._scrollSize = visibleItems.length;
        return visibleItems;
    }

    // NO LONGER BEING USED, TO MAINTAIN CORRECT INDEXING, THE PARENT CLASS CALLING VIRTUAL SCROLL VIEWPORT WOULD USING IMPLEMENT THIS METHOD
    getFilterFunc() {
        return item => {
            return (
                item.name.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
                this.artistsMap[item.artistId].toLowerCase().includes(this.searchFilter.toLowerCase())
            );
        };
    }

    getSelectedItemStyle(index): string {
        const lastListItemIndex = this.visibleContent().length - 1
        const isLastItem = this.visibleContent()[lastListItemIndex].index === index;
        const lastItem =
            this.configService.stateService.getCurrentState().mediaType === MediaType.AUDIO && !this.isLibrary
                ? 'last-item __audio'
                : 'last-item';
        const selectedItemStyle = this.multiSelectListMediator
            ? this.multiSelectListMediator.getSelectedItemStyle(index)
            : '';
        return isLastItem ? `${selectedItemStyle} ${lastItem}` : selectedItemStyle;
    }

    selectItem(index: number, identifier: bigint, item?: any) {
        // if (item && this.isMobile && !this.disablePlayPreviewOrPlay()) {
        //     this.mobilePreview(item);
        //     return;
        // }

        // no select for audio for amp remote web app
        if (this.mediaType === MediaType.AUDIO && this.disabledActions.disableSelect) return;

        // if (!this.isLibrary && this.configService.device.mode === 'offline') { return; }
        if (!this.isInEditMode && !this.isLibrary && this.configService.device.mode === 'offline') {
            return;
        }

        // Selection conditions
        const noSelectAvailable = !this.delegate.contentIsSelectable();
        const onlyOneSelectAvailable = this.delegate.singleSelectEnabled();
        const itemIsSelected = this.multiSelectListMediator
            ? this.multiSelectListMediator.isSelectedByIdentifier(identifier)
            : null;

        if (noSelectAvailable && this.configService.device.mode !== 'offline') {
            return;
        } else if (onlyOneSelectAvailable) {
            this.multiSelectListMediator.clearSelection();
            if (!itemIsSelected) {
                this.multiSelectListMediator.selectItem(index, identifier);
            }
        } else {
            this.multiSelectListMediator.selectItem(index, identifier);
        }
    }

    isSelected(index) {
        return this.multiSelectListMediator.isSelected(index);
    }

    isDraggable(): boolean {
        return this.delegate.contentIsDraggable();
    }

    dragStarted(event: FilteredItemsWithIndex) {
        this.draggedItem = this.getIndexForPlaylistContent(event)
    }

    drop(event: CdkDragDrop<number, number>) {
        const { container, previousContainer } = event
        const targetIndex = container.data

        let payloadIndex

        // Check to see if the dragged item index is same as the container index, the item was picked from 
        if (previousContainer.data === this.draggedItem) {
            payloadIndex = previousContainer.data
        } else {
            payloadIndex = this.draggedItem
        }
        
        // Check if the container the dragged item is being dropped is different than the container the item was picked from
        if (targetIndex !== payloadIndex) {
            this.multiSelectListMediator.clearSelection()
        }

        this.processListReorder(targetIndex, payloadIndex)
    }

    handleDropEvent(event, targetModel: any): void {
        event.preventDefault();

        const droppedModel = parse(event.dataTransfer.getData('application/json'));
        const targetIndex = this.getIndexForPlaylistContent(targetModel);
        const payloadsIndex = this.getIndexForPlaylistContent(droppedModel);

        this.processListReorder(targetIndex, payloadsIndex);
    }

    getIndexForPlaylistContent(_content: { [key: string]: any }) {
        return _content['index'];
        // return this.scrollContent.findIndex(itemWithIndex => itemWithIndex.contentItem.id == _content.id);
    }

    processListReorder(targetIndex, payloadIndex) {
        if (!this.multiSelectListMediator.hasSelected()) {
            const reorderedContent = [...this.scrollContent];
            // const offset = targetIndex > payloadIndex ? 0 : 1;

            // reorderedContent.splice(targetIndex, 0, reorderedContent[payloadIndex]);
            // reorderedContent.splice(payloadIndex + offset, 1);
            moveItemInArray(reorderedContent, payloadIndex, targetIndex);
            this.delegate.reorderContent(reorderedContent);
        }
    }

    handleDragoverEvent(event, model: any): void {
        event.preventDefault();
    }

    handleDragstartEvent(event, model: any): void {
        event.dataTransfer.setData('application/json', stringify(model));
    }

    // for grid view
    getImgForContent(content): string {
        if (this.configService.device.mode === 'offline') {
            return ampEncodeURI(this.configService.environment.imageServer + getEncodedAMPPath(content) + '/icon.jpg');
        }

        if (isProductPlan(this.damObject)) {
            return this.productService.posterImage(content.name);
        }
        const img = getImgForContentItem(
            content,
            PUBLIC_HTML_SERVER,
            MEDIA_DIRECTORY,
        );
        return img;
    }

    // this can be change to private
    showVideoPreview(contentItem) {
        const modalRef = this.modalService.open(VideoPreviewModalComponent, VirtualScrollViewportComponent.options);
        modalRef.componentInstance.contentItem = contentItem;
        modalRef.componentInstance.artistName = this.getArtistForId(contentItem.artistId);
        modalRef.componentInstance.duration = this.millisToMinutesAndSeconds(contentItem.duration);
    }

    // this can be change to private
    showAudioPreview(contentItem) {
        const modalRef = this.modalService.open(AudioPreviewModalComponent, VirtualScrollViewportComponent.options);
        modalRef.componentInstance.contentItem = contentItem;
        modalRef.componentInstance.artistName = this.getArtistForId(contentItem.artistId);
        modalRef.componentInstance.duration = this.millisToMinutesAndSeconds(contentItem.duration);
    }

    getArtistForId(artistId) {
        return this.artistsMap[artistId] ? this.artistsMap[artistId] : new Artist(-1, '');
    }

    getDuration(item) {
        let duration = item.mediaEnd - item.mediaStart;
        if (duration <= 0) {
            duration = item.duration;
        }
        return this.millisToMinutesAndSeconds(duration);
    }

    showPreview(contentItem) {
        if (this.disablePlayPreviewOrPlay()) {
            return;
        }

        if (this.configService.device.mode === 'offline') {
            //console.log('offline play', contentItem);
            this.configService.offlinePlay$.next(contentItem);
            return;
        }

        if (this.isMobile) {
            this.mobilePreview(contentItem);
            return;
        }

        if (this.mediaType === MediaType.VIDEO) {
            this.showVideoPreview(contentItem);
        } else {
            this.showAudioPreview(contentItem);
        }
    }

    disablePlayPreviewOrPlay() {
        // if is library and media type is audio play and disabledActions?.audioLibPlay is true, return true
        if (this.isLibrary && this.mediaType === MediaType.AUDIO && this.disabledActions?.audioLibPlay) {
            return true;
        }
        // if is library and media type is video play and disabledActions?.videoLibPlay is true, return true
        if (this.isLibrary && this.mediaType === MediaType.VIDEO && this.disabledActions?.videoLibPlay) {
            return true;
        }
        // if is not library and media type is audio play and disabledActions?.audioPlaylistPlay is true, return true
        if (!this.isLibrary && this.mediaType === MediaType.AUDIO && this.disabledActions?.audioPlaylistPlay) {
            return true;
        }

        // if is not library and media type is video play and disabledActions?.videoPlaylistPlay is true, return true
        if (!this.isLibrary && this.mediaType === MediaType.VIDEO && this.disabledActions?.videoPlaylistPlay) {
            return true;
        }
        return false;
    }

    getGenres(item: any): string {
        return this.delegate.getGenres(item)
    }

    hasPromoVideo(item) {
        return item.promoVideoId != null && item.promoVideoId.length > 0;
    }

    calculateWidthOfColumnBasedOnScreenWidth() {
        const offsetWidth =  this.gridContainer.nativeElement.offsetWidth
        let cardWidth = offsetWidth > 840 ? 230 : 220;
        // is small screen
        if(offsetWidth <= 695) {
            cardWidth = 190
        }
        if ((this.gridContainer.nativeElement.offsetWidth <= 576 || this.configService.isMobile()) && !this.isTablet) {
            cardWidth = 160;
        }

        if (this.isTablet || this.isDeskTop) {
            cardWidth = 220
        }
        let cardMargin = 12;
        this.totalCardWidth = cardWidth + cardMargin;
        let width = this.gridContainer.nativeElement.offsetWidth;
        let cols = Math.floor(width / this.totalCardWidth);
        this.numberOfCols = cols;
    }

    visibleGridContent() {
        if (this.listType !== VirtualScrollViewType.GRID) {
            return null;
        }
        let listItems = this.visibleContent();

        var i,
            j,
            temparray = [];
        for (i = 0, j = listItems.length; i < j; i += this.numberOfCols) {
            temparray.push(listItems.slice(i, i + this.numberOfCols));
        }
        // console.log("visibleGridContent ", temparray);
        return temparray;
    }

    /**@deprecated this can be done directly in the templates */
    getRowCssClassName(contentRow: any): string {
        return `d-flex ${contentRow.length !== this.numberOfCols ? 'align-content-around' : 'justify-content-between'}`;
    }

    getRightPadding(contentRow): string {
        return `${contentRow.length !== this.numberOfCols ? this.gridContainer.nativeElement.offsetWidth / this.numberOfCols - 238 : 0}px`;
    }

    /**@deprecated this can done directly in the template */
    getName(name) {
        return name.replace(reIndex, '');
    }

    setItemBufferSize(itemSize: VirtualScrollItemSize) {
        const state = this.configService.stateService.getCurrentState();
        if (state.contentOwner === ContentOwner.SYSTEM && state.mediaType === MediaType.VIDEO) {
            this._itemBufferSize = { maxBufferPx: itemSize * 3, minBufferPx: itemSize * 3 };
        }
    }
    
    getItemProgress(contentItem: any): number {
        if (this.contentProgress?.length === 0) return 0
        let item = this.contentProgress.find(entry => entry.identifier === contentItem.identifier)
        return item.percent
    }

    get itemBufferSize(): { maxBufferPx: number; minBufferPx: number } {
        return this._itemBufferSize;
    }

    get libraryCssName(): string {
        const mb = this.isMobile ? 1 : 2;
        return this.isLibrary ? `library_card_container mb-${mb}` : `playback_card_container mb-${mb}`;
    }

    get generateViewportClassName(): string {
        let baseClassName = 'virtual-viewport-container';
        const playbackContentClassName = `${baseClassName} _playback-content`;
        const systemUserVirtualScrollClassName = `${baseClassName} _system-user-virtual-scroll`;

        if (this.isMobile) {
            baseClassName += ' __mobile';
        }

        if (this.isLibrary) {
            if (this.disableUI) {
                baseClassName += ' __disable-ui';
            }
            return baseClassName;
        }

        const currentState = this.configService.stateService.getCurrentState();
        const contentOwner = currentState.contentOwner;
        const mediaType = currentState.mediaType;

        let returnedClassName = '';
        if (contentOwner === ContentOwner.SYSTEM) {
            returnedClassName = this.productShowing
                ? `${systemUserVirtualScrollClassName} _product-showing`
                : systemUserVirtualScrollClassName;
        } else {
            returnedClassName = this.productShowing
                ? `${playbackContentClassName} _product-showing`
                : playbackContentClassName;
        }
        if (mediaType === MediaType.AUDIO) {
            returnedClassName += ' _audio';
        } else {
            returnedClassName += ' _video';
        }

        return returnedClassName;
    }

    get viewportContainerClass() {
        return this.isLibrary ? 'virtual-viewport __library' : 'virtual-viewport';
    }

    // copied from util.ts, no need to move the whole util to library core
    private millisToMinutesAndSeconds(duration: number) {
        const milliseconds = Math.floor((duration % 1000) / 100),
            seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor(duration / (1000 * 60 * 60));

        const hoursStr = hours < 10 ? '0' + hours : hours;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const secondsStr = seconds < 10 ? '0' + seconds : seconds;

        let timeStr = `${minutesStr}:${secondsStr}`;
        if (hoursStr !== '00') {
            timeStr = `${hoursStr}:${timeStr}`;
        }
        return timeStr;
    }

    isAnyItemSelected(): boolean {
        return this.multiSelectListMediator.getSelected().length > 0;
    }

    /**
     * On shift + arrow up/down, select/deselect the next item in the list
     * @param event The keyboard event. @see {@link KeyboardEvent}
     * @param index The index of the item in the list, used to determine the next item to select
     */
    onKeyDown(event: KeyboardEvent, index: number): void {
        if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            let direction = event.key === 'ArrowDown' ? 1 : -1;
            const newIndex = index + direction;
            if (newIndex >= 0 && newIndex < this._scrollSize) {
                const currentItem = this.scrollContent[newIndex];
                const currentItemElement = document.getElementById(`item-${currentItem.index}`) as HTMLElement;

                // reset
                this.resetPreviousSelect(direction, newIndex);

                if (direction > 0) {
                    this.selectItem(currentItem.index, currentItem.contentItem['identifier']);
                }
                currentItemElement?.focus();
            }
            event.preventDefault();
        }
        this.onCtrlKeyPlusA(event);
    }

    /** Select all playlist content, if ctrKey + A is pressed */
    private onCtrlKeyPlusA(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key.toLowerCase() === 'a' && !this.isLibrary) {
            this.scrollContent.forEach(({ contentItem, index }) => {
                this.selectItem(index, contentItem['identifier']);
            });
            event.preventDefault();
        }
    }

    private resetPreviousSelect(direction: number, newIndex: number): void {
        if (direction < 1) {
            const prevItem = this.scrollContent[newIndex + 1];
            if (this.multiSelectListMediator.getSelectedIdentifiers().includes(prevItem.contentItem['identifier'])) {
                this.selectItem(prevItem.index, prevItem.contentItem['identifier']);
                const previousItemElement = document.getElementById(`item-${prevItem.index}`) as HTMLElement;
                previousItemElement?.focus();
            }
        }
    }

    private mobilePreview(contentItem: { [key: string]: any }) {
        const artistName = this.getArtistForId(contentItem['artistId']);
        const duration = this.millisToMinutesAndSeconds(contentItem['duration']);
        const imgPath = this.getImgForContent(contentItem);
        // signal to the library that close preview is status has changed
        this.configService.updateDetailViewProps({
            ...this.configService.detailViewProps,
            closePlayerPreview: false,
            isPlayAvailable: true,
            data: {
                isAudio: this.mediaType === MediaType.AUDIO,
                contentItem: contentItem,
                artistName: artistName,
                duration: duration,
                imgPath: imgPath,
            },
        });
    }

    showMovieDetails(id: number, event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.router.navigate([`${id}`], { relativeTo: this.route });
    }

}

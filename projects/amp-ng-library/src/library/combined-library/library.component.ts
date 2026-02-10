import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, ContentChild, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { NgClass, NgFor, NgIf, NgStyle, NgTemplateOutlet } from '@angular/common';
import {
    AMPStatus,
    AudioLibraryArtistListItemFactory,
    AudioLibraryGenreListItemFactory,
    breadCrumbSeparator,
    ContentItemType,
    ContentOwner,
    ContentType,
    EAppMode,
    EProduct,
    ETrackingEndPoint,
    FilteredItemsWithIndex,
    GenericStaticListItemFactory,
    GenericTreeListItemFactory,
    getTimeStamp,
    isStaticListItem,
    LibraryItemToPlay,
    LibraryItemType,
    LibraryModalDelegate,
    ListItem,
    ListItemIconConfigFactory,
    MasterViewListItemController,
    MasterViewListMediatorWithTreeState,
    MasterViewOpenTree,
    MasterViewOpenTreeEventDelegate,
    MediaType,
    MultiSelectListMediator,
    NestedMasterViewListMediator,
    sortNestedItems,
    StaticListItemModel,
    UnSub,
    VirtualScrollViewType,
} from '../../ampngcore/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventBusService, LibraryAssetsService, SpinnerService, TrackingService } from '../../ampngcore/service';
import { AMPContentItem, AMPProduct, Artist, Category, DownloadingItem, DownloadingMovie, ListItemConfig, Tag } from '../../ampngcore/models';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ProductFilterDelegate } from '../../ampngcore/components/product-filter/product-filter.delegate';
import { AudioLibraryDelegate } from './audio-library.delegate';
import { map, takeUntil } from 'rxjs/operators';
import { LibraryComponentService } from '../library-component-service';
import { AccountInfoType, EConfigType, IDetailViewProps, LibraryConfigService, MasterViewInjectableItem } from '../library-config-service';
import { AMPProductPlan } from '../../ampngcore/models/product';
import { DelContentConfirmDelegate } from '../../ampngcore/components/master-view-list/generic-del-confirm/generic-del-confirm.delegate';
import {
    DelConfirmProps,
    MasterViewToolbarConfig,
} from '../../ampngcore/components/master-view-list/generic-del-confirm/del-confirm-type';
import { MasterViewToolbarAction } from '../../ampngcore/components/master-view-toolbar/master-view-toolbar-action';
import {
    ActionPopoverController,
    ActionPopoverMediator,
} from '../../ampngcore/components/popovers/action-popover.parent';
import GenericActionPopoverController from '../../ampngcore/components/popovers/generic-popover.controller';
import GenericActionPopoverMediator from '../../ampngcore/components/popovers/generic-popover.mediator';
import { DAMObject } from '../../ampngcore/types/dam-object.type';
import { LibraryDetailHeaderDelegate } from './library-detail-header.delegate';
import { asContentItem, asProduct } from '../../ampngcore/util/type-casting';
import { MobileSongPreviewComponent } from '../../ampngcore/components-mobile/mobile-song-preview/mobile-song-preview.component';
import { AMPEventName, AMPEventType } from '../../ampngcore/protocols/events.protocol';
import { ContentService } from '../../ampngcore/services/content.service';
import { LocationStrategy } from '@angular/common';
import { DamDelegate } from './dam-delegate';
import { TagSelectionModalComponent } from '../../ampngcore/components/tag-selection-modal/tag-selection-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActionPopoverComponent } from '../../ampngcore/components/popovers/action-popover.component';
import { AddContentFormComponent } from '../../ampngcore/components/crud-actions/add-content-form/add-content-form.component';
import { EditContentFormComponent } from '../../ampngcore/components/crud-actions/edit-content-form/edit-content-form.component';
import { MasterViewToolbarComponent } from '../../ampngcore/components/master-view-toolbar/master-view-toolbar.component';
import { GenericToolBarComponent } from '../../ampngcore/components/generic-tool-bar/generic-tool-bar.component';
import { MasterViewListComponent } from '../../ampngcore/components/master-view-list/master-view-list.component';
import { MobileNavComponent } from '../../ampngcore/components-mobile/mobile-nav/mobile-nav.component';
import { MobileNavWrapperComponent } from '../../ampngcore/components-mobile/mobile-nav-wrapper/mobile-nav-wrapper.component';
import { MyContentToggleBaseComponent } from '../../ampngcore/components/my-content-toggle/my-content-toggle-base.component';
import { MediaTypeToggleComponent } from '../../ampngcore/components/media-type-toggle/media-type-toggle.component';
import { ProductFilterComponent } from '../../ampngcore/components/product-filter/product-filter.component';
import { SpinnerComponent } from '../../ampngcore/components/spinner/spinner.component';
import { AudioLibraryDetailComponent } from './audio-lib-detail/audio-lib-detail.component';
import { VideoLibDetailComponent } from './video-lib-detail/video-lib-detail.component';
import { LibraryActionMenuComponent } from '../library-action-menu/library-action-menu.component';

@Component({
    selector: 'amp-library',
    templateUrl: './library.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./library.component.scss'],
    standalone: true,
    imports: [
        NgClass,
        NgFor,
        NgIf,
        NgStyle,
        NgTemplateOutlet,
        TranslateModule,
        ActionPopoverComponent,
        AddContentFormComponent,
        EditContentFormComponent,
        MasterViewToolbarComponent,
        GenericToolBarComponent,
        MasterViewListComponent,
        MobileNavComponent,
        MobileNavWrapperComponent,
        MyContentToggleBaseComponent,
        MediaTypeToggleComponent,
        ProductFilterComponent,
        SpinnerComponent,
        AudioLibraryDetailComponent,
        VideoLibDetailComponent,
        LibraryActionMenuComponent,
    ]
})
export class LibraryComponent
    extends UnSub
    implements
        OnInit,
        OnChanges,
        MasterViewListItemController,
        MasterViewOpenTreeEventDelegate,
        DelContentConfirmDelegate,
        LibraryModalDelegate,
        ProductFilterDelegate,
        AudioLibraryDelegate,
        LibraryDetailHeaderDelegate
{
    DRAFT_STATUS = AMPStatus.DRAFT;
    @Input() mediaType: MediaType;
    @Input() EProduct: EProduct;
    hasToolbar: boolean = true;
    dirtyTimeStamp: number = null

    // List Control & Management
    listItemIconConfigFactory: ListItemIconConfigFactory;
    masterViewListMediator: MasterViewListMediatorWithTreeState;
    masterViewList: Array<ListItem>;
    multiSelectListMediator: MultiSelectListMediator;

    @ViewChild('mobileSongPreviewContainer', { read: ViewContainerRef, static: false })
    mobileSongPreviewContainer: ViewContainerRef;
    @ViewChild('externalViewContainer', { read: ViewContainerRef, static: false }) externalViewContainer: ViewContainerRef;

    static MobilePreview: ComponentRef<any>;

    artists: Array<Artist> = [];
    artistsMap: Map<number, string> = new Map<number, string>();

    // Detail View
    currentTab: string;
    private _filteredTabContent: Array<FilteredItemsWithIndex> = [];
    private _tabContent: Array<FilteredItemsWithIndex> = [];
    config: DelConfirmProps;
    bodyCol: number;
    masterViewCol: number;
    usingLocalApi: boolean;
    contentProgress: DownloadingItem[];

    set tabContent(value: any[]) {
        this._tabContent = value.map((contentItem, index): FilteredItemsWithIndex => ({ index, contentItem }));
    }

    set filteredTabContent(value: any[]) {
        // if object is a dictionary return []
        if (value !== null && value.constructor === Object) {
            this._filteredTabContent = [];
            return;
        }
        if (value.length > 0 && value[0].hasOwnProperty('index')) {
            this._filteredTabContent = value;
            return;
        }
        this._filteredTabContent = value.map((contentItem, index): FilteredItemsWithIndex => ({ index, contentItem }));
    }

    get tabContent(): FilteredItemsWithIndex[] {
        return this._tabContent;
    }

    get filteredTabContent(): FilteredItemsWithIndex[] {
        return this._filteredTabContent;
    }

    listType: VirtualScrollViewType = VirtualScrollViewType.GRID;

    public disableUI: boolean = false;
    public viewSpinner: boolean = false;
    public externalView: { hasAnInjectedItem: boolean, isSelected: boolean } = {
        hasAnInjectedItem: false,
        isSelected: false
    }
    
    public searchFilter = '';
    public productFilters = [];
    public productFiltersVisible = false;
    public serverSearchPhrase = '';
    public shouldClear: boolean;
    public openTree: MasterViewOpenTree;
    public rootParentIndex = 0;
    public currentRootLevelTab = 'Recently Added';
    private defaultTab = 'Recently Added';
    public rootLevelParent: ListItem;
    openTreeTabs: Array<string> = [];

    tags: Tag[];
    allTags: Tag[];

    // only needed for the audio library
    private loadingArtists: boolean;
    combinedSongTags: Array<Tag> = [];

    showHeader = false;
    hasCallBackComponent: boolean = false;
    detailViewProps: IDetailViewProps;
    viewsToShow: { [key: string]: boolean };

    selectedItem: ListItem;

    @Input() isProductTab: boolean = false;

    productPlans: AMPProductPlan[];
    products: AMPProduct[];
    allProducts: AMPProduct[];

    toolBarDelegate: MasterViewToolbarConfig;
    popoverMediator: ActionPopoverMediator;
    delPopoverCtrl: ActionPopoverController;
    addPopoverCtrl: ActionPopoverController;
    editPopoverCtrl: ActionPopoverController;
    movePopoverCtrl: ActionPopoverController;

    damObject: DAMObject;

    videoChannels: AMPContentItem[];
    audioChannels: AMPContentItem[];
    channels: AMPContentItem[];
    series: AMPContentItem[];
    albums: AMPContentItem[];
    songs: AMPContentItem[];
    videos: AMPContentItem[];
    categories: Category[];

    detailViewIcon: string;

    isLoading: boolean = false;
    contentItemIsInEditMode = false;

    damObjectUpdate = false;
    selectedItemId: number;
    isMobile: boolean;
    showSearchbar: boolean = false;
    searchBarCounter: number = 0;
    deviceType: string = ''
    readonly breadCrumbSeparator = breadCrumbSeparator

    protected accountInfo: AccountInfoType;

    //DAM
    @Input() headerTemplate!: TemplateRef<any>;
    @Input() damDelegate: DamDelegate;
    @Input() contentOwner: ContentOwner;
    contentType: ContentType = ContentType.LIBRARY;

    isAudioChannelSelected: boolean
    isVideoLibrarySelected: boolean

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private translate: TranslateService,
        private trackingService: TrackingService,
        private libraryComponentService: LibraryComponentService,
        protected configService: LibraryConfigService,
        private location: LocationStrategy,
        private spinnerService: SpinnerService,
        private eventBus: EventBusService,
        private cdr: ChangeDetectorRef,
        private contentService: ContentService,
        private modalService: NgbModal,
        protected assetsService: LibraryAssetsService,
    ) {
        super();
        this.deviceType = this.configService.device.deviceType + ' ' + this.configService.device.deviceOrientation
        this.masterViewList = [];
        this.configService.resetDetailViewProps();
        this.detailViewProps = this.configService.detailViewProps;
        this.masterViewListMediator = new NestedMasterViewListMediator();
        this.listItemIconConfigFactory = new ListItemIconConfigFactory();
        this.multiSelectListMediator = new MultiSelectListMediator();
        this.configService.multiSelectListMediator = this.multiSelectListMediator;
        this.eventBus.publish({
            eventName: AMPEventName.WS_EVENT,
            eventPayload: {
                eventData: {
                    isMultiSelect: true,
                },
                eventType: AMPEventType.IS_MULTI_SELECT
            },
        });

        this.popoverMediator = new GenericActionPopoverMediator();
        this.delPopoverCtrl = new GenericActionPopoverController();
        this.addPopoverCtrl = new GenericActionPopoverController();
        this.editPopoverCtrl = new GenericActionPopoverController();

        this.handleServiceError = this.handleServiceError.bind(this);
    }
    
    get showLibraryMediaToggle(): boolean {
        const currentRoute = this.router.url;
        // regex to match /dam/library/video, /dam/library/system/video, /library/video, /library/system/video, etc.
        // (system|my) segment is optional to support apps without content mode
        let isValid = false
        if (currentRoute.includes('/library')) {
            const otherAppRegex = new RegExp(`(\\/dam)?\\/library(?:\\/(system|my))?\\/(audio|video)(?:\\/|$)`);
            const webAppRegex = new RegExp(`(\\/dam)?\\/library\\/(system|my)\\/(audio|video)`);
            const regex = this.configService.device.appMode === EAppMode.WEB_APP ? webAppRegex : otherAppRegex;
            isValid = regex.test(currentRoute);
        }
        const result = this.configService.showLibraryMediaToggle && isValid;
        return result;
    }
    
    get deviceTypeNOrientation() {
        return this.configService.deviceTypeNOrientation
    }


    // current handling library action master view toolbar
    onDelContentConfirm(content: { [keyof: string]: any }, contentType: string): void {
        console.log('delete content', content);
    }

    onDelContentCancel(): void {
        // this.delPopoverCtrl.closeActionPopover();
        this.addPopoverCtrl.closeActionPopover();
    }

    onAddOrEditContentSubmit(content: Tag) {
        this.damDelegate.onAddOrEditContentSubmit(content)
        this.addPopoverCtrl.closeActionPopover();
        this.editPopoverCtrl.closeActionPopover();
    }

    onAddOrEditContentCancel() {
        this.addPopoverCtrl.closeActionPopover();
        this.editPopoverCtrl.closeActionPopover();
    }

    setMediaType(): number {
        var mediaType: number;
        if (
            this.selectedItem &&
            (this.selectedItem.getDisplayText() === 'Audio Product Plans' ||
                this.selectedItem.getDisplayText() === 'Audio Products' ||
                this.selectedItem.getInnerModel().mediaType === 2)
        ) {
            return (mediaType = MediaType.AUDIO);
        } else {
            return (mediaType = MediaType.VIDEO);
        }
    }

    onAddProductOrContentItem() {
        const isProductPlanSelected =
            this.selectedItem.isProductPlans ||
            this.selectedItem.getDisplayText() === 'Audio Product Plans' ||
            this.selectedItem.getDisplayText() === 'Video Product Plans';
        const isProductSelected =
            this.selectedItem.isProduct ||
            this.selectedItem.getDisplayText() === 'Audio Products' ||
            this.selectedItem.getDisplayText() === 'Video Products';
        const isVideoChannelSelected =
            this.selectedItem.getInnerModel().type === 5 || this.selectedItem.getDisplayText() === 'Channels';
        const isAudioChannelSelected =
            this.selectedItem.getInnerModel().type === 5 || this.selectedItem.getDisplayText() === 'Channels';
        const isSeriesSelected =
            this.selectedItem.getInnerModel().type === 3 || this.selectedItem.getDisplayText() === 'Series';
        const isAlbumSelected =
            this.selectedItem.getInnerModel().type === 2 || this.selectedItem.getDisplayText() === 'Albums';

        if (this.selectedItem && isProductPlanSelected) {
            const planName = 'New Product Plan';
            const newProductPlan = new AMPProductPlan({
                id: 0,
                identifier: BigInt(0),
                version: 1,
                status: 1,
                editVersion: 0,
                firstPublishedDate: 0,
                lastPublishedDate: 0,
                code: '',
                name: planName,
                description: '',
                renditions: [],
                products: [],
                translations: [],
                imageUrl: '',
                mediaType: this.setMediaType(),
            });
            this.filteredTabContent = [];
            this.currentTab = newProductPlan.name;
            this.damObject = newProductPlan;
            this.showHeader = true;
        } else if (this.selectedItem && isProductSelected) {
            const productName = 'New Product';
            const newProduct = new AMPProduct({
                id: 0,
                identifier: BigInt(0),
                version: 1,
                status: 1,
                editVersion: 0,
                firstPublishedDate: 0,
                lastPublishedDate: 0,
                type: 2,
                code: '',
                name: productName,
                contentBundleId: 0,
                contentBundleItems: [],
                promoVideoId: '',
                idString: '',
                mediaType: this.setMediaType(),
                translations: [
                    {
                        referenceId: 0,
                        language: 'en',
                        displayName: productName,
                        itemDescription: productName,
                        summary: productName,
                    },
                    {
                        referenceId: 0,
                        language: 'de',
                        displayName: productName,
                        itemDescription: productName,
                        summary: productName,
                    },
                ],
                softwareItems: [],
                renditions: [],
                imageUrl: '',
                children: [
                    {
                        artistId: 0,
                        bpm: 0,
                        categoryId: BigInt(0),
                        children: [],
                        createdDate: 0,
                        duration: 0,
                        editVersion: 0,
                        firstPublishedDate: 0,
                        id: 0,
                        identifier: BigInt(0),
                        lastPublishedDate: 0,
                        mediaEnd: 0,
                        mediaStart: 0,
                        musicKeyIn: 0,
                        musicKeyOut: 0,
                        name: productName,
                        promoVideoId: '',
                        publisherId: 0,
                        renditions: [],
                        runtimePath: '',
                        status: 1,
                        tags: [],
                        timelineEvents: [],
                        translations: [],
                        type: 4,
                        version: 1,
                        volumeAdjust: 0,
                        volumeNorm: 0,
                        year: 0,
                    },
                ],
            });
            this.filteredTabContent = [];
            this.currentTab = newProduct.name;
            this.damObject = newProduct;
            this.showHeader = true;
        } else if (this.mediaType === MediaType.VIDEO && this.selectedItem && isVideoChannelSelected) {
            const videoChannelName = 'New Video Channel';
            const newVideoChannel = new AMPContentItem({
                id: 0,
                identifier: BigInt(0),
                version: 1,
                status: 1,
                editVersion: 0,
                firstPublishedDate: 0,
                lastPublishedDate: 0,
                name: videoChannelName,
                categoryId: BigInt(0),
                duration: 0,
                artistId: 0,
                bpm: 0,
                children: [],
                createdDate: 0,
                mediaEnd: 0,
                mediaStart: 0,
                musicKeyIn: 0,
                musicKeyOut: 0,
                promoVideoId: '',
                publisherId: 0,
                renditions: [],
                runtimePath: '',
                tags: [],
                timelineEvents: [],
                translations: [],
                type: 5,
                volumeAdjust: 0,
                volumeNorm: 0,
                year: 0,
            });
            this.filteredTabContent = [];
            this.currentTab = newVideoChannel.name;
            this.damObject = newVideoChannel;
            this.showHeader = true;
        } else if (this.mediaType === MediaType.VIDEO && this.selectedItem && isSeriesSelected) {
            const seriesName = 'New Video Series';
            const newSeries = new AMPContentItem({
                id: 0,
                identifier: BigInt(0),
                version: 1,
                status: 1,
                editVersion: 0,
                firstPublishedDate: 0,
                lastPublishedDate: 0,
                name: seriesName,
                categoryId: BigInt(0),
                duration: 0,
                artistId: 0,
                bpm: 0,
                children: [],
                createdDate: 0,
                mediaEnd: 0,
                mediaStart: 0,
                musicKeyIn: 0,
                musicKeyOut: 0,
                promoVideoId: '',
                publisherId: 0,
                renditions: [],
                runtimePath: '',
                tags: [],
                timelineEvents: [],
                translations: [],
                type: 3,
                volumeAdjust: 0,
                volumeNorm: 0,
                year: 0,
            });
            this.filteredTabContent = [];
            this.currentTab = newSeries.name;
            this.damObject = newSeries;
            this.showHeader = true;
        } else if (this.mediaType === MediaType.VIDEO && this.selectedItem && isAlbumSelected) {
            const albumName = 'New Video Album';
            const newAlbum = new AMPContentItem({
                id: 0,
                identifier: BigInt(0),
                version: 1,
                status: 1,
                editVersion: 0,
                firstPublishedDate: 0,
                lastPublishedDate: 0,
                name: albumName,
                categoryId: BigInt(0),
                duration: 0,
                artistId: 0,
                bpm: 0,
                children: [],
                createdDate: 0,
                mediaEnd: 0,
                mediaStart: 0,
                musicKeyIn: 0,
                musicKeyOut: 0,
                promoVideoId: '',
                publisherId: 0,
                renditions: [],
                runtimePath: '',
                tags: [],
                timelineEvents: [],
                translations: [],
                type: 2,
                volumeAdjust: 0,
                volumeNorm: 0,
                year: 0,
            });
            this.filteredTabContent = [];
            this.currentTab = newAlbum.name;
            this.damObject = newAlbum;
            this.showHeader = true;
        } else if (this.mediaType === MediaType.AUDIO && this.selectedItem && isAudioChannelSelected) {
            const audioChannelName = 'New Audio Channel';
            const newAudioChannel = new AMPContentItem({
                id: 0,
                identifier: BigInt(0),
                version: 1,
                status: 1,
                editVersion: 0,
                firstPublishedDate: 0,
                lastPublishedDate: 0,
                name: audioChannelName,
                categoryId: BigInt(0),
                duration: 0,
                artistId: 0,
                bpm: 0,
                children: [],
                createdDate: 0,
                mediaEnd: 0,
                mediaStart: 0,
                musicKeyIn: 0,
                musicKeyOut: 0,
                promoVideoId: '',
                publisherId: 0,
                renditions: [],
                runtimePath: '',
                tags: [],
                timelineEvents: [],
                translations: [],
                type: 5,
                volumeAdjust: 0,
                volumeNorm: 0,
                year: 0,
            });
            this.filteredTabContent = [];
            this.currentTab = newAudioChannel.name;
            this.damObject = newAudioChannel;
            this.showHeader = true;
        }
    }

    // end of handling library action master view toolbar

    updateSearchTerm?(searchTerm: any): void {
        throw new Error('Method not implemented.');
    }

    ngOnInit(): void {
        this.configService.detailViewPropsListener$.subscribe(detailViewProps => {
            this.detailViewProps = detailViewProps;
            if (
                !detailViewProps.closePlayerPreview &&
                this.mobileSongPreviewContainer &&
                detailViewProps.isPlayAvailable
            ) {
                if (LibraryComponent.MobilePreview) {
                    LibraryComponent.MobilePreview.destroy();
                }
                LibraryComponent.MobilePreview =
                    this.mobileSongPreviewContainer.createComponent(MobileSongPreviewComponent);
                LibraryComponent.MobilePreview.instance.mobilePreview.subscribe(event =>
                    this.handlePreviewCallback(event),
                );
                LibraryComponent.MobilePreview.instance.data = detailViewProps.data;
                this.markForCheck()
            }
        });
        // we can also obtain it from the url parameter
        this.activatedRoute.data.subscribe((params: any) => {
            if (params.mediaType) {
                this.mediaType = params.mediaType;
            }
        });
        setTimeout(() => {
            this.load();
        }, 500);
        if (this.configService.isContentMode()) {
            this.setUpMasterToolBarConfig();
            this.markForCheck()
        }

        this.configService.accountInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe(accountInfo => {
            this.accountInfo = accountInfo;
        });
        this.accountInfo = this.configService.accountInfo;
        this.bodyCol = this.configService.isMobile() ? 12 : 9;
        this.masterViewCol = this.configService.isMobile() ? 12 : 3;
        this.isMobile = this.configService.isMobile();
        this.usingLocalApi = this.configService.device.isUsingLocalApi;

        this.configService.onExternalData.subscribe((tabName: string)=> {
            console.log('on library external data')
            this.addExternalItemsToMasterView(tabName);
            this.disableUI = false;
            this.markForCheck();
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.cdr.markForCheck()
    }

    mobileBackOrMenuClick(e: 'menu' | 'back') {
        if (e === 'menu') {
            this.detailViewProps.isMenuOpen = !this.detailViewProps.isMenuOpen;
        }
    }

    getToolbarStateStyle(): string {
        return !this.masterViewListMediator.isLastItemSelected() ? 'master-view-toolbar--no-item-selected' : '';
    }

    setUpMasterToolBarConfig(): void {
        this.config = {
            other: { name: 'Plan One' },
        };
    }

    getToolbarPopovers() {
        return [
            this.addPopoverCtrl,
            this.editPopoverCtrl
        ];
    }

    getToolbarActions(): Array<MasterViewToolbarAction> {
        const toolbarActionPopovers = this.getToolbarPopovers()

        const isAddContentEnabled = this.selectedItem && this.selectedItemIsEditable()
        const isEditContentEnabled = this.selectedItem && this.selectedItemIsTag();

        const isTagNode = this.selectedItem &&  Number(this.selectedItem.getInnerModel().tagGroupId) === 0 && this.selectedItem.getInnerModel().children.length > 0
        const isMoveContentEnabled = this.selectedItem && this.selectedItem.getInnerModel().hasOwnProperty('tagGroupId') && !isTagNode

        const addContentStateStyle = isAddContentEnabled 
            ? 'master-view-toolbar__toolbar-action__add--enabled' 
            : 'master-view-toolbar__toolbar-action__add--disabled';

        const editContentStateStyle = isEditContentEnabled 
            ? 'master-view-toolbar__toolbar-action__edit--enabled' 
            : 'master-view-toolbar__toolbar-action__edit--disabled';

        const moveContentStateStyle = isMoveContentEnabled
            ? 'master-view-toolbar__toolbar-action__edit--enabled'
            : 'master-view-toolbar__toolbar-action__edit--disabled';

        // add master view actions below and also update LibToolbarWrapperComponent to have the necessary forms and action pop over needed
        return [
            new MasterViewToolbarAction(
                this.assetsService.plusIcon,
                `master-view-toolbar__toolbar-action__add ${addContentStateStyle}`,
                () => this.popoverMediator.openPopover(toolbarActionPopovers, this.addPopoverCtrl)
            ),
            new MasterViewToolbarAction(
                this.assetsService.editIcon,
                `master-view-toolbar__toolbar-action__edit ${editContentStateStyle}`,
                () => this.popoverMediator.openPopover(toolbarActionPopovers, this.editPopoverCtrl)
            ),
            new MasterViewToolbarAction(
                this.assetsService.moveIcon,
                `master-view-toolbar__toolbar-action__edit ${moveContentStateStyle}`,
                () => {
                    this.openMoveModal()
                }
            ),
        ];
    }

    openMoveModal() {
        const modalRef = this.modalService.open(TagSelectionModalComponent, {
            modalDialogClass: `${this.isMobile ? 'mobile' : ''}`,
        });
        modalRef.componentInstance.tags = this.tags;
        modalRef.componentInstance.selectedTag = this.selectedItem.getInnerModel();
        modalRef.componentInstance.eventDelegate = this;
    }

    load() {
        this.configService.resetMasterViewConfig();
        if (this.mediaType === MediaType.AUDIO) {
            this.loadAudio();
            this.loadCategories();
            this.markForCheck();
            return;
        } else if (this.mediaType === MediaType.VIDEO) {
            this.loadVideoLibraryCollection()
                .catch(this.handleServiceError)
                .finally(() => {
                    this.setUpMenuService();
                    this.addExternalItemsToMasterView();
                });
        } else {
            this.currentRootLevelTab = 'Audio Product Plans';
            this.defaultTab = 'Audio Product Plans';
            this.loadProductCollection()
                .catch(this.handleServiceError)
                .finally(() => {
                    this.fetchVideoArtists();
                    this.fetchAudioArtists();
                    this.getChannels();
                    this.loadChannels();
                    this.getProducts();
                    this.setUpMenuService();
                    this.markForCheck();
                });
        }
    }

    loadAudio() {
        this.currentRootLevelTab = 'Recent Songs';
        this.defaultTab = 'Recent Songs';
        this.loadAudioLibraryCollection().finally(() => {
            this.setUpMenuService();
            this.addExternalItemsToMasterView();
        });
    }

    loadProductOrientedLibraries() {
        //const old = this.clearMasterViewList();
        const idx_offset = 0;
        Promise.all([
            this.loadRecentItems(),
            this.loadCategories(),
            this.loadChannels(),
            this.loadSeries(),
            this.loadAlbums(),
            this.loadArtists(),
            this.loadAttributes(),
        ])
            .then(listItemResults => {
                // the lines below are doing the same thing, just the last line is also sorting them after a filter. i left the original line(first line) for now
                listItemResults.forEach((listItem, i) => (this.masterViewList[i + idx_offset] = listItem));
                listItemResults.forEach((listItem, i) => {
                    if (listItem.hasNestedItems()) {
                        sortNestedItems(listItem);
                    }
                    this.masterViewList[i + idx_offset] = listItem;
                });
            })
            .catch(this.handleServiceError)
            .finally(() => {
                // this.getDetailViewForListItem(this.masterViewList[this.rootParentIndex]);
                this.navigateToTab(
                    this.masterViewList[this.rootParentIndex],
                    this.translate.instant(this.masterViewList[this.rootParentIndex].getDisplayText()),
                );
            });
    }

    getProducts(): Promise<any> {
        const SUBSCRIPTION_PRODUCT_TYPE = 2;
        return this.damDelegate.getProducts().then((products) => {
            const filteredProducts = products.filter(p => p.type === SUBSCRIPTION_PRODUCT_TYPE);
            this.allProducts = filteredProducts
            return this.allProducts
        })
    }

    getProductsByMediaType(mediaType: MediaType): Promise<any> {
        return this.damDelegate.getProducts().then((products) => {
            const filteredProducts = products.filter(product => {
                this.mediaType = product.mediaType;
                return product.mediaType === mediaType;
            });
            this.products = filteredProducts;
            const productListTitle = mediaType === MediaType.VIDEO ? 'Video Products' : 'Audio Products';
            return this.buildProductsListItem(filteredProducts, productListTitle);
        })
    }

    getProductPlans(mediaType: MediaType): Promise<any> {
        return this.damDelegate.getProductPlans().then((plans) => {
            const filteredProductPlans = plans.filter(plan => {
                return plan.mediaType === mediaType;
            });
            this.productPlans = filteredProductPlans;
            const productPlanListTitle = mediaType === MediaType.VIDEO ? 'Video Product Plans' : 'Audio Product Plans';
            return this.buildProductPlansListItem(filteredProductPlans, productPlanListTitle);
        })
    }

    buildProductsListItem(products: AMPProduct[], tabName: string): ListItem {
        const productsIconConfig = this.listItemIconConfigFactory.buildListItemImageIconConfig(
            this.assetsService.ampProductIcon,
            this.assetsService.ampProductIconHi,
            {},
            'box-ico',
        );

        const listConfig = new ListItemConfig({
            leftHeading: productsIconConfig,
            left: productsIconConfig,
        });
        const listItem = this.buildListItem(listConfig, tabName, products, 'children');
        listItem.getNestedItems().forEach(child => (child.isProduct = true));
        return listItem;
    }

    buildProductPlansListItem(productPlans: AMPProductPlan[], tabName: string): ListItem {
        const productsIconConfig = this.listItemIconConfigFactory.buildListItemImageIconConfig(
            this.assetsService.ampProductIcon,
            this.assetsService.ampProductIconHi,
            {},
            'box-ico',
        );

        const listConfig = new ListItemConfig({
            leftHeading: productsIconConfig,
            left: productsIconConfig,
        });
        const listItem = this.buildListItem(listConfig, tabName, productPlans, 'children');
        listItem.getNestedItems().forEach(child => (child.isProductPlans = true));
        return listItem;
    }

    loadProductCollection() {
        this.isProductTab = true;
        this.disableUI = true;
        const libraryCollection = [
            this.getProductPlans(MediaType.AUDIO),
            this.getProductPlans(MediaType.VIDEO),
            this.getProductsByMediaType(MediaType.AUDIO),
            this.getProductsByMediaType(MediaType.VIDEO),
        ];

        return Promise.all(libraryCollection)
            .then(
                (listItemResults: ListItem[]) => {
                    // sort top level items
                    listItemResults.forEach(listItem => {
                        if (listItem.hasNestedItems()) {
                            // sort nested items
                            sortNestedItems(listItem);
                        }
                        this.pushToMasterViewList(listItem);
                    });
                },
                e => {
                    console.trace('rejected', +e);
                },
            )
            .catch(this.handleServiceError)
            .finally(() => {
                this.navigateToTab(
                    this.masterViewList[this.rootParentIndex],
                    this.translate.instant(this.masterViewList[this.rootParentIndex].getDisplayText()),
                );
                this.disableUI = false;
                this.markForCheck()
                // this.cdr.detectChanges()
            });
    }

    cancelProductFilter() {
        this.productFiltersVisible = false;
    }

    getAllBundleIds(productIds) {
        this.productFilters = productIds
    }

    applyProductFilter(productBundleIds: number[]) {
        this.productFilters = productBundleIds;
        if (this.masterViewListMediator.isLastItemSelected()) {
            if (!this.isVideoLibrary) {
                this.loadProductOrientedLibraryCollection();
                return;
            }
            this.loadProductOrientedLibraries();
        }
    }

    handleServiceError(error) {
        if (!this.configService.alert) {
            console.error('No alert service found', error);
            return;
        }
        if (error.status === 0) {
            this.configService.alert.error(this.translate.instant('unable-to-connect-to-the-server'));
            return;
        }
        try {
            const response = JSON.parse(error.text());
            this.configService.alert.error(response.responseData);
        } catch (e) {
            this.configService.alert.error(this.translate.instant('unable-to-connect-to-the-server'));
        }
    }

    loadVideoLibraryCollection(): Promise<void> {
        this.disableUI = true;
        const libraryCollection = [
            this.loadRecentItems(),
            this.loadCategories(),
            this.loadChannels(),
            this.loadSeries(),
            this.loadAlbums(),
            this.loadArtists(),
            this.loadVideoAttributes(),
        ];

        return Promise.all(libraryCollection)
            .then(
                (listItemResults: ListItem[]) => {
                    // sort top level items
                    listItemResults.forEach(listItem => {
                        if (listItem.hasNestedItems()) {
                            // sort nested items
                            sortNestedItems(listItem);
                        }
                        this.pushToMasterViewList(listItem);
                    });
                    // this.cdr.markForCheck()
                },
                e => {
                    console.trace('rejected', +e);
                },
            )
            .catch(this.handleServiceError)
            .finally(() => {
                this.navigateToTab(
                    this.masterViewList[this.rootParentIndex],
                    this.translate.instant(this.masterViewList[this.rootParentIndex].getDisplayText()),
                );
                this.markForCheck()
                this.disableUI = false;
            });
    }

    loadRecentItems(): Promise<ListItem> {
        return this.contentService
            .fetchRecentItems(MediaType.VIDEO, this.productFilters)
            .toPromise()
            .then(res => {
                this.videos = res;
                const staticListItemFactory = new GenericStaticListItemFactory();
                const leftHeadingIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.recentIcon,
                    this.assetsService.recentHiIcon,
                    {},
                    'sequence-ico',
                );

                const config = new ListItemConfig({
                    left: leftHeadingIcoConf,
                    leftHeading: leftHeadingIcoConf,
                });

                const listItem = staticListItemFactory.buildListItem(
                    new StaticListItemModel(this.translate.instant('Recently Added'), res),
                    config,
                );

                // this.listItemSelected({event: {}, nestedDepth: 1}, listItem);
                return listItem;
            });
    }

    loadCategories(): Promise<ListItem> {
        return this.contentService
            .fetchCategories(this.mediaType)
            .toPromise()
            .then(res => {
                this.categories = res;
                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.categoryIcon,
                    this.assetsService.categoryHiIcon,
                    {},
                    'sequence-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Categories'), res, 'children');
                return listItem;
            }).finally(() => {
                this.markForCheck()
            });
    }

    loadChannels(): Promise<ListItem> {
        return this.contentService
            .fetchChannels(this.productFilters)
            .toPromise()
            .then(res => {
                this.videoChannels = res;
                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.channelIcon,
                    this.assetsService.channelHiIcon,
                    {},
                    'channel-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Channels'), res, 'children');
                listItem.getNestedItems().forEach(child => (child.isContentItem = true));
                return listItem;
            });
    }

    loadSeries(): Promise<ListItem> {
        return this.contentService
            .fetchSeries(this.productFilters)
            .toPromise()
            .then(res => {
                this.series = res;
                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.seriesIcon,
                    this.assetsService.seriesHiIcon,
                    {},
                    'series-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Series'), res, 'children');
                listItem.getNestedItems().forEach(child => (child.isContentItem = true));
                return listItem;
            });
    }

    loadAlbums(): Promise<ListItem> {
        return this.contentService
            .fetchAlbums(this.productFilters)
            .toPromise()
            .then(res => {
                this.albums = res;
                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.vinylIcon,
                    this.assetsService.vinylHiIcon,
                    {},
                    'album-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Albums'), res, 'children');
                listItem.getNestedItems().forEach(child => (child.isContentItem = true));
                return listItem;
            });
    }

    loadAttributes(): Promise<ListItem> {
        const tagMapper = tag => {
            return new Tag(tag.accountId, tag.id, tag.name, tag.tagGroupId, tag.mediaType, tag.children.map(tagMapper));
        };
        // const contentMode = this.configService.isContentMode();
        // FIXME: Product filters disabled on tags request until server can handle it
        // const fetchTags = contentMode
        //     ? this.contentService.fetchTags()
        //     : this.contentService.fetchTags(this.productFilters);
        const  fetchTags = this.contentService.fetchTags()
        return fetchTags
            .toPromise()
            .then(res => {
                return res.map(tagMapper);
            })
            .then((tags: Tag[]) => {
                this.tags = tags;

                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.attributeIcon,
                    this.assetsService.attributeHiIcon,
                    {},
                    'attribute-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Attributes'), tags, 'children');
                return listItem;
            });
    }

    loadAudioAttributes(): Promise<ListItem> {
        const tagMapper = (tag) => {
            const filteredChildren = (tag.children || []).filter(
                child => child.mediaType === 0 || child.mediaType === 2
            );
        
            return new Tag(
                tag.accountId,
                tag.id,
                tag.name,
                tag.tagGroupId,
                tag.mediaType,
                filteredChildren.map(tagMapper)
            );
        };

        // const contentMode = this.configService.isContentMode();
        // FIXME: Product filters disabled on tags request until server can handle it
        // const fetchTags = contentMode
        //     ? this.contentService.fetchTags()
        //     : this.contentService.fetchTags(this.productFilters);
        const  fetchTags = this.contentService.fetchTags()
        return fetchTags
            .toPromise()
            .then(res => {
                return res
                .filter(node =>
                    (node.children?.length > 0 && node.children.some(child => child.mediaType === 0 || child.mediaType === 2)) ||
                    (!node.children || node.children.length === 0) && (node.mediaType === 0 || node.mediaType === 2)
                )
                .map(tagMapper);
            })
            .then((tags: Tag[]) => {
                this.allTags = tags;
                this.tags = tags;

                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.attributeIcon,
                    this.assetsService.attributeHiIcon,
                    {},
                    'attribute-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Attributes'), tags, 'children');
                return listItem;
            });
    }

    loadVideoAttributes(): Promise<ListItem> {
        const tagMapper = (tag) => {
            const filteredChildren = (tag.children || []).filter(
                child => child.mediaType === 0 || child.mediaType === 1
            );
        
            return new Tag(
                tag.accountId,
                tag.id,
                tag.name,
                tag.tagGroupId,
                tag.mediaType,
                filteredChildren.map(tagMapper)
            );
        };

        // const contentMode = this.configService.isContentMode();
        // FIXME: Product filters disabled on tags request until server can handle it
        // const fetchTags = contentMode
        //     ? this.contentService.fetchTags()
        //     : this.contentService.fetchTags(this.productFilters);
        const  fetchTags = this.contentService.fetchTags()
        return fetchTags
            .toPromise()
            .then(res => {
                console.log(this.categories)
                return res
                .filter(node =>
                    (node.children?.length > 0 && node.children.some(child => child.mediaType === 0 || child.mediaType === 1)) ||
                    (!node.children || node.children.length === 0) && (node.mediaType === 0 || node.mediaType === 1)
                )
                .map(tagMapper);
            })
            .then((tags: Tag[]) => {

                // if (this.isContentMode()) {
                    this.tags = tags;
                // } else {
                //     tags.forEach(t => {
                //         const movies = this.loadContentForTag(t)

                //         console.log(movies)
                //     })
                // }

                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.attributeIcon,
                    this.assetsService.attributeHiIcon,
                    {},
                    'attribute-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Attributes'), tags, 'children');
                return listItem;
            });
    }

    loadArtists(): Promise<ListItem> {
        return this.contentService
            .fetchArtists(this.mediaType)
            .toPromise()
            .then(res => {
                this.makeArtistsMap(res);

                const artistListFactory = new AudioLibraryArtistListItemFactory(this.translate.instant('Artists'));
                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.artistIcon,
                    this.assetsService.artistHiIcon,
                    {},
                    'audio-artist-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });
                const listItem = artistListFactory.buildListItem(this.artists, listConfig);
                return listItem;
            });
    }

    clearMasterViewList(): Array<ListItem> {
        const cachedList = this.masterViewList;
        this.masterViewList = [];
        return cachedList;
    }

    loadContentForArtist(artist: Artist): Promise<any> {
        return this.contentService
            .fetchContentByCategoryTypeAndArtistId(this.mediaType, artist.id, this.productFilters)
            .toPromise();
    }

    getContentItemMovies(contentItemId: number): Promise<any> {
        return this.contentService.fetchContentItemMovies([contentItemId]).toPromise();
    }

    loadContentForTag(tag: Tag): Promise<any> {
        return this.contentService
            .fetchContentByCategoryTypeAndTagID(this.mediaType, tag.id, this.productFilters)
            .toPromise();
    }

    loadContentForCategory(category: Category): Promise<any> {
        return this.contentService
            .fetchContentByCategoryTypeAndCategoryId(this.mediaType, category.id, this.productFilters)
            .toPromise();
    }

    loadContentForProductPlans(id: number): Promise<any> {
        return this.damDelegate.getProductPlans().then((plans) => {
            const productPlan = plans.find(p => p.id === id);
            const products = productPlan.products;
            return products;
        })
    }

    mobileDetailViewToggle(isDetailView = false, showCards = false, data = null) {
        let _detail = this.isMobile && showCards ? false : isDetailView;
        this.configService.updateDetailViewProps({
            isDetailView: _detail,
            showCards: showCards,
            data: data,
            isMenuOpen: false,
            openPath: this.detailViewProps.openPath || '',
            hideMediaToggle: this.configService.detailViewProps.hideMediaToggle,
        });
    }

    mobileHandle(listItem: ListItem, nestedDepth): void {
        if (listItem.hasNestedItems()) {
            let showDetailView = listItem.hasNestedItems() ? false : this.detailViewProps.isDetailView;
            if (this.configService.isMobile()) {
                this.mobileDetailViewToggle(showDetailView, listItem.hasNestedItems(), {});
            }
        }
        const openPath = this.masterViewListMediator.getStringOpenPath(
            this.masterViewList[this.rootParentIndex],
            listItem.getDisplayText(),
        );

        const { pType, identifier, hasChildren } = this.getLibraryItemToPlay(openPath, listItem)
        var libContentToPlay = { identifier, pType, mediaType: this.mediaType, hasChildren: hasChildren }

        if (!this.configService.device.disabledActions.audioLibPlay) {
            // do not send libContentToPlay data if audio lib play is disable, this can be made more concrete
            libContentToPlay = undefined
        }

        this.configService.updateDetailViewProps({
            ...this.configService.detailViewProps,
            openPath: openPath,
            libContentToPlay: libContentToPlay
        });
    }


    mobileOnPartClick(part: string): void {
        // find the index in which the part is located at from openPath and add 1
        const nestedDepth = this.detailViewProps.openPath.split(this.breadCrumbSeparator).indexOf(part);
        this.configService.backIsClicked$.next({
            nestedDepth: nestedDepth + 1,
            part: part,
        });
    }

    isTheLastItem(part: string){
        const indexPart = this.detailViewProps.openPath.split(this.breadCrumbSeparator).indexOf(part);
        const len = this.detailViewProps.openPath.split(this.breadCrumbSeparator).length
        return indexPart+1 === len ? 'last-item' : ''
    }

    toggleMobileSearchBar() {
        this.showSearchbar = !this.showSearchbar;
        this.searchBarCounter++;
    }

    //TODO: once merged with dev-tom, use appDynamically listener derivative
    @HostListener('document:click', ['$event'])
    onClickOutsideContainer(event: MouseEvent) {
        const mobileSearch = document.getElementById('mobile-device-searchbar');
        if (mobileSearch && !mobileSearch.contains(event.target as Node) && this.searchBarCounter > 1) {
            this.toggleMobileSearchBar();
            this.searchBarCounter = 0;
        } else {
            this.searchBarCounter++;
        }
    }

    handlePreviewCallback(e: any) {
        if (e.fullView !== undefined) {
            this.detailViewProps.playFullView = e.fullView;
        } else if (e.close !== undefined) {
            this.configService.resetDetailViewProps();
            LibraryComponent.MobilePreview.destroy();
        }
    }

    async getDetailViewForListItem(listItem: ListItem): Promise<void> {
        this.viewSpinner = true
        this.currentTab = listItem.getDisplayText();
        this.configService.tabChangeSubject.next({
            mediaType: this.mediaType,
            tabName: listItem.getDisplayText(),
        })
        this.mobileDetailViewToggle(true, false, listItem);
        const spinnerTimeout = setTimeout(() => this.libraryComponentService.startLibrarySpinner(), 500);
        this.currentTab = listItem.getDisplayText();
        this.selectedItem = listItem;
        if (this.selectedItem.isProduct && this.selectedItem.getInnerModel().mediaType === 2) {
            this.mediaType = 2;
        }
        this.multiSelectListMediator.clearSelection();
        let tabContentPromise;

        const isProduct = listItem.isProduct;
        const isProductPlans = listItem.isProductPlans;
        const isContentItem =
            [ContentItemType.ALBUM, ContentItemType.SERIES, ContentItemType.CHANNEL].includes(
                listItem.getInnerModel().type,
            ) &&
            listItem.isContentItem &&
            !listItem.isProduct;
        const isCategory = listItem.getInnerModel() instanceof Category;
        const isTag = listItem.getInnerModel() instanceof Tag || listItem.getInnerModel().hasOwnProperty('tagGroupId');
        const isArtist = listItem.getInnerModel() instanceof Artist;
        const isRecentlyAdded = isStaticListItem(listItem);
        const isVideoChannel = [ContentItemType.CHANNEL].includes(listItem.getInnerModel().type) && !this.isAudioLibrary;
        const isAudioChannel = [ContentItemType.CHANNEL].includes(listItem.getInnerModel().type) && this.isAudioLibrary;
        const isAlbum = [ContentItemType.ALBUM].includes(listItem.getInnerModel().type);
        const isSeries = [ContentItemType.SERIES].includes(listItem.getInnerModel().type);

        //setting the detailview icon
        if (isRecentlyAdded) {
            this.detailViewIcon = this.assetsService.recentHiIcon;
        } else if (isCategory) {
            this.detailViewIcon = this.assetsService.categoryHiIcon;
        } else if (isVideoChannel) {
            this.detailViewIcon = this.assetsService.channelHiIcon;
        } else if (isAudioChannel) {
            this.detailViewIcon = this.assetsService.audioChannelHiIcon;
        } else if (isTag) {
            this.detailViewIcon = this.assetsService.attributeHiIcon;
        } else if (isArtist) {
            this.detailViewIcon = this.assetsService.artistHiIcon;
        } else if (isAlbum) {
            this.detailViewIcon = this.assetsService.vinylHiIcon;
        } else if (isSeries) {
            this.detailViewIcon = this.assetsService.seriesHiIcon;
        } else if (isProduct || isProductPlans) {
            this.detailViewIcon = this.assetsService.ampProductIconHi;
        }

        //setting the detailview for listItems
        if (isContentItem || isProduct || isProductPlans) {
            if (this.isContentMode()) {
                this.damObject = await this.getDamObject(listItem);
                this.isLoading = false;
                this.showHeader = true;

                if (isProductPlans) {
                    tabContentPromise = this.loadContentForProductPlans(this.damObject.id);
                } else {
                    let typedDamObject = isContentItem ? asContentItem(this.damObject) : asProduct(this.damObject);
                    tabContentPromise = this.getMoviesFromDamObject(typedDamObject);
                }
            } else {
                tabContentPromise = this.getContentItemMovies(listItem.getInnerModel().id);
            }
        } else if (isCategory) {
            tabContentPromise = this.loadContentForCategory(listItem.getInnerModel());
            this.showHeader = false;
        } else if (isTag) {
            tabContentPromise = this.loadContentForTag(listItem.getInnerModel());
            this.showHeader = false;
        } else if (isArtist) {
            tabContentPromise = this.loadContentForArtist(listItem.getInnerModel());
            this.showHeader = false;
        } else if (isRecentlyAdded) {
            tabContentPromise = Promise.resolve(listItem.getInnerModel().tabContent);
            this.showHeader = false;
        }
        tabContentPromise
            .then(res => {
                clearTimeout(spinnerTimeout);
                res = res.hasOwnProperty('length') && res.length === 1 && Array.isArray(res[0]) ? res[0] : res;
                this.tabContent = res;
                this.filteredTabContent = res;
                this.libraryComponentService.setContentItems(this.filteredTabContent);
                this.libraryComponentService.stopLibrarySpinner();
                this.markForCheck()
            })
            .catch(error => {
                clearTimeout(spinnerTimeout);
                this.libraryComponentService.stopLibrarySpinner();
                this.handleServiceError(error);
            })
            .finally(() => {
                this.viewSpinner = false
            })
            
    }

    getContentForProduct(listItem: ListItem): Promise<any> {
        const contentBundleId = listItem.getInnerModel().contentBundleId;
        return this.contentService.fetchContentItemMovies([contentBundleId]).toPromise();
    }

    /**@deprecated this property can be passed directly in teh templates without needing a function call  */
    getMasterViewList(): Array<ListItem> {
        return this.masterViewList;
    }

    public navigateToTab(listItem: ListItem, tabName: string) {
        if (this.currentRootLevelTab === tabName && tabName === this.defaultTab) {
            this.listItemSelected({ event: {}, nestedDepth: 1 }, listItem);
        } else if (this.currentRootLevelTab === tabName && tabName !== this.defaultTab) {
            // this.masterViewList[this.rootParentIndex].getNestedItems().sort((a, b) => a.getDisplayText().localeCompare(b.getDisplayText()));
            this.masterViewListMediator.setSelectedListItem(listItem, listItem.nestedDepth);

            let lastNavigatedItem;

            try {
                lastNavigatedItem = this.masterViewListMediator.getLastNavigatedListItem(this, listItem);
            } catch (error) {
                console.log(error);
            }

            if (lastNavigatedItem) {
                this.detailViewProps.openPath = this.masterViewListMediator.getStringOpenPath(listItem, lastNavigatedItem.getDisplayText())
                this.getDetailViewForListItem(lastNavigatedItem);
                this.shouldClear = true;
            } else {
                if (this.isProductTab) {
                    listItem.setSelected(false);
                    this.showHeader = false;
                    this.filteredTabContent = [];
                    this.currentTab = '';
                    console.log('last navigated item undefined', lastNavigatedItem);
                } else {
                    listItem.setSelected(false);
                    this.getDetailViewForListItem(this.masterViewList[0]);
                }
            }
        }
    }

    listItemSelected(eventPayload, listItem, shouldUpdateLastNavigation = true) {

        this.isItemExternal(listItem);

        const alreadySelected =
            (!listItem.hasNestedItems() &&
                listItem.getInnerModel().identifier &&
                listItem.getInnerModel().identifier === this.selectedItem.getInnerModel().identifier &&
                listItem.getInnerModel().editVersion === this.selectedItem.getInnerModel().editVersion &&
                listItem.getInnerModel().status === this.selectedItem.getInnerModel().status) ||
            (!listItem.hasNestedItems() && listItem.isSelected());

        if (alreadySelected) {
            return;
        }

        this.selectedItem = listItem;
        
        //conditions for toggling mediaType
        if (this.isProductTab && this.selectedItem) {
            // Always set mediaType to 1 (video) for product plans or video-related products to display in video grid format.
            const displayText = this.selectedItem.getDisplayText();
            const mediaType = this.selectedItem.getInnerModel().mediaType;

            if (displayText.includes('Video Products') || displayText.includes('Audio Products') || displayText.includes('Product Plans')) {
                this.showHeader = false
                this.filteredTabContent = [];
                this.currentTab = '';
            } else if (this.selectedItem.isProductPlans || mediaType === 1) {
                this.mediaType = 1
            } else if (mediaType === 2) {
                this.mediaType = 2
            }
        }

        if (shouldUpdateLastNavigation && this.shouldClear) {
            const isRootTab = this.selectedItem.nestedDepth === 1

            if (isRootTab) {
                this.openTree.listItem.setSelected(false);
                this.masterViewListMediator.resetList(
                    this.masterViewList,
                    this.openTree.listItem,
                    this,
                    listItem.getDisplayText() === this.defaultTab,
                );
                this.shouldClear = false;
            } else if (this.selectedItem.isFolder) {
                this.masterViewListMediator.resetList(
                    this.masterViewList,
                    this.openTree.listItem,
                    this,
                    listItem.getDisplayText() === this.defaultTab,
                );
                this.shouldClear = false;
            } else {
                this.masterViewListMediator.resetList(
                    this.masterViewList,
                    this.openTree.listItem,
                    this,
                    listItem.getDisplayText() === this.defaultTab,
                );
                this.shouldClear = false;
            }
        }

        // update root level index if different
        if (this.currentRootLevelTab !== listItem.getDisplayText() && eventPayload.nestedDepth === 1) {
            if (this.openTree) {
                this.masterViewListMediator.resetList(this.masterViewList, this.openTree.listItem, this, listItem.getDisplayText() === this.defaultTab)
            }
            this.rootParentIndex = this.masterViewList.findIndex(
                item => item.getDisplayText() === listItem.getDisplayText(),
            );
            this.currentRootLevelTab = listItem.getDisplayText();
        }
        this.masterViewListMediator.setSelectedListItem(listItem, eventPayload.nestedDepth);

        if (!listItem.hasNestedItems()) {
            if (!alreadySelected) {
                if (this.externalView.isSelected) {
                    this.listType = VirtualScrollViewType.LIST;
                    this.disableUI = true;
                } else {
                    if (this.mediaType === MediaType.VIDEO){
                        this.listType = VirtualScrollViewType.GRID;
                    }
                    this.contentProgress = []
                    this.getDetailViewForListItem(listItem);
                }
            }
        }

        // update last navigated item, always unless if we re-navigating to the same tab after applying filters
        if (shouldUpdateLastNavigation && listItem.getDisplayText() !== this.currentRootLevelTab) {
            this.masterViewListMediator.updateLastItems(listItem, this);
        }

        // if (this.isMobile) {
            this.mobileHandle(listItem, eventPayload.nestedDepth);
        // }

        this.isAudioChannelSelected = this.isContentMode() && this.isAudioLibrary && this.selectedItem.getInnerModel().type === 5
        this.isVideoLibrarySelected = this.isContentMode() && this.isVideoLibrary;
    }

    buildListItem(config, header, model, childKey) {
        const ListFactory = new GenericTreeListItemFactory(header, childKey);
        return ListFactory.buildListItem(model, config);
    }

    pushToMasterViewList(listItem): void {
        this.masterViewList.push(listItem);
        // this.cdr.markForCheck()
    }

    // Detail View Handling

    handleDetailListViewTypeToggle(event) {
        if (event.target.id == VirtualScrollViewType.LIST || event.target.classList.contains('img--list')) {
            this.listType = VirtualScrollViewType.LIST;
        } else if (event.target.id == VirtualScrollViewType.GRID || event.target.classList.contains('img--grid')) {
            this.listType = VirtualScrollViewType.GRID;
        }
        this.cdr.detectChanges();
    }

    success() {
        // Promise.all([this.loadPlaylists(), this.loadVideoPlaylistFolders()]).then(res => {
        //     // this.buildPlaylistList();
        // });
    }

    onSearchChange(event) {
        this.multiSelectListMediator.clearSelection();
        let listItems;
        if (this.searchFilter !== '') {
            let fltFnc = this.getFilterFunc();
            listItems = this.tabContent.filter(itemWithIndex => fltFnc(itemWithIndex.contentItem));
        } else {
            listItems = this.tabContent;
        }

        this.filteredTabContent = listItems;
        this.libraryComponentService.setContentItems(listItems);

        if (this.searchFilter.length >= 3) {
            this.configService.trackingService?.writeTrackingData(
                ETrackingEndPoint.endPointTrackSiteSearch,
                'Internal library search',
                this.searchFilter,
                listItems.length,
            );
        }
    }

    getFilterFunc() {
        return (entry: FilteredItemsWithIndex | any) => {
            const item = entry.hasOwnProperty('index') ? entry.contentItem : entry;
            return (
                item.name.toLowerCase().includes(this.searchFilter.toLowerCase()) ||
                this.getArtistForId(item.artistId).name.toLowerCase().includes(this.searchFilter.toLowerCase())
            );
        };
    }

    getArtistForId(artistId) {
        const foundArtist = this.artists.find(artist => artist.id === artistId);
        return foundArtist ? foundArtist : new Artist(-1, '');
    }

    queryServerSearch() {
        // if serverSearchPhrase is empty return
        if (!this.serverSearchPhrase) return;

        const text = this.isVideoLibrary ? 'Video Library Search Items' : 'Audio Library Search Items';
        this.configService.trackingService?.trackEvent(text, 'search');
        // reset selected items
        this.multiSelectListMediator.clearSelection();
        this.disableUI = true;

        if (this.serverSearchPhrase.length > 0) {
            this.contentService
                .searchServer(this.serverSearchPhrase, this.mediaType, this.productFilters)
                .toPromise()
                .then(res => {
                    if (this.masterViewListMediator.isLastItemSelected()) {
                        this.masterViewListMediator.setSelectedListItem(
                            this.masterViewListMediator.getLastSelectedItem(),
                            0,
                        );
                    }
                    this.showHeader = false;
                    this.currentTab = 'Search results';
                    this.filteredTabContent = res;
                    this.tabContent = res;
                    this.selectedItem = null;
                    this.libraryComponentService.setContentItems(this.filteredTabContent);
                    this.configService.trackingService?.trackSiteSearch(
                        this.serverSearchPhrase,
                        'Server Search',
                        res.length,
                    );
                    this.disableUI = false;
                    this.cdr.markForCheck()
                });
        }
    }

    toggleProductFilterPanel() {
        const productsDiv = document.getElementById('products-panel-body');
        if (productsDiv.style.display !== 'flex') {
            productsDiv.style.display = 'flex';
            document.getElementById('tog-btn').innerHTML = this.translate.instant('Hide Products');
        } else {
            productsDiv.style.display = 'none';
            document.getElementById('tog-btn').innerHTML = this.translate.instant('Show Products');
        }
    }

    isContentMode(): boolean {
        return this.configService.isContentMode();
    }

    makeArtistsMap(artists: Artist[]) {
        this.artists = artists;
        for (const artist of artists) {
            this.artistsMap[artist.id] = artist.name;
        }
    }

    fetchAudioArtists() {
        this.contentService
            .fetchArtists(2)
            .toPromise()
            .then((artists: Artist[]) => {
                this.makeArtistsMap(artists);
            })
            .finally(() => {
                this.loadingArtists = false;
            });
    }

    fetchVideoArtists() {
        this.contentService
            .fetchArtists(1)
            .toPromise()
            .then((artists: Artist[]) => {
                this.makeArtistsMap(artists);
            })
            .finally(() => {
                this.loadingArtists = false;
            });
    }

    updateLibrary() {
        this.masterViewList = [];
        this.masterViewListMediator.clear();

        if (this.isProductTab) {
            return this.loadProductCollection();
        } else {
            if (this.mediaType === MediaType.VIDEO) {
                return this.loadVideoLibraryCollection();
            } else {
                return this.loadAudioLibraryCollection();
            }
        }
    }

    get isVideoLibrary(): boolean {
        return this.mediaType === MediaType.VIDEO;
    }

    get isAudioLibrary(): boolean {
        return this.mediaType === MediaType.AUDIO;
    }

    get productFilterType() {
        return this.isVideoLibrary ? EProduct.VIDEO_LIBRARY : EProduct.AUDIO_LIBRARY;
    }

    loadAudioLibraryCollection(): Promise<void> {
        this.disableUI = true;
        const libraryCollection = [
            this.getRecentSongs(), 
            this.getAllArtists(), 
            this.getChannels(), 
            this.loadAudioAttributes()
        ];

        return Promise.all(libraryCollection)
            .then(
                (listItemResults: ListItem[]) => {
                // sort top level items
                listItemResults.forEach(listItem => {
                    // if (listItem.hasOwnProperty('tags')) {
                    //     listItem.tags.forEach(item => {
                    //         sortNestedItems(item);
                    //         this.pushToMasterViewList(item);
                    //     });
                    // } 
                    // else {
                    if (listItem.hasNestedItems()) {
                        sortNestedItems(listItem);
                    }
                    this.pushToMasterViewList(listItem);
                    // }
                });
            })
            .catch(this.handleServiceError)
            .finally(() => {
                this.navigateToTab(
                    this.masterViewList[this.rootParentIndex],
                    this.masterViewList[this.rootParentIndex].getDisplayText(),
                );
                this.markForCheck()
                this.disableUI = false;
            });
    }

    getRecentSongs(): Promise<ListItem> {
        return this.contentService
            .fetchRecentItems(MediaType.AUDIO, this.productFilters)
            .toPromise()
            .then(recentsongs => {
                this.songs = recentsongs;
                const recentSongsTab = this.translate.instant('Recent Songs');
                return this.buildRecentlyPlayedItem(recentsongs, recentSongsTab);
            });
    }
    
    buildRecentlyPlayedItem(recentSongs, tabName): ListItem {
        const staticListItemFactory = new GenericStaticListItemFactory();

        const listItemIconConfigFactory: ListItemIconConfigFactory = new ListItemIconConfigFactory();
        const leftHeadingIcoConf = listItemIconConfigFactory.buildListItemImageIconConfig(
            this.assetsService.recentIcon,
            this.assetsService.recentHiIcon,
            {},
            'sequence-ico',
        );

        const config = new ListItemConfig({
            left: leftHeadingIcoConf,
            leftHeading: leftHeadingIcoConf,
        });
        const listItem = staticListItemFactory.buildListItem(new StaticListItemModel(tabName, recentSongs), config);
        return listItem;
    }

    getAllArtists(): Promise<ListItem> {
        if (this.loadingArtists) {
            return null;
        }

        this.loadingArtists = true;
        return this.contentService
            .fetchArtists(2)
            .toPromise()
            .then((artists: Artist[]) => {
                this.makeArtistsMap(artists);
                return this.buildArtistsList(this.artists);
            })
            .finally(() => {
                this.loadingArtists = false;
            });
    }

    getChannels(): Promise<ListItem> {
        return this.contentService
            .fetchChannels(this.productFilters, 2)
            .toPromise()
            .then(res => {
                this.audioChannels = res;
                const leftIcoConf = this.listItemIconConfigFactory.buildListItemImageIconConfig(
                    this.assetsService.audioChannelIcon,
                    this.assetsService.audioChannelHiIcon,
                    {},
                    'channel-ico',
                );

                const listConfig = new ListItemConfig({
                    leftHeading: leftIcoConf,
                    left: leftIcoConf,
                });

                const listItem = this.buildListItem(listConfig, this.translate.instant('Channels'), res, 'children');
                listItem.getNestedItems().forEach(child => (child.isContentItem = true));
                return listItem;
            });
    }

    buildArtistsList(artists: Artist[]) {
        const artistListFactory = new AudioLibraryArtistListItemFactory(this.translate.instant('Artists'));
        const listItemIconConfigFactory = new ListItemIconConfigFactory();
        const leftHeadingIcoConf = listItemIconConfigFactory.buildListItemImageIconConfig(
            this.assetsService.artistIcon,
            this.assetsService.artistHiIcon,
            {},
            'audio-artist-ico',
        );

        const artistsListConfig = new ListItemConfig({
            leftHeading: leftHeadingIcoConf,
            left: leftHeadingIcoConf,
        });

        return artistListFactory.buildListItem(artists, artistsListConfig);
    }

    getTags(): Promise<any> {
        // No product filters are used when in content mode
        const contentMode = this.isContentMode();
        // FIXME: Product filters disabled on tags request until server can handle it
        // const fetchTags = contentMode
        //     ? this.contentService.fetchTags()
        //     : this.contentService.fetchTags(this.productFilters);
        const  fetchTags = this.contentService.fetchTags()

        return fetchTags.toPromise().then((tags: Tag[]) => {
            this.allTags = tags;
            const relevantGenreTags = ['hits', 'type', 'genre', 'language', 'mood'];
            const searchTags = ['genre'];
            var result = { tags: [] };
            tags.forEach(tagGroup => {
                relevantGenreTags.forEach(rTag => {
                    if (tagGroup.name.toLowerCase() === rTag) {
                        result.tags.push(this.getGenresList(tagGroup.name, tagGroup.children));
                    }
                });

                if (searchTags.includes(tagGroup.name.toLowerCase())) {
                    this.combinedSongTags = [...this.combinedSongTags, ...this.flattenGenres(tagGroup.children)];
                }
            });
            return result;
        });
    }

    getGenresList(heading, genres) {
        const listItemIconConfigFactory: ListItemIconConfigFactory = new ListItemIconConfigFactory();
        const genreListFactory = new AudioLibraryGenreListItemFactory(this.translate.instant(heading));

        const leftHeadingIcoConf = listItemIconConfigFactory.buildListItemImageIconConfig(
            this.assetsService.attributeIcon,
            this.assetsService.attributeHiIcon,
            {},
            'sequence-ico',
        );

        const leftIcoConf = listItemIconConfigFactory.buildListItemImageIconConfig(
            this.assetsService.attributeIcon,
            this.assetsService.attributeHiIcon,
            {},
            'sequence-ico',
        );

        const genresListConfig = new ListItemConfig({
            leftHeading: leftHeadingIcoConf,
            left: leftIcoConf,
        });

        return genreListFactory.buildListItem(genres, genresListConfig);
    }

    flattenGenres(genres): Array<Tag> {
        return genres.concat(genres.flatMap(e => this.flattenGenres(e.children || [])));
    }

    getGenresFromTags(tags: Tag[]): string {
        if (this.isContentMode()) {
            // Content mode: return all tag names
            return tags.map(t => t.name).join(', ');
        }
    
        // User mode: only include tags that are children of the "Genre" group
        const genreGroup = this.tags.find(t => t.name === 'Genre');
        const genreChildren = this.flattenGenres(genreGroup.children);
        const genreChildIds = new Set(genreChildren.map(tag => tag.id));
        const genreTags = tags.filter(tag => genreChildIds.has(tag.tagGroupId));

        return genreTags.map(t => t.name).join(', ');
    }
    
    

    loadProductOrientedLibraryCollection() {
        const idx_offset = 0;
        Promise.all([this.getRecentSongs(), this.getAllArtists(), this.getChannels(), this.getTags()])
            .then(listItemResults => {
                listItemResults.forEach((listItem, i) => {
                    if (listItem.hasOwnProperty('tags')) {
                        listItem.tags.forEach((item, j) => {
                            this.masterViewList[i + idx_offset + j] = item;
                        });
                    } else {
                        this.masterViewList[i + idx_offset] = listItem;
                    }
                });
            })
            .catch(this.handleServiceError)
            .finally(() => {
                this.navigateToTab(
                    this.masterViewList[this.rootParentIndex],
                    this.masterViewList[this.rootParentIndex].getDisplayText(),
                );
            });
    }

    isDraft(listItem: ListItem) {
        return listItem && listItem.getInnerModel().status
            ? listItem.getInnerModel().status === AMPStatus.DRAFT
            : false;
    }

    //************************************** Configuration for the Library Menu Service **************************************//
    setUpMenuService(): void {
        let config = this.configService.getConfig();
        if (config) {
            if (config.configType === EConfigType.NormalMode) {
                this.libraryComponentService.configDropDownMode({
                    mediaType: this.mediaType,
                    multiSelectListMediator: this.multiSelectListMediator,
                    contentItems: this.filteredTabContent,
                });
                this.hasCallBackComponent = true;
            } else if (config.configType === EConfigType.EditMode) {
                this.libraryComponentService.configContentMode({
                    multiSelectListMediator: this.multiSelectListMediator,
                    contentItems: this.filteredTabContent,
                    artists: this.artists,
                    tags: this.tags || this.allTags,
                    mediaType: this.mediaType,
                });
                this.hasCallBackComponent = true;
            }
        }
        this.subscribeToUpdateLibrary();
        this.subscribeToDisableUI();
    }

    subscribeToUpdateLibrary(): void {
        this.libraryComponentService.updateLibObservable
            .pipe(takeUntil(this.unsubscribe$))

            .subscribe((updateLibrary: boolean) => {
                if (updateLibrary) {
                    this.updateLibrary().then(() => this.libraryComponentService.finishLibraryUpdate());
                }
            });
    }

    subscribeToDisableUI() {
        this.libraryComponentService.librarySpinner$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((disableUI: boolean) => {
                this.disableUI = disableUI;
            });
    }

    get libraryCssClassName(): string {
        const cssClass = 'row atmosphere-workspace-container';
        return this.disableUI ? `${cssClass} __disable-ui` : cssClass;
    }

    getDamObject(selectedItem: ListItem): Promise<DAMObject> {
        this.isLoading = true;
        return this.damDelegate.getDamObject(selectedItem).then((deepContent: DAMObject) => {
            return deepContent
        });
    }

    showActionMenu(): boolean {
        if (this.isProductTab) {
            return this.hasCallBackComponent;
        } else {
            return this.hasCallBackComponent && (this.allTags != undefined || this.tags != undefined);
        }
    }

    updateMasterViewListSelection(damObject: DAMObject) {
        this.selectedItemId = damObject.id;
        this.damObjectUpdate = true;
    }

    getMoviesFromDamObject(damObject: AMPProduct | AMPContentItem): Promise<AMPContentItem[]> {
        const movies: AMPContentItem[] = [];

        // Recursive function to traverse the tree structure
        const traverse = (node: AMPProduct | AMPContentItem) => {
            if (node.hasOwnProperty('children') && node.children.length > 0) {
                node.children.forEach(child => traverse(child));
            } else if (node.type === ContentItemType.MOVIE) {
                movies.push(asContentItem(node));
            }
        };

        // Start traversal from the root node
        traverse(damObject);

        // Resolve the accumulated results as a promise
        return Promise.resolve(movies);
    }

    publishObject() {
        if (this.multiSelectListMediator.getSelectedIdentifiers().length !== 1) {
            console.error('selectedIdentifiers not equal to 1');
        } else {
            const selectedMovieIdentifier: bigint = this.multiSelectListMediator.getSelectedIdentifiers()[0];
            this.damDelegate.publishObject(selectedMovieIdentifier)
        }
    }

    isShowingPublishButton(): boolean {
        if (this.multiSelectListMediator.getSelectedIdentifiers().length === 1) {
            const contentItems: AMPContentItem[] = this.tabContent.map(item => item.contentItem as AMPContentItem);
            const selectedItemIdentifier: bigint = this.multiSelectListMediator.getSelectedIdentifiers()[0];
            const selectedItem = contentItems.find(item => item.identifier === selectedItemIdentifier);
            if (!selectedItem) {
                console.error('selected item identifier not found');
                return false;
            } else {
                return selectedItem.status === this.DRAFT_STATUS;
            }
        } else {
            return false;
        }
    }

    private isExactTArtist(obj: any) {
        return (
            typeof obj === "object" &&
            obj !== null &&
            typeof obj.name === "string" &&
            typeof obj.id === "number" &&
            Object.keys(obj).length === 2
        );
    }

    private getLibraryItemToPlay(openPath: string, listItem: ListItem) {
        const innerModel = listItem.getInnerModel();
        let pType = null;
        let identifier = innerModel.id;
        let hasChildren = listItem.hasNestedItems();
    
        if (openPath.includes(LibraryItemType.Categories)) {
            pType = LibraryItemToPlay.Category;
        } else if (listItem.isContentItem) {
            pType = LibraryItemToPlay.ContentItem;
            identifier = innerModel.identifier;
        } else if (listItem.getDisplayText().includes(LibraryItemType.Recent)) {
            pType = LibraryItemToPlay.Recent;
        } else if (LibraryItemType.TagGroups in innerModel) {
            pType = LibraryItemToPlay.Attribute;
        } else if (this.isExactTArtist(innerModel)) {
            pType = LibraryItemToPlay.Artists;
        } else if ((
            openPath.includes(LibraryItemType.Channels) || 
            openPath.includes(LibraryItemType.Series) || 
            openPath.includes(LibraryItemType.Albums) ||
            openPath.includes(LibraryItemType.Artists) ||
            openPath.includes(LibraryItemType.Attributes)
        ) && this.mediaType === MediaType.VIDEO) {
            pType = LibraryItemToPlay.ContentItem;
        }
    
        return { pType, identifier, hasChildren };
    }
    
    private markForCheck() {
        this.dirtyTimeStamp = getTimeStamp();
        this.cdr.markForCheck()
    }

    /** these are the items added to the master view of teh library through configuration in the client app */
    private buildInjectableMasterViewItem(item: MasterViewInjectableItem, tabContent: any[]): ListItem {
        const staticListItemFactory = new GenericStaticListItemFactory();

        const listItemIconConfigFactory: ListItemIconConfigFactory = new ListItemIconConfigFactory();
        const leftHeadingIcoConf = listItemIconConfigFactory.buildListItemImageIconConfig(
            item?.iconPath?.unselected || this.assetsService.recentIcon,
            item?.iconPath?.selected || this.assetsService.recentHiIcon,
            {},
            'sequence-ico',
        );

        const config = new ListItemConfig({
            left: leftHeadingIcoConf,
            leftHeading: leftHeadingIcoConf,
        });
        const listItem = staticListItemFactory.buildListItem(new StaticListItemModel(item.name, tabContent), config);
        return listItem;
    }

    private addExternalItemsToMasterView(tabName?: string): void {
        let masterViewConfig = this.configService.getMasterViewConfig();

        if (masterViewConfig.length > 0) {
            masterViewConfig.forEach(config => {
                if (config.mediaType === this.mediaType) {
                    let tabContent = config.tabContent.map((e: DownloadingMovie) => e.movie)
                    this.contentProgress = config.tabContent.map((e: DownloadingMovie) => {
                        return {
                            percent: e.percent,
                            identifier: e.movie.identifier
                        }
                    })
                    const listitem = this.buildInjectableMasterViewItem({
                        name: config.name,
                        iconPath: config.iconPath,
                    }, tabContent);
                    
                    let itemIndex = this.masterViewList.findIndex(item => item.getDisplayText() === config.name);
                    if (itemIndex >= 0) {
                        this.masterViewList[itemIndex] = listitem;
                    } else {
                        if (config.position === 'top') {
                            this.masterViewList.unshift(listitem)
                        }
                        else if (config.position === 'bottom') {
                            this.masterViewList.push(listitem)
                        }
                    }
                    if (config.tabContent && tabName === config.name) {
                        this.tabContent = tabContent;
                        this.filteredTabContent = tabContent;
                        this.masterViewListMediator.setSelectedListItem(listitem, 1)
                    }
                }
            })
        }
    }

    private isItemExternal(listItem: any) {
        if (this.configService.getMasterViewConfig().length === 0) return;
        const tabName = (listItem as ListItem).getDisplayText()
        if (this.configService.isSelectedItemExternal(tabName)) {
            this.externalView = {
                ...this.externalView,
                isSelected: true
            };
            this.configService.masterViewCallbackSubject.next({
                itemName: (listItem as ListItem).getDisplayText(),
                mediaType: this.mediaType
            });
        } else {
            this.externalView = {
                ...this.externalView,
                isSelected: false,
            };
        }
    }

    selectedItemIsEditable() {
        return this.selectedItem.getInnerModel().type === ContentItemType.CHANNEL || 
        this.selectedItem.getInnerModel().type === ContentItemType.ALBUM || 
        this.selectedItem.getInnerModel().type === ContentItemType.SERIES ||
        this.selectedItem.getDisplayText() === 'Attributes' ||
        this.selectedItem.getInnerModel().hasOwnProperty('tagGroupId')
    }

    selectedItemIsTag() {
        return this.selectedItem.getInnerModel() instanceof Tag || this.selectedItem.getInnerModel().hasOwnProperty('tagGroupId');
    }

    selectedItemIsTagFolder() {
        return this.selectedItem.getDisplayText() === 'Attributes'
    }

    get isMyContentNotImplemented(): boolean {
        return this.contentOwner === ContentOwner.MY;
    }
    
    
}

import { HttpHeaders } from '@angular/common/http';
import { Injectable, Type, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {
    AppMode,
    DisableActions,
    EAppMode,
    ITracking,
    LibraryItemToPlay,
    MasterViewToolbarConfig,
    MediaType,
    MultiSelectList,
    TEnvConfig,
} from '../ampngcore/core';
import { AMPContentItem, AMPProduct } from '../ampngcore/models';
import { AMPProductPlan } from '../ampngcore/models/product';
import { ContentServiceMethod } from '../ampngcore/services/content.service';
import { AMPState } from '../ampngcore/services/state.service';

type EnvironmentType = {
    server: string;
    clientId: string;
    clientSecret: string;
    imageDirectory: string;
    imageServer: string;
    stripeAPIKey: string;
    wsProtocols: string[];
    prodMode?: boolean;
    wsServer?: string;
};

export type AccountInfoType = {
    accountId: string;
    contentMode: boolean;
    isAdmin: boolean;
    token: string;
    language: string;
    email: string;
    supportedLanguages: string[];
};

/** ref to alert service/class/object/containing these methods */
type Alert = {
    success(message: string, options?: any): void;
    error(message: string, options?: any): void;
    info?(message: string, options?: any): void;
    warn?(message: string, options?: any): void;
};

/**
 * This is the interface for the library config service.
 *
 * Only documented th necessary methods, all other methods should be self
 * explanatory based on the method name.
 */
interface ILibraryConfig {
    /**
     * @param alert alert service configuration object/service/class
     *  - success and error are required
     *  - all other methods are optional
     */
    configAlert(alert: any): void;

    /**
     * The library config service necessitates certain parameters. Some of these are utilized by the `audioLibrary`
     * service, while others, like `imageDirectory`, are used for product filtering in the dashboard/library.
     */
    setEnvironment(
        server: string,
        clientId: string,
        clientSecret: string,
        imageDirectory: string,
        imageServer: string,
        stripeAPIKey: string,
        wsProtocols: string[],
        publicHTMLServer: string,
        mediaServer: string,
        wsServer?: string,
    ): void;

    /**
     * Similar to the `setEnvironment` method, this method is used for configuring account information and is utilized across various library services.
     */
    setAccountInfo(
        accountId: string,
        contentMode: boolean,
        token: string,
        language: string,
        email: string,
        isAdmin: boolean,
        supportedLanguages: string[],
    ): void;

    /**
     * This is required by the library to decide the CSS to be applied to audio/video cards and playlists.
     * @param stateService This is a configuration object/service/class reference for the state service.
     */
    setStateService(stateService: any): void;

    /** Dam service reference. this approach allows us to implement a dam service independent of the library and still allow the library to use it */
    setDamService(damService: any): void;

    /**
     * Configuration for the library menu component
     * @param config configuration object for the library menu component
     */
    configLibraryMenu(config: AMPNgLibraryConfigType): void;

    setAccountService(accountService: any): void;
    
    isSelectedItemExternal(text: string): boolean;
    getExternalDetailViewItemCount(): number
    isLibraryAudioOrVideoActive(): boolean;    
    
}

/** This is a reference to the state service.*/
interface StateServiceRef {
    getCurrentState(): AMPState;
}

/** This is a reference to the DAM service. */
interface DamServiceRef {
    fetchProducts(): Observable<AMPProduct[]>;

    fetchProductPlans(): Observable<AMPProductPlan[]>;

    editProductPlan(plan: AMPProductPlan): Observable<any>;

    publishProduct(product: AMPProduct): Observable<AMPProduct[]>;

    editProduct(product: AMPProduct): Observable<any>;

    fetchContentItemById(id: number): Observable<AMPContentItem>;

    fetchContentItemChildren(contentItemId: number): Observable<AMPContentItem[]>;

    getProductDBData(id: bigint): Observable<AMPProduct>;

    editContentItem(contentItem: AMPContentItem): Observable<any>;

    fetchContentRenditions(): Observable<any>;

    fetchLibRootForDam(): Observable<any>;
}

/** This is a reference to the rendition service.*/
interface RenditionServiceRef {
    get(id: number | bigint): any;
}

interface AccountServiceRef {
    getSupportedLanguages(): string[];
    isContentMode(): boolean;
    isUserMode(): boolean;
}

// interface for mobile, ipad devices for portrait and landscape mode
export type TDeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';
export type TDeviceOrientation = 'portrait' | 'landscape' | 'unknown';
export type MobileMasterViewTabs = {
    name: string;
    url: string;
    icon: string;
    isActive: boolean;
    isHidden: boolean;
};
/**
 * This is the interface for the device configuration. this allows the applications to be put into different mode based on the device configs.
 *  It includes the following properties:
 * - `deviceType` is the type of device (mobile, tablet, desktop).
 * - `deviceOrientation` is the orientation of the device (portrait, landscape).
 * - `masterViewTabs` is an array of tabs for the master view.
 * - `isUsingLocalApi` is a boolean that determines whether the local API is being used.
 * - `mode` is the environment configuration (online, offline).
 */
interface IDevice {
    deviceType: TDeviceType;
    deviceOrientation: TDeviceOrientation;
    masterViewTabs: Array<MobileMasterViewTabs>;
    isUsingLocalApi: boolean;
    mode: TEnvConfig;
    disabledActions?: DisableActions;
    deviceEndpoint?: string;
    appMode?: AppMode;
}
interface MediaPreview {
    isAudio: boolean;
    contentItem: any;
    artistName: string;
    duration: string;
    imgPath: string;
}
export interface IDetailViewProps {
    isDetailView: boolean;
    showCards: boolean;
    isMenuOpen: boolean;
    playFullView?: boolean;
    isPlayAvailable?: boolean;
    closePlayerPreview?: boolean;
    hideMediaToggle?: boolean;
    openPath?: string;
    data: any;
    libContentToPlay?: {
        pType: LibraryItemToPlay,
        identifier: bigint,
        mediaType: MediaType,
        hasChildren: boolean
    }
}

export interface MasterViewInjectableItem {
    name: string;
    iconPath?: {
        selected: string;
        unselected: string;
    };
}
export interface MasterViewClientInjections extends MasterViewInjectableItem {
    position: 'top' | 'bottom';
    isLocalContent?: boolean;
    mediaType: MediaType;
    tabContent: any[]
}

/**
 * This service is utilized for configuring the library.
 *
 * - The `setConfig` method is used for configuring the library menu component. However, it's not necessary in certain cases, such as on tablets.
 * - The `setEnvironment` method is used for setting up the environment. It's important to note that this is essential for establishing server communication.
 * - The `setAccountInfo` method is used for setting up account information. This is also required for product filter functionalities.
 *
 * If you need to inject a service into the library that isn't included with the library, you should use the configure service.
 */
@Injectable({
    providedIn: 'root',
})
export class LibraryConfigService implements ILibraryConfig {

    private _config: AMPNgLibraryConfigType;
    protected _masterViewConfig: MasterViewClientInjections[];
    private _environment: EnvironmentType;
    private _accountInfoType: AccountInfoType;
    private _alertService: Alert;
    private _stateService: StateServiceRef;
    private _damService: DamServiceRef;
    private _renditionService: RenditionServiceRef;
    private _accountServiceRef: AccountServiceRef;
    private Subject = new Subject<AccountInfoType>();
    public accountInfo$ = this.Subject.asObservable();
    public tabChangeSubject = new Subject<{mediaType: MediaType, tabName: string}>();
    public libraryTabChange$ = this.tabChangeSubject.asObservable();
    private _trackingService: ITracking;
    private _beareToken: string = '';
    private _showContentOwnerToggles: boolean = false;
    // device: maybe we should group these together in a big observable where it called mobileObservable and handle each observable differently
    private _device: IDevice = {
        // setting default values, in case
        appMode: EAppMode.WEB_APP,
        deviceType: this.getDeviceTypeAndOrientation()['deviceType'] as TDeviceType,
        deviceOrientation: this.getDeviceTypeAndOrientation()['deviceOrientation'] as TDeviceOrientation,
        masterViewTabs: [],
        isUsingLocalApi: false,
        mode: 'online',
        deviceEndpoint: '',
        disabledActions: {
            audioLibPlay: false,
            videoLibPlay: false,
            audioPlaylistPlay: false,
            videoPlaylistPlay: false,
        },
    };
    public deviceEndPointChanged = new Subject<string>();
    public masterViewCallbackSubject = new Subject<{ itemName: string, mediaType: MediaType }>()
    public masterViewCallback$ = this.masterViewCallbackSubject.asObservable()

    private deviceSubject = new Subject<IDevice>();
    public device$ = this.deviceSubject.asObservable();
    public previewUpdateValues$ = new Subject<MediaPreview>();
    public previewListener$ = this.previewUpdateValues$.asObservable();
    private __detailViewProps: IDetailViewProps;
    public detailViewPropsChange$ = new Subject<IDetailViewProps>();
    public detailViewPropsListener$ = this.detailViewPropsChange$.asObservable();
    public backIsClicked$ = new Subject<{
        nestedDepth: number;
        part: string;
    }>();
    public backIsClickedListener$ = this.backIsClicked$.asObservable();

    public offlinePlay$ = new Subject<{ [key: string]: any }>();
    public resetSelection: Subject<boolean> = new Subject<boolean>();
    public onExternalData: Subject<any> = new Subject<any>();
    
    // TODO: if the subject does not store data, we might consider just using a subject instead of creating a new Observable
    // public offlinePlay$ = this._offlinePlay.asObservable();

    private _multiSelectListMediator: MultiSelectList;
    public contentCacheConfig? = new Map<ContentServiceMethod, boolean>();

    public set multiSelectListMediator(multiSelectListMediator: MultiSelectList) {
        this._multiSelectListMediator = multiSelectListMediator;
    }
    public getMultiSelectListMediator(): MultiSelectList {
        return this._multiSelectListMediator;
    }

    get bearerToken(): string {
        return this._beareToken;
    }

    set bearerToken(v: string) {
        this._beareToken = v;
    }

    get server(): string {
        return this._environment.server;
    }

    get clientId(): string {
        return this._environment.clientId;
    }

    get clientSecret(): string {
        return this._environment.clientSecret;
    }

    get accountId(): string {
        return this._accountInfoType.accountId;
    }

    get environment(): EnvironmentType {
        return this._environment;
    }

    // TODO: any way where a method is using the objects this._accountType, the method should be removed and
    // the object should be used directly by calling this service and referencing the object directly
    // example this.configService.accountInfo.accountId
    // the above approach should be done for all the objects in this service that have the same approach

    get accountInfo(): AccountInfoType {
        return this._accountInfoType;
    }

    get alert(): Alert {
        return this._alertService;
    }

    get stateService(): StateServiceRef {
        return this._stateService;
    }

    get damService(): DamServiceRef {
        return this._damService;
    }

    get renditionService(): RenditionServiceRef {
        return this._renditionService;
    }

    get accountService(): AccountServiceRef {
        return this._accountServiceRef;
    }

    get trackingService(): ITracking {
        return this._trackingService;
    }

    get device(): IDevice {
        return this._device;
    }

    get detailViewProps(): IDetailViewProps {
        return this.__detailViewProps;
    }
    
    get showContentOwnerToggles(): boolean {
        return this._showContentOwnerToggles;
    }

    set showContentOwnerToggles(value: boolean) {
        this._showContentOwnerToggles = value;
    }

    private _isInEditMode = new Subject<boolean>();
    public isInEditMode$ = this._isInEditMode.asObservable();

    public configLibraryMenu(config: AMPNgLibraryConfigType): void {
        this._config = { ...this._config, ...config };
    }

    public configMobileMenu(c: Type<any>): void {
        this._config = { ...this._config, mobileMenu: c };
    }

    public configAlert(alert: any): void {
        this._alertService = {
            success: (message: string, options?: any) => {
                alert.success(message);
            },
            error: (message: string, options?: any) => {
                alert.error(message);
            },
            info: (message: string, options?: any) => {
                alert.info(message);
            },
            warn: (message: string, options?: any) => {
                alert.warn(message);
            },
        };
    }

    public setDevice(device: IDevice): void {
        this._device = { ...this._device, ...device };
        this.deviceSubject.next(this._device);
    }

    public setTrackingService(trackingService: ITracking): void {
        this._trackingService = trackingService;
    }

    public setEnvironment(
        server: string,
        clientId: string,
        clientSecret: string,
        imageDirectory: string,
        imageServer: string,
        stripeAPIKey: string,
        wsProtocols: string[],
        wsServer: string,
    ): void {
        this._environment = {
            server,
            clientId,
            clientSecret,
            imageDirectory,
            imageServer,
            stripeAPIKey,
            wsProtocols,
            wsServer
        };
    }

    public setAccountInfo(
        accountId: string,
        contentMode: boolean,
        token: string,
        language: string,
        email: string,
        isAdmin: boolean,
        supportedLanguages: string[],
    ): void {
        this._accountInfoType = { accountId, contentMode, token, language, email, isAdmin, supportedLanguages };
        this.Subject.next(this._accountInfoType);
    }

    public setStateService(stateService: any): void {
        this._stateService = stateService;
    }

    public setDamService(damService: any): void {
        this._damService = damService;
    }

    public setRenditionService(renditionService: any): void {
        this._renditionService = renditionService;
    }

    public setAccountService(accountService: any) {
        this._accountServiceRef = accountService;
    }

    public setToolbarComponent(config: MasterViewToolbarConfig): void {
        this._config = { masterViewToolbarConfig: config, ...this._config };
    }

    public getConfig(): AMPNgLibraryConfigType {
        return this._config;
    }

    public configMasterViewInjectable(config: MasterViewClientInjections[], tabName?: string): void {
        this._masterViewConfig = config;
        this.onExternalData.next(tabName)
    }

    public getMasterViewConfig(): MasterViewClientInjections[] {
        return this._masterViewConfig || []
    }
    
    public resetMasterViewConfig() {
        this._masterViewConfig?.map(e => {
            return {
                ...e,
                tabContent: []
            }
        })
    }

    /** This should be override by the client app such as a remote webapp when running locally  */
    public isSelectedItemExternal(text: string): boolean {
        throw new Error('Method not implemented. please override this method in the client app');
    }
    
    public getExternalDetailViewItemCount(): number {
        return 0;
    }
    
    /** Override this in the client if you using audio lib in remote web app */
    public isLibraryAudioOrVideoActive(): boolean {
        return true;
    }

    public isMobile(): boolean {
        return this._device.deviceType === 'mobile';
    }

    public isTablet(): boolean {
        return this.device.deviceType === 'tablet';
    }

    public isDesktop(): boolean {
        return this.device.deviceType === 'desktop';
    }
    
    public get showLibraryMediaToggle(): boolean {
        let result = (this.accountService.isContentMode() || this.accountService.isUserMode()) && !this.detailViewProps.hideMediaToggle;
        return result;
    }

    public get deviceTypeNOrientation() {
        return this.device.deviceType + ' ' + this.device.deviceOrientation
    }

    public isOfflineMode(): boolean {
        return this._device.mode === 'offline' || this._device.mode === 'offline-write';
    }

    public isContentMode(): boolean {
        return this._accountInfoType.contentMode;
    }

    public isAlertAvailable(): boolean {
        return this._alertService != null || this._alertService !== undefined;
    }

    public getToken(): string {
        return this._accountInfoType.token;
    }

    public getLanguage(): string {
        return this._accountInfoType.language;
    }

    public enterEditMode(): void {
        this._isInEditMode.next(true);
    }

    public exitEditMode(): void {
        this._isInEditMode.next(false);
    }

    public updateDetailViewProps(d: IDetailViewProps): void {
        this.__detailViewProps = d;
        this.detailViewPropsChange$.next(this.__detailViewProps);
    }

    public resetDetailViewProps(): void {
        this.__detailViewProps = {
            isDetailView: true,
            showCards: false,
            isMenuOpen: false,
            playFullView: false,
            isPlayAvailable: false,
            closePlayerPreview: true,
            hideMediaToggle: false,
            openPath: '',
            data: null,

        };
        this.detailViewPropsChange$.next(this.__detailViewProps);
    }

    public getHeaders(): HttpHeaders {
        let token = this.getToken();
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            'Accept-Language': this.getLanguage(),
            client_version: '10',
        });
        if (token != null) {
            headers = headers.append('token', token);
        }
        return headers;
    }

    public getDeviceTypeAndOrientation(): { [keyof: string]: string } {
        let __typeAndOrientation: { [keyof: string]: any } = {};
        const userAgent = navigator.userAgent;
        // window.navigator.userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i) ? 'mobile' : 'desktop';
        if (/Mobi|Android/i.test(userAgent) && !/iPad/i.test(userAgent)) {
            __typeAndOrientation['deviceType'] = 'mobile';
        } else if (/iPad|Tablet/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobi/i.test(userAgent))) {
            __typeAndOrientation['deviceType'] = 'tablet';
        } else {
            __typeAndOrientation['deviceType'] = 'desktop';
        }

        if (window.matchMedia('(orientation: landscape)').matches) {
            __typeAndOrientation['deviceOrientation'] = 'landscape';
        } else if (window.matchMedia('(orientation: portrait)').matches) {
            __typeAndOrientation['deviceOrientation'] = 'portrait';
        }
        return __typeAndOrientation;
    }

    public enableWsDebug: boolean = false
}

export enum EConfigType {
    EditMode = 'EditMode',
    NormalMode = 'NormalMode',
}

export type AMPNgLibraryConfigType = {
    configType: EConfigType;
    component: Type<any>;
    hasMultiSelect: boolean;
    libraryModal?: Type<any>;
    masterViewToolbarConfig?: MasterViewToolbarConfig;
    mobileMenu?: Type<any>;
    isGeneralComponent?: boolean; /// could be any component
};

/**
 * Extension point for applications to enhance the LibraryConfigService.
 * Intended to be sub-classed by clients for app-specific behavior.
 */
// export interface RemoteConfigServiceExtension {
//     disableOrEnableSpinner: Subject<boolean>;
//     resetSelection: Subject<boolean>;
//     getDeviceId(): number;
// }

export abstract class PlaylistConfigServiceExtension {
    abstract reloadPlaylists: Subject<any | undefined>;
    abstract configurePlaylists(env: any): void;
}
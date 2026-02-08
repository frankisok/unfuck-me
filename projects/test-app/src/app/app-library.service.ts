import { AMPNgLibraryConfigType, TDeviceOrientation, TDeviceType, EConfigType, LibraryConfigService, MobileMasterViewTabs } from "amp-ng-library";
import { Injectable } from "@angular/core";
import { environment } from "./environment";
import { MobileMasterViewComponent } from "./mobile-master-view/mobile-master-view.component";

@Injectable({providedIn: 'root'})
export class AppLibraryConfigService extends LibraryConfigService {
    useLocalApi: boolean;
    masterViewTabs:MobileMasterViewTabs[]  = [
        { name: 'Audio Library', icon: 'library_music', isActive: true, url: '/library/audio', isHidden: false },
        { name: 'Video Library', icon: 'video_library', isActive: false, url: '/library/video', isHidden: false },
        { name: 'Control', icon: 'control', isActive: false, url: '/auth/controller', isHidden: true},
        { name: 'Logout', icon: 'exit', isActive: false, url: '/auth/logout', isHidden: true },
        { name: 'Login', icon: 'enter', isActive: false, url: '/login', isHidden: false },
        
    ]
    constructor() {
        super();
        this.useLocalApi = environment.useLocalApi
    }

    /**
     * This method is used to configure the library menu component.
     * 
     * - At the moment the library is only configured using two modes: `ContentMode` and `DropdownMode`.
     * 
     * - Based on the user's role and the current mode, either library/content mode menu component is configured.
     * 
     * - The library may also be configured with these services `AlertService`, `StateService`, `DamService`
     */
    configureLibrary(account?: any, alert?: any, state?: any, dam?: any, rendition?: any): void {
        // this._configureMenu(account);
        const accountId = 'AM10014',
            damAccountId = 'AM00001',
            contentMode = !!dam ? true : false,
            token = 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..UwvIhscAZbHwhjC0.hDNqUA99U0ZVSWWDBTmgE87L65ytUOpuQQhqBM1s-H7-h_HlbumU8ZVd5dYGApXs-2N-5p_eMHnQwCRwRK8ATLBetONkHckFKKiRCAJb9B0mTBEdJO0-7UO8Jqqhu5JG7OMTqSVtisevZI0EXiNimV5oVftqw67YEtEeIkXWbMSyXF8Iw0NCkXUC2zhvZCUk60ZT1I04XTmPB9vfLuxFbWT1VMC7DpZPgnNjiRfFhw0WCUAPcUQgHVJ_LwZ5YbZAu7sxWZQBnAqK02JxppEFghEIpo5Gtcnn_gsMuCMLb3b6qG0.cKVJU-tM5jhU4qfmtljuWg',
            damToken = 'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..1TitmhS8g-2_TWEN.kJGydWrzd-g6AQGf8tz0H2EhCRnBFDVFPTddu_I6imd7toyKvunYGGp1NVfO1Ch5UvNnQ2EDrFRWbI9iV7X22Sl2T9eehL3j3Kmxo2MB0KMXQS8DSMBGQYzTxw9haOdw0rlwGRK9CkPPuwnH5_wAkOUN2CkTzgcxc3Qg_72K5bu95iV10k5l2ABedxMHUC92-jvLZKHb6wNrQMGqNpTDxdCKw7ch5f0fPvf-Vz5R4caj53j-LTbL8EmshSnB2KthvZOkiq-w_UnRZnMb3Z_6eJ1RROF3ETQjBGyvfAFL2WfYdM0.wdsV3166cpadnCEbO9mktw',
            // token = "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..WxLvnCfTIJ2a24y3.TYTj0KM30p3S13my8iwGcx0CCnBbOoqcISMswn2WccXCYcVBebcdTHMrZcTVxlHHOYCSjsqLjcZRRh1a5b7RWNAUkIA4GS6S7PSXNGQ1fNOHzsQTBTII8KfP13gw7w-qthMH8TrS6SvZ74Vonbx17imCwmMMYDRBwFR1PeQqpGF2xgBCJJ77EIzotPPfk6t-rLEijGaQLz-pS4-72F1XxAe5a4jMGW-1Yd5jKfqe77hNMLS_vo7__lqEIKarxY440TaadezPnwxfuh49_KLHE0BrAcSg-kNZ0le-dgXaICUUQGo.HcuJ5gcndYXzYPO8dj-JEw",
            lang = "en",
            email = "ken.carroll@mangocomputing.com",
            isAdmin = !!dam ? true : false
            this.setEnvironment(
                environment.useLocalApi ? environment.offlineServer : environment.server,
                environment.clientId,
                environment.clientSecret,
                environment.imageDirectory,
                environment.imageServer,
                environment.stripeAPIKey,
                [],
                ''
            );
        this.setAccountInfo(!!dam ? damAccountId : accountId, contentMode, !!dam ? damToken : token, lang, email, isAdmin, ['en']);
        if (alert) {
            this.configureLibraryAlert(alert);
        } else {
            console.warn("alert service is not configured configured.")
        }

        if (state) {
            console.log(state.getCurrentState());
            this.configureStateService(state);
        } else {
            console.warn("state service is not configured configured.")
        }
        
        if (dam) {
            this.configureDamService(dam);
        } else {
            console.warn("dam service is not configured configured.")
        }
        
        if (rendition) {
            this.configureRenditionService(rendition);
        } else {
            console.warn("rendition service is not configured configured.")
        }
        
        
        this.configMobileMenu(MobileMasterViewComponent)
        // configure device type
        this.__mobileMasterViewConfig();
    }
    
    updateMasterViewTabsCallback(clickedUrl: string) {
        this.masterViewTabs.map((tab) => {
            tab.isActive = tab.url === clickedUrl;
        });
        // if nothing matches, set the first tab as active
        if (!this.masterViewTabs.find(tab => tab.isActive)) {
            this.masterViewTabs[0].isActive = true;
        }
        this.__mobileMasterViewConfig();
    }
    
    
    private __mobileMasterViewConfig() {
        const ot = this.getDeviceTypeAndOrientation()
        this.setDevice({
            deviceType: ot['deviceType'] as TDeviceType,
            deviceOrientation: ot["deviceOrientation"] as TDeviceOrientation,
            masterViewTabs: this.masterViewTabs,
            isUsingLocalApi: this.useLocalApi,
            mode: environment.mode
        });
    }

    // private _configureMenu(account: any) {
    //     const isContentMode = true;
    //     const component = isContentMode ? ContentModeWrapperComponent : undefined;
    //     const configType = isContentMode ? EConfigType.EditMode : EConfigType.NormalMode;
    //     const hasMultiSelect = isContentMode ? false : true;
    //     // const libraryModal = isContentMode ? null : LibraryModalComponent
    //     const __config: AMPNgLibraryConfigType = {
    //         component: component,
    //         hasMultiSelect: hasMultiSelect,
    //         configType: configType
    //     }
    //     // if (libraryModal) {
    //     //     __config.libraryModal = libraryModal
    //     // }
    //     this.configLibraryMenu(__config);
    // }

    private configureLibraryAlert(alert: any): void {
        this.configAlert(alert);
    }
    
    private configureStateService(state: any): void {
        this.setStateService(state);
    }
    
    private configureDamService(damService: any): void {
        this.setDamService(damService);
    }
    
    private configureRenditionService(renditionService: any): void {
        this.setRenditionService(renditionService);
    }
}




export class Rendition {

    constructor(
        public id: number,
        public key: string,
        public name: string,
        public resolutionX: number,
        public resolutionY: number,
        public encoding: string
    ) {}

}

/*
1|4K4 |4K With Four 1K Movies - 4320x1920| 4320| 1920|h264 |
2|4K1 |4K With A Single Movie - 4320x1920| 4320| 1920|h264 |
3|UHD |Standard UHD 3840x2160 | 3840| 2160|h264 |
4|HD |Standard Full HD 1920x1080 | 1920| 1080|h264 |
20|M4A |MPEG 4 Audio | 0| 0|mp4 |
 */

const buildRenditions = () => {
    const renditions = [];
    renditions.push(new Rendition(
        1,
        RenditionService.RENDITION_4K4,
        '4K With Four 1K Movies - 4320x1920',
        4320,
        1920,
        'h264'
    ));
    renditions.push(new Rendition(
        2,
        RenditionService.RENDITION_4K1,
        '4K With A Single Movie - 4320x1920',
        4320,
        1920,
        'h264'
    ));

    renditions.push(new Rendition(
        3,
        RenditionService.RENDITION_UHD,
        'Standard UHD 3840x2160',
        3840,
        2160,
        'h264'
    ));

    renditions.push(new Rendition(
        4,
        RenditionService.RENDITION_HD,
        'Standard Full HD 1920x1080',
        1920,
        1080,
        'h264'
    ));

    renditions.push(new Rendition(
        20,
        RenditionService.RENDITION_M4A,
        'MPEG 4 Audio',
        0,
        0,
        'mp4'
    ));

    return renditions;
};

@Injectable()
export class RenditionService {
    public static RENDITION_4K4 = "4K4";
    public static RENDITION_4K1 = "4K1";
    public static RENDITION_UHD = "UHD";
    public static RENDITION_HD =  "HD";
    public static RENDITION_M4A = "M4A";

    renditions: Array<Rendition>;

    constructor() {
        this.renditions = buildRenditions();
    }

    getAll(): Array<Rendition> {
        return this.renditions;
    }

    get(id: any) {
        return this.renditions.find(rendition => rendition.id === id);
    }
}

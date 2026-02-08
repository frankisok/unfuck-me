import { Injectable, isDevMode } from "@angular/core";
import { ETrackingEndPoint, ITracking, ETrackingMode } from "../interfaces/tracking.helper";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from 'rxjs/operators';


@Injectable({
    providedIn: 'root'
})
export class TrackingService implements ITracking {
    /** The default is to enable tracking only for production mode*/
    private __trackingMode: ETrackingMode = isDevMode() ? ETrackingMode.NONE : ETrackingMode.PROD;
    private __isTrackingEnabled: boolean = false;
    /** This is initiated in `index.html` by the matomo script */
    private _paq: any
    private trackingData: Array<any> = [];
    private readonly triggerTime: number = 1000 * 3 * 5;
    private readonly endPointTrackSiteSearch = ETrackingEndPoint.endPointTrackSiteSearch
    private readonly endPointTrackEvent = ETrackingEndPoint.endPointTrackEvent
    private timeId: any = null;
    private sendImmediately: boolean = false;
    private _trackParam: boolean = false;
    private _trackAllSearch: boolean = false;
    private _currentUrl: string = '';
    public get lastUrl(): string { return this._currentUrl; }
    public set lastUrl(url: string) { this._currentUrl = url; }

    constructor(private router: Router) {
        this._paq = window['_paq'] || [];
        // this.trackingData = window[ETrackingEndPoint.endPointTrackingData] = window[ETrackingEndPoint.endPointTrackingData] || [];
        if (this.__trackingMode !== ETrackingMode.NONE) {
            this.setTrackingMode(this.__trackingMode);
        }
    }

    public trackEvent(category: string, action: string): void {
        if (this.__trackingMode === ETrackingMode.NONE) { return; }
        this._paq.push([this.endPointTrackEvent, category, action]);
    }

    public trackSiteSearch(keyword: string, category = 'Server Search', resultsCount = 0): void {
        if (this.__trackingMode === ETrackingMode.NONE) { return; }
        this._paq.push([this.endPointTrackSiteSearch, keyword, category, resultsCount])
    }

    public writeTrackingData(apiEndPoint: ETrackingEndPoint, category: string, data: any, extraArgs?: any): void {
        if (this.__trackingMode === ETrackingMode.NONE) { return; }

        let dataToPush = []
        let index = null
        if (apiEndPoint === this.endPointTrackSiteSearch && extraArgs >= 0) {
            dataToPush = [apiEndPoint, data, category, extraArgs]
            if (this.trackingData.length > 0) {
                index = this.getIndex(data, category, index);
            }
        } else {
            dataToPush = [apiEndPoint, category, data]
        }

        // this ensures that the last search word is not duplicated example: search for 'a' and then 'ab'
        index === null ? this.trackingData.unshift(dataToPush) : this.trackingData[index] = dataToPush
        this.sendBatchData()
    }

    public trackPageView(href: string, title: string) {
        if (this.__trackingMode === ETrackingMode.NONE) { return; }

        let trackingObject: Array<any> = this.sendImmediately ? this._paq : this.trackingData
        trackingObject.push([ETrackingEndPoint.endPointSetCustomUrl, href])
        trackingObject.push([ETrackingEndPoint.endPointSetCustomTitle, title])
        trackingObject.push([ETrackingEndPoint.endPointTrackPageView]);
        if (!this.sendImmediately) {
            this.sendBatchData()
        }
    }

    public sendPageViewImmediately() {
        this.sendImmediately = true
    }

    public trackParamChange() {
        this._trackParam = true
    }

    public trackAllSearch() {
        this._trackAllSearch = true
    }

    public subscribeToHashChange(r?: Router) {
        const router = r || this.router;
        router.events.subscribe((event: NavigationEnd) => {
            const url = event.urlAfterRedirects || event.url;
            if (!url) return;

            const pathAfterHash = url.split('/').map((str, _) => {
                return str.charAt(0).toUpperCase() + str.slice(1)
            })
            let title = ''.concat(pathAfterHash.join(' '));
            title = `${ title.split('?')[0] }`;
            if (event.urlAfterRedirects !== this.lastUrl || this._trackParam) {
                this.trackPageView(window.location.href, title)
                this.lastUrl = event.urlAfterRedirects;
            }
        })
    }

    public setTrackingMode(mode: ETrackingMode ): void {
        this.__trackingMode = mode
        if (!this.__isTrackingEnabled) {
            this.setupMatomo();
            this.__isTrackingEnabled = true;
        }
    }

    public disableAllTracking(): void {
        this.__trackingMode = ETrackingMode.NONE
    }

    public enableAllTracking(): void {
        this.__trackingMode = ETrackingMode.ALL
    }

    /** returns null or index of the last searched wor */
    private getIndex(data: any, category: string, index: any) {
        const lastData = this.trackingData[this.trackingData.length - 1];
        if (lastData.length <= 2) { return null; }
        if (lastData[0] === this.endPointTrackSiteSearch && (lastData[1].includes(data) || (data as string).includes(lastData[1])) && lastData[2] === category) {
            index = this.trackingData.length - 1;
        }
        return index;
    }

    /**
     * This is useful to to limit the amount of write and on the db and request to the server
     * - The default is to send batch data matomo server every 5 minutes
     */
    private sendBatchData(): void {
        if (this.timeId === null) {
            this.timeId = setTimeout(() => {
                if (this.trackingData.length > 0) {
                    this.sendTrackingData();
                }
                clearInterval(this.timeId);
                this.timeId = null
            }, this.triggerTime);
        }
    }

    /** Make a batch request to Matomo API, to send all the data*/
    private sendTrackingData(): void {
        const batchEvents = this.trackingData.map(event => event).filter(event => event.length > 0);
        //console.log(batchEvents);
        this._paq.push(...batchEvents);
        this.trackingData = [];
    }

    private setupMatomo() {
        document.addEventListener('DOMContentLoaded', () => {
            // Matomo Tag Manager
            const _mtm = window['_mtm'] = window['_mtm'] || [];
            _mtm.push({ 'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start' });
            (function () {
                const d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
                g.async = true; g.src = 'https://analytics.atmosphere365.com/js/container_tmVMVCE2.js'; s.parentNode.insertBefore(g, s);
            })();
        
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.text = `
                var _paq = window['_paq'] = window['_paq'] || [];
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                _paq.push(['trackVisibleContentImpressions']);
                _paq.push(['setRequestQueueInterval', 1000 * 10]);
                (function () {
                    var u = "https://analytics.atmosphere365.com/";
                    _paq.push(['setTrackerUrl', u + 'matomo.php']);
                    _paq.push(['setSiteId', window['siteId']]);
                    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
                    g.async = true; g.src = u + 'matomo.js'; s.parentNode.insertBefore(g, s);
                })();
            `;
            script.async = true;
            document.head.appendChild(script);
        });
    }
}

export { ETrackingEndPoint };

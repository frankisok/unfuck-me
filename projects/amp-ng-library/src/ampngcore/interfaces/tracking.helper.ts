import { Router } from "@angular/router";

/**
 * Matomo endpoint api
 * This can be found on https://developer.matomo.org/api-reference/tracking-javascript
 */
export enum ETrackingEndPoint {
    endPointTrackSiteSearch = 'trackSiteSearch',
    endPointTrackEvent = 'trackEvent',
    endPointTrackRequest = 'trackRequest',
    endPointTrackGoal = 'trackGoal',
    endPointTrackLink = 'trackLink',
    endPointTrackPageView = 'trackPageView',
    endPointSetCustomUrl = 'setCustomUrl',
    endPointSetCustomTitle = 'setDocumentTitle',
    /** This is not a matomo end point instead it is tracked array of AMP */
    endPointTrackingData = 'ampTrackingData',
}

/** Tracking mode */
export enum ETrackingMode {
    PROD,
    DEV,
    TEST,
    ALL,
    NONE
}

export interface ITracking {
    /**
     * @param category tracking category, example audio, video related category
     * @param action event action, example button clicked
     */
    trackEvent(category: string, action: string): void;
    /**
    * @param keyword the word or phrase that was searched for
    * @param category (optional) the category of the search results
    * @param resultsCount (optional) the number of results displayed on the search results page
    * @returns 
    */
    trackSiteSearch(keyword: string, category: string, resultsCount: number): void
    /**
     * Write data to a global array and initiate a timer to schedule a send to matomo, if one is not available
     * @param apiEndPoint, matomo end point api @see ETrackingEndPoint
     * @param category tracking category, example audio, video related category
     * @param data the data you want to write to a global array
     * @param extraArgs, example search result count
     */
    writeTrackingData(apiEndPoint: ETrackingEndPoint, category: string, data: any, extraArgs?: any): void

    /**
     * Note: if we need to send page view data immediately, call @sendPageViewImmediately in the constructor where you initialize the service
     * @param href current page url
     * @param title current page title
     * 
     * ```
     * @example
     *     constructor(private trackingService: Tracking) {
            trackingService.sendPageViewImmediately()
     * }
     * ```
     */
    trackPageView(href: string, title: string): void
    
    /**
     * Subscribes to hash change, basically url change events in angular. and then creates a new 
     * title using the current url and push page views
     * 
     * This should only be called in in app entry components and nothing else need to be done to
     * track page views.
     */
    subscribeToHashChange(routerRef?: Router): void
    
    /**
     * Call this method in the constructor of app component if you wish to track page params change.
     * page params are the query params in the url after the question mark.
     * 
     * Example: https://www.example.com?param1=1&param2=2
     * 
     * This method will track page params change and send a page view to matomo.
     * NB: Please note this could be could be heavy on the server if a lot of page views being sent
     * down to the server if page params change very frequently. 
     * 
     * Maybe we can add a timer to this method to send page view after a certain amount of time.
     * If we getting about 1 page params change per second, we can send page view after x seconds
     * or after x page params change.
     */
    trackParamChange(): void
    
    /**
     * Call this method in the constructor of app component if you wish to track all search results
     * 
     * This method will track all search results and send a page view to matomo.
     * NB: Please note this could be could be heavy on the server if a lot of page views being sent
     * down to the server if search results change very frequently. 
     * 
     * Maybe we can add a timer to this method to send page view after a certain amount of time.
     * If we getting about 1 search result change per second, we can send page view after x seconds
     * or after x search result change.
     * 
     * NB: This method is not implemented yet
     */
    trackAllSearch(): void
    
    /**
     * the default is to track only in production mode only
     * @param mode tracking mode. see {@link ETrackingMode}
     */
    setTrackingMode(mode: ETrackingMode): void
    
    /**
     * Disable all tracking
     */
    disableAllTracking(): void
    
    /**
     * Enable all tracking
     */
    enableAllTracking(): void
}

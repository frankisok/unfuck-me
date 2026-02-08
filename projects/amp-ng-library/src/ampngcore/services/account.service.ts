import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AdminMode, ResellerLicences } from '../core';
import { LibraryConfigService } from '../../library/library-config-service';
import { Register, RegisterTrial } from '../models/register';
import { VenueInstallation } from '../models/venue-installation';
import { map } from 'rxjs/operators';
import { firstValueFrom, Observable } from 'rxjs';
import { TrialProductPayload } from '../models/product-payload';
import { Account, AMPAccount } from '../models/account';
import { Business } from '../models/business';
import { Venue } from '../models';
import { Rendition } from '../models/rendition';
import { StateService, UserMode } from './state.service';
import { EochrachaTriS } from '../models/eochracha-tris.type';

@Injectable({
    providedIn: 'root',
})
export class AccountService {

    public token = '';
    public accountId = '';
    public accountNumber = 0;
    public accountType = 0;
    public adminMode = AdminMode.ADMIN;

    private ACCOUNT_TYPE = 4;
    private RESELLER_TYPE = 2;
    private CONTENT_PROVIDER_TYPE = 32;
    private ADMIN_TYPE = 1;
    private VENUE_TYPE = 8;

    private SUPPORTED_LANGUAGES = ['en'];

    editLogin = false;
    editAccount = false;

    constructor(
        private http: HttpClient,
        private configService: LibraryConfigService,
        private stateService: StateService
    ) {
        this.parseStorageItems();
    }

    public getHeaders(): HttpHeaders {
        let headers = this.configService.getHeaders();
        return headers;
    }

    public login(username: string, password: string) {
        let url = `${this.configService.environment.server}/ampapi/login`;
        let body = { accountId: username, password: password };
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };

        return this.http.post(url, body, options).pipe(
            map((response: HttpResponse<any>) => {
                let result = response.body;
                if (result && result.responseCode == 0) {
                    if (result.responseData) {
                        localStorage.setItem('token', result.responseData.token);
                        localStorage.setItem('accountId', result.responseData.account.accountId);
                        localStorage.setItem('email', result.responseData.account.contactEmail);
                        localStorage.setItem('accountType', result.responseData.account.type);
                        localStorage.setItem('accountName', result.responseData.account.name);
                        this.parseStorageItems();
                    }
                }
            }),
        );
    }

    public updateSchedules(venueId: number) {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/updateschedules/${venueId}`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchLicences(): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installations`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchProductPlanLicenses(): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/productplan/installations`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchResellerLicences(): Observable<ResellerLicences[]> {
        let url = `${this.configService.environment.server}/ampapi/vendor/${this.accountId}/installations`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchAccount(): Observable<AMPAccount> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/populated/true`;
        let options = this.makeOptionsHeaderText();
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchGroupVenues(): Observable<Account[]> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/venues`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchTrialProducts(): Observable<TrialProductPayload[]> {
        let url = `${this.configService.environment.server}/ampapi/trial/products`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public updateAccountDetails(business: Business): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/updateDetails`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.post(url, business, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public updateAccountVenue(venue: Venue): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/venue`;
        let business = this.convertVenueToBusiness(venue);
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.post(url, business, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    private convertVenueToBusiness(venue: Venue) {
        const business: Business = {
            businessName: venue.name,
            businessNumber: venue.businessNumber,
            addressLine1: venue.addressLine1,
            addressLine2: venue.addressLine2,
            city: venue.city,
            state: venue.state,
            country: venue.country,
            postcode: venue.postcode,
            phone: venue.phone,
            contactEmail: venue.contactEmail,
            contactName: venue.contactName,
            preferredLanguage: venue.preferredLanguage,
            organisationId: venue.id,
            parentId: venue.parentId
        };
        return business;
    }

    public updateInstallationSchedule(installationId: number, scheduleIdentifier: bigint): Observable<any> {
        const url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installation/${installationId}/setschedule/${scheduleIdentifier}`;
        const options = { headers: this.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public applyInstallationSchedule(installationId: number, scheduleIdentifier: bigint): Observable<any> {
        const url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installation/${installationId}/applyschedule/${scheduleIdentifier}`;
        const options = { headers: this.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => {
                console.log('Response from applyInstallationSchedule:', response);
                return response.body.responseData;
            }),
        );
    }

    public updateAccountPassword(password: string): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/updatePassword`;
        let body = { 'password': password };
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.post(url, body, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public resetPassword(accountId: string): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/password/${accountId}/reset`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public assignLicence(licenceCode: string, installationId: number) {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/assignlicence`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        let body = JSON.stringify({ licenseCode: licenceCode, installationId: installationId });
        return this.http.post(url, body, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchInstallationLicenses(installationId: number): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installation/${installationId}/licenses`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public fetchForInstSystemPlaylists(mediatype): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/playlists/${mediatype}/system/true`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData || JSON.parse(response.body).responseData),
        );
    }

    public fetchForInstMyPlaylists(mediatype): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/playlists/${mediatype}/system/false`;
        let options = { headers: this.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const };
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData || JSON.parse(response.body).responseData),
        );
    }

    public getInstallationPlaylists(installationId): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installation/${installationId}`;
        let options = this.makeOptionsHeaderText();
        return this.http.get(url, options).pipe(
            map((response: HttpResponse<any>) => response.body.responseData),
        );
    }

    public parseStorageItems() {
        let token = localStorage.getItem('token');
        this.token = (token) ? token : '';

        let accountId = localStorage.getItem('accountId');
        if (accountId) {
            this.accountId = accountId;
            const accountNum = accountId.substring(2);
            this.accountNumber = Number(accountNum);
        } else {
            this.accountId = '';
        }

        let accountType = localStorage.getItem('accountType');
        this.accountType = (accountType) ? parseInt(accountType) : this.ACCOUNT_TYPE;

        this.configService.setAccountInfo(this.accountId, this.isContentMode(), this.token, this.getLanguage(), this.getEmail(), this.isAdmin(), this.getSupportedLanguages());
        this.stateService.updateState({ isAdminUser: this.isAdmin() })
    }

    public getEmail(): string {
        let email = localStorage.getItem('email');
        return (email) ? email : '';
    }

    public setEmail(email: string) {
        localStorage.setItem('email', email);
    }

    public getAccountName(): string {
        let accountName = localStorage.getItem('accountName');
        return accountName ? accountName : '';
    }

    public logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('accountId');
        localStorage.removeItem('email');
        this.stateService.resetState();
    }

    // public registerAccount2(account: Business, password: string, confirmPassword: string): Observable<any> {
    //     let url = `${this.configService.environment.server}/ampapi/register`;
    //     var d = new Date();
    //     var minutesFromUTC = d.getTimezoneOffset();
    //     let body = new Register(account, password, confirmPassword, account, minutesFromUTC);
    //     let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
    //     return this.http.put(url, body, options);
    // }

    public registerAccount(account: AMPAccount, password: string, confirmPassword: string): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/registerclient`;
        var d = new Date();
        var minutesFromUTC = d.getTimezoneOffset();
        const client = this.convertAccountToBusiness(account, account.parentId)
        const venue = this.convertAccountToBusiness(account, account.id)
        let postData = new Register(client, password, confirmPassword, venue, minutesFromUTC);
        let options = this.makeOptionsHeaderText();
        return this.http.post(url, postData, options);
    }

    private convertAccountToBusiness(account: AMPAccount, parentId: number) {
        const business: Business = {
            businessName: account.name,
            businessNumber: account.businessNumber,
            addressLine1: account.addressLine1,
            addressLine2: account.addressLine2,
            city: account.city,
            state: account.state,
            country: account.country,
            postcode: account.postcode,
            phone: account.phone,
            contactEmail: account.contactEmail,
            contactName: account.contactName,
            preferredLanguage: account.preferredLanguage,
            organisationId: account.id,
            parentId: parentId
        };
        return business
    }

    public registerTrialAccount(account: Business, password: string, confirmPassword: string, resellerId: string, productRenditionCode: string): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/trial/register`;
        var d = new Date();
        var minutesFromUTC = d.getTimezoneOffset();
        let body = new RegisterTrial(account, password, confirmPassword, account, resellerId, productRenditionCode, minutesFromUTC);
        let options = { headers: this.getHeaders(), observe: 'response' as 'response' };
        return this.http.put(url, body, options);
    }

    public updateInstallation(installationId, installation): Observable<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installation/${installationId}`;
        let options = this.makeOptionsHeaderText();
        const venueInstallation = this.convertToInstallation(installation);
        const convertedVenueInstallation = { ...venueInstallation, scheduleId: `${venueInstallation.scheduleId}` };
        return this.http.post(url, convertedVenueInstallation, options);
    }

    private convertToInstallation(installation: VenueInstallation) {
        const venueInstallation: VenueInstallation = {
            id: installation.id,
            installationName: installation.installationName,
            venueId: installation.venueId,
            hardwareKey: '',
            systemId: installation.systemId,
            scheduleId: installation.scheduleId,
            updatesEnabled: 0,
            mediaType: installation.mediaType,
            playlists: installation.playlists,
            details: installation.details,
            schedule: installation.schedule,
        };
        return venueInstallation;
    }

    public getLanguage(): string {
        const availableLanguages = this.getSupportedLanguages();
        const language = navigator.language.substring(0, 2);
        const notProduction = this.configService?.environment?.server.includes('accountdev') || this.configService?.environment?.server.includes('accountqa');
        if (notProduction && availableLanguages.includes(language)) {
            return language;
        }
        return 'en';
    }

    public isAuthenticated(): boolean {
        if (localStorage.getItem('token')) {
            return true;
        }
        return false;
    }

    public isClient(): boolean {
        return ((this.accountType & this.ACCOUNT_TYPE) != 0);
    }
    public isReseller(): boolean {
        return (this.accountType & this.RESELLER_TYPE) != 0 && !this.isAdmin();
    }

    public isContentProvider(): boolean {
        return (this.accountType & this.CONTENT_PROVIDER_TYPE) != 0 && !this.isAdmin();
    }

    public isAdmin(): boolean {
        return (this.accountType & this.ADMIN_TYPE) != 0;
    }

    public isVenue(): boolean {
        return (this.accountType & this.VENUE_TYPE) != 0;
    }

    public isUserMode(): boolean {
        return this.stateService.isUserMode();
    }

    public isAdminMode(): boolean {
        return this.stateService.isAdminMode();
    }

    public isContentMode(): boolean {
        return this.stateService.isContentMode();
    }
    public getSupportedLanguages(): string[] {
        return this.SUPPORTED_LANGUAGES;
    }

    public getAppLang(): string {
        return 'en';
    }

    public enterEditLoginMode() {
        this.editLogin = true;
        this.editAccount = false;
    }

    public enterEditAccountMode() {
        this.editLogin = false;
        this.editAccount = true;
    }

    public exitEditModes() {
        this.editLogin = false;
        this.editAccount = false;
    }

    public makeOptionsHeaderText() {
        return {
            headers: this.configService.getHeaders(),
            observe: 'response' as 'response',
            responseType: 'text' as const,
        };
    }

    public makeOptionsHeader() {
        return { headers: this.configService.getHeaders(), observe: 'response' as 'response' };
    }

    applySchedulesMultiple(installationIds: number[]): Promise<any> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/installations/applyschedules`;
        let options = this.makeOptionsHeader();
        return firstValueFrom(
            this.http.post(url, installationIds, options).pipe(
                map((response: HttpResponse<any>) => response.body.responseData),
            ),
        );
    }

    fetchRenditions(): Promise<Rendition[]> {
        let url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/renditions`;
        let options = this.makeOptionsHeader();
        return firstValueFrom(
            this.http.get(url, options).pipe(
                map((response: HttpResponse<any>) => response.body.responseData),
            ),
        );
    }

    getEochrachaTriS(): Promise<EochrachaTriS> {
        const url = `${this.configService.environment.server}/ampapi/account/${this.accountId}/tris/eochracha`;
        let options = this.makeOptionsHeader();

        return firstValueFrom(
            this.http.get(url, options).pipe(
                map((response: HttpResponse<any>) => response.body.responseData),
            )
        )
    } 
}

import { VenueInstallation } from "./venue-installation";

export class Venue {
    public id: number;
    public type: number;
    public status: number;
    public name: string;
    public addressLine1: string;
    public addressLine2: string;
    public city: string;
    public state: string;
    public country: string;
    public postcode: string;
    public phone: string;
    public businessNumber: string;
    public businessName: string;
    public parentId: number;
    public accountId: string;
    public validationHash: string;
    public accountPassword: string;
    public contactName: string;
    public contactEmail: string;
    public preferredLanguage: string;
    public installations: VenueInstallation[] = [];

    constructor(data?: Partial<Venue>) {
        // Initialize properties with default values or provided data
        if (data) {
            Object.assign(this, data);
        }
    }
}

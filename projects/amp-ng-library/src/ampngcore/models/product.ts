/*
26/09/2023 Tom
I think that this original Product class is now deprecated? It appears to be related to the shop.
I added a new AMPProduct class which matches the objects coming back from the fetchProducts() call
*/

import {Movie} from './movie';
import {MediaType} from '../enums/media-type';
import {AMPContentItem} from './content-item';

export class Product {
    productImage: string = '';
    movies: Movie[] = [];

    format: string = 'UHD; 3840 x 2160 pix; 16/9';
    cinematographer: string = 'Maxx Hermann';
    sound: string = 'Original ambient sound';
    codecs: string = 'H264 / AAC';

    constructor(
        public id: number = 0,
        public productCode: string = '',
        public productName: string = '',
        public currency: string = '',
        public plusVAT: boolean = false,
        public price: number = 0,
        public resellerPrice: number = 0,
        public displayName: string = '',
        public productSummary: string = '',
        public productDescription: string = '',
        public licenced: boolean = false,
        public promoVideoId: string = '',
    ) {}

    priceToPay() {
        if (this.plusVAT) {
            return this.price * 1.19;
        }
        return this.price;
    }
}

export class AMPProduct {
    public id: number;
    public identifier: bigint;
    public version: number;
    public status: number;
    public editVersion: number;
    public firstPublishedDate: number | null;
    public lastPublishedDate: number | null;
    public type: number;
    public code: string;
    public name: string;
    public contentBundleId: number;
    public contentBundleItems: number[];
    public promoVideoId: string;
    public idString: string;
    public mediaType: MediaType;
    public translations: AMPProductTranslation[];
    public softwareItems: number[];
    public renditions: AMPProductRendition[];
    public children?: AMPContentItem[];
    public imageUrl: string;

    constructor(data?: Partial<AMPProduct>) {
        // Initialize properties with default values or provided data
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class AMPProductTranslation {
    constructor(
        public referenceId: number,
        public language: string,
        public displayName: string,
        public summary: string,
        public itemDescription: string,
    ) {}
}

export class AMPProductRendition {
    constructor(
        public id: number,
        public renditionId: number,
        public productId: number,
        public renditionCode: string,
    ) {}
}

export class AMPSaveProductRequest {
    constructor(
        public id: number,
        public identifier: bigint,
        public type: number,
        public mediaType: number,
        public code: string,
        public name: string,
        public contentBundleId: number,
        public contentBundleItems: number[],
        public softwareItems: number[],
        public promoVideoId: string,
        public translations: AMPProductTranslation[],
        public renditions: AMPProductRendition[],
        public editVersion: number,
        public status: number,
        public imageUrl: string,
    ) {}
}

export class AMPProductPlan {
    public id: number;
    public identifier: bigint;
    public version: number;
    public status: number;
    public editVersion: number;
    public firstPublishedDate: number | null;
    public lastPublishedDate: number | null;
    public code: string;
    public name: string;
    public description: string;
    public renditions: AMPPlanRenditions[];
    public products: AMPProduct[];
    public translations: [];
    public imageUrl: string;
    public mediaType: number

    constructor(data?: Partial<AMPProductPlan>) {
        // Initialize properties with default values or provided data
        if (data) {
            Object.assign(this, data);
        }
    }
}

export class AMPPlanRenditions {
    constructor(
        public id: number,
        public renditionId: number,
        public productPlanId: number,
        public renditionCode: string,
    ) {}
}

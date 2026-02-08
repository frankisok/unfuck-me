import { AMPProductPlan, AMPProduct } from '../models/product';
import { AMPContentItem } from '../models/content-item';

export function isProduct(obj): boolean {
    return obj instanceof AMPProduct;
}

export function isProductPlan(obj): boolean {
    return obj instanceof AMPProductPlan;
}

export function isContentItem(obj): boolean {
    return obj instanceof AMPContentItem;
}

export function isDAMObject(obj): boolean {
    return isProduct(obj) || isProductPlan(obj) || isContentItem(obj);
}

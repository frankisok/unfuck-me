import { AMPProduct, AMPProductPlan } from '../models/product';
import { AMPContentItem } from '../models';

export function asProduct(obj): AMPProduct {
    return obj as AMPProduct;
}

export function asContentItem(obj): AMPContentItem {
    return obj as AMPContentItem;
}

export function asProductPlan(obj): AMPProductPlan {
    return obj as AMPProductPlan;
}

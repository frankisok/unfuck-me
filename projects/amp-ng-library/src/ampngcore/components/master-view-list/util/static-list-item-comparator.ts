import { StaticListItemModel } from "../../../core";

export const isStaticListItem  = (listItem) => listItem.getInnerModel() instanceof StaticListItemModel && listItem.getInnerModel().isStaticItem;


export const StaticListItemComparator = (item1, item2) => {
    const i1Static = isStaticListItem(item1);
    const i2Static = isStaticListItem(item2);
    const i1FirstChar = item1.getDisplayText()[0];
    const i2FirstChar = item2.getDisplayText()[0];
    const i1BeforeI2 = i1FirstChar < i2FirstChar;

    let comparatorVal;
    // If only 1 item is static assign that value
    if ((i1Static && !i2Static) || (!i1Static && i2Static)) {
        comparatorVal = (i1Static) ? -1 : 1
    } else {
        // Else take alpha sort
        comparatorVal = (i1BeforeI2) ? -1 : 1
    }
    return comparatorVal;
};

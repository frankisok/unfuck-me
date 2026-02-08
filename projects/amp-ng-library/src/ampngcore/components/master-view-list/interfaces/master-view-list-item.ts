import {ListItem} from '../models/list-item';

export interface MasterViewListItemController {
    clearMasterViewList(): Array<ListItem>; // Cleared list;
    getMasterViewList(): Array<ListItem>;
    pushToMasterViewList(listItem): void;
    getDetailViewForListItem(listItem): void;
}

import {ListItem} from '../models/list-item';
import {ListItemConfig} from '../models/list-item-config';

export interface ListItemFactory<T> {
    buildListItem(model: T, config: ListItemConfig): ListItem;
}

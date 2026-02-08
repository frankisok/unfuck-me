import {IListItemIconConfigFactory} from '../interfaces/listitem-icon-config-factory';
import {ListItemIconConfig, ListItemIconConfigStates, ListItemIconType} from '../models/list-item-config';

const buildListItemIconConfig = (iconType, normalStateAsset, selectedStateAsset, customStateMap, className) => {
    const iconConfig = new ListItemIconConfig(iconType, className);
    iconConfig.pushIconState(ListItemIconConfigStates.NORMAL, normalStateAsset);
    iconConfig.pushIconState(ListItemIconConfigStates.SELECTED, selectedStateAsset);

    Object.entries(customStateMap).forEach((customStateEntry) => {
        iconConfig.pushIconState(customStateEntry[0], customStateEntry[1]);
    });

    return iconConfig;
};

export default class ListItemIconConfigFactory implements  IListItemIconConfigFactory {


    buildListItemIcoIconConfig(normalStateAsset, selectedStateAsset, customStateMap, className) {
        return buildListItemIconConfig(ListItemIconType.ICON, normalStateAsset, selectedStateAsset, customStateMap, className);
    }

    buildListItemImageIconConfig(normalStateAsset, selectedStateAsset, customStateMap, className) {
        return buildListItemIconConfig(ListItemIconType.IMAGE_ASSET, normalStateAsset, selectedStateAsset, customStateMap, className);
    }
}

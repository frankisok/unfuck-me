import { ListItemConfig } from '../../models';
import { List, ListItem } from '../../core';
import { ListItemFactory } from '../../core';

export const buildTreeObjToListMap = (config: ListItemConfig, childKey: string) => {
    const mapFnc = (genreObject: {name: string}): ListItem => {
        let listItem;
        const displayTextFnc = () => { return genreObject.name };
        if (genreObject.hasOwnProperty(childKey)
            && genreObject[childKey]
            && genreObject[childKey].length > 0) {
            listItem = new List(config, displayTextFnc, genreObject, genreObject[childKey].map(mapFnc));
        } else {
            listItem = new ListItem(config, displayTextFnc, genreObject);
        }
        return listItem;
    };
    return mapFnc;
};

export class GenericTreeListItemFactory implements ListItemFactory<Array<object>> {

    constructor(public heading: string, public childKey: string) {}

    buildListItem(model: Array<object>, config: ListItemConfig): ListItem {
        return new List(config, () => { return this.heading }, model, model.map(buildTreeObjToListMap(config, this.childKey)));
    }

}

export class StaticListItemModel {

    private readonly _tabName;
    private readonly _tabContent;

    private readonly _isStaticItem;

    constructor(tabName, tabContent) {
        this._tabName = tabName;
        this._tabContent = tabContent;
        this._isStaticItem = true;
    }

    get tabName() {
        return this._tabName;
    }

    get tabContent() {
        return this._tabContent;
    }

    get isStaticItem() {
        return this._isStaticItem;
    }
}

export class GenericStaticListItemFactory implements ListItemFactory<StaticListItemModel> {

    buildListItem(model: StaticListItemModel, config: ListItemConfig): ListItem {
        return new ListItem(config, () => {return model.tabName}, model);
    }
}

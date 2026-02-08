import { ListItemFactory } from '../../core';
import { List, ListItem } from '../../core';
import { ListItemConfig } from '../../models';

const GENRE_HEADING = 'Genres';
const GENRE_CHILDREN_KEY = 'children';

const buildGenreObjToListMap = (config: ListItemConfig) => {
    const mapFnc = (genreObject: {children: [], name: string}): ListItem => {
        let listItem;
        const displayTextFnc = () => { return genreObject.name };
        if (genreObject.hasOwnProperty(GENRE_CHILDREN_KEY)
            && genreObject[GENRE_CHILDREN_KEY]
            && genreObject[GENRE_CHILDREN_KEY].length > 0) {
            listItem = new List(config, displayTextFnc, genreObject, genreObject.children.map(mapFnc));
        } else {
            listItem = new ListItem(config, displayTextFnc, genreObject);
        }
        return listItem;
    };
    return mapFnc;
};

export class AudioLibraryGenreListItemFactory implements ListItemFactory<Array<object>> {

    constructor(public heading: string)
    {}

    buildListItem(model: Array<object>, config: ListItemConfig): ListItem {
        return new List(config, () => { return this.heading }, model, model.map(buildGenreObjToListMap(config)));
    }

}


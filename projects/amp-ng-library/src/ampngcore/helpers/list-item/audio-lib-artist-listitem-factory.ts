import { ListItemFactory } from '../../core';
import { List, ListItem } from '../../core';
import { ListItemConfig } from '../../models';

//const ARTISTS_HEADING = 'Artists';

const NUMERIC_CATEGORY = '0 - 9';
const OTHER_CATEGORY = 'Other';
const categoriseArtistByLetterReducer = (accumulator, currentValue: {id: number, name: string}) => {
    const currentAlphaNum: string = currentValue.name[0].toUpperCase();


    const isAlpha = currentAlphaNum.match(/[A-Z]/i);
    const isNumeric = !Number.isNaN(Number(currentAlphaNum));
    const isOther = !isAlpha && !isNumeric;
    let category = currentAlphaNum;

    if (isNumeric) {
        category = NUMERIC_CATEGORY;
    } else if (isOther) {
        category = OTHER_CATEGORY;
    }

    if (accumulator[category]) {
        accumulator[category].push(currentValue);
    } else {
        accumulator[category] = [currentValue];
    }
    return accumulator;
};

const buildArtistsToListMap = (config: ListItemConfig) => {
    return (artist) => {
        return new ListItem(config, () => { return artist.name }, artist);
    };
};

const buildArtistCategorisationMap = (config: ListItemConfig) => {
    return (categoryEntry) => {
        return new List(config, () => { return categoryEntry[0] }, categoryEntry, categoryEntry[1].map(buildArtistsToListMap(config)));
    };
};

export class AudioLibraryArtistListItemFactory implements ListItemFactory<Array<object>> {

    private readonly _heading: string;
    constructor(heading: string){
        this._heading = heading;
    }

    buildListItem(model: Array<object>, config: ListItemConfig): ListItem {
        const categorisedArtists = model.reduce(categoriseArtistByLetterReducer, {});
        
        const otherCategory = categorisedArtists["Other"];
        // removing the "Other" category from the main categorisedArtists
        if (otherCategory) {
            delete categorisedArtists["Other"];
        }
        
        const sortedCategories = Object.entries(categorisedArtists)
        // pushing the "Other" category to the end of the sorted categories
        if (otherCategory) {
            sortedCategories.push(["Other", otherCategory]);
        }
        // buidling the list item using the sorted categories with "Other" at the end.
        const listItem = new List(config, () => { return this._heading }, model, sortedCategories.map(buildArtistCategorisationMap(config)));
        return listItem;
    }
}

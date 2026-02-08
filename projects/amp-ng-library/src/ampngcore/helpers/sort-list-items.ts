import { ListItem } from '../core';


/**
 * Recursively sorts nested items within a ListItem based on custom rules or locale comparison.
 *
 * If the parent ListItem has a display text of 'Hits', it sorts nested items using the customCompare function,
 * which prioritizes numeric parts and performs descending order sorting when applicable. Otherwise, it sorts nested items
 * using localeCompare for string comparison.
 *
 * @param {ListItem} listItem - The ListItem containing nested items to be sorted.
 */
export function sortNestedItems(listItem: ListItem) {
    if (listItem.hasNestedItems()) {
        if (listItem.getDisplayText() === 'Artists') {
            return;
        }
        listItem.getNestedItems().sort((a, b) => {
            if (listItem.getDisplayText() === 'Hits') {
                return customCompare(a.getDisplayText(), b.getDisplayText());
            }
            return a.getDisplayText().localeCompare(b.getDisplayText());
        });
        listItem.getNestedItems().forEach(nestedItem => {
            sortNestedItems(nestedItem);
        });
    }
}

/**
 * Custom comparison function for sorting strings based on numeric parts and remaining content.
 *
 * This function extracts numeric parts from two input strings, compares them numerically in descending order,
 * and if the numeric parts are equal, it compares the remaining parts of the strings as strings using localeCompare.
 *
 * @param {string} strA - The first input string to compare.
 * @param {string} strB - The second input string to compare.
 * @returns {number} A negative value if strA should come before strB, a positive value if strA should come after strB,
 * or zero if they are equal in sorting order.
 */
export function customCompare(strA: any, strB: any): number {
    const pattern = /(\d+)(s)?/g;

    const matchA = Array.from(strA.matchAll(pattern), m => m[1]);
    const matchB = Array.from(strB.matchAll(pattern), m => m[1]);

    const numA = parseInt(matchA[0] || 0, 10);
    const numB = parseInt(matchB[0] || 0, 10);

    if (numA !== numB) {
        return numB - numA;
    }
    return strA.localeCompare(strB);
};
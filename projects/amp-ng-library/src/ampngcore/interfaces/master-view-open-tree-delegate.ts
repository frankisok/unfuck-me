import { AMPContentItem } from '../models';
import { MasterViewListItemEventDelegate } from '../core';
import { MasterViewListMediator } from '../core';
import { ListItem } from '../core';

interface Item {
    [key: string]: any;
}
export interface FilteredItemsWithIndex {
    index: number; 
    contentItem: Item;
}
/**
 * Interface for managing an open tree structure within a master view.
 */
export interface MasterViewOpenTree {
    /**
     * The list item representing the currently open node in the tree.
     */
    listItem: ListItem;

    /**
     * An array of indexes representing the path from the root to the currently open node.
     */
    indexes: number[];

    /**
     * The index of the child that led to the currently open node.
     */
    childIndex: number;
}

/**
 * Delegate interface for handling events related to opening and navigating a tree structure within a master view.
 */
export interface MasterViewOpenTreeEventDelegate extends MasterViewListItemEventDelegate {
    /**
     * An array of list items representing the master view list.
     */
    masterViewList: Array<ListItem>;

    /**
     * Information about the currently open tree structure.
     */
    openTree: MasterViewOpenTree;

    /**
     * The index of the root-level parent in the master view list.
     */
    rootParentIndex: number;

    /**
     * The current root-level tab identifier.
     */
    currentRootLevelTab: string;

    /**
     * The root-level parent list item within the master view list.
     */
    rootLevelParent: ListItem;

    /**
     * An array of tab identifiers representing the open tree tabs.
     */
    openTreeTabs: string[];

    /**
     * Returns the number of filtered items that match the current search term.
     */
    // filteredTabContent: AMPContentItem[]
    filteredTabContent: FilteredItemsWithIndex[];

    /**
     * The current search term. It not cleared when we navigate to a new tab on the master view.
     * - search filter can be cleared by deleting the text in the search box or refreshing the page.
     */
    searchFilter: string;

    /**
     * Navigates to a specific tab within the master view when a list item is selected.
     * 
     * @param listItem - The root list item at a specific index to navigate to.
     * @param tabName - The name of the target tab.
     */
    navigateToTab(listItem: ListItem, tabName: string): void;

    /**
     * Returns a function that can be used to filter the master view list based on a search term.
     * 
     *  The search term to filter the master view list is now obtained from `this.searchFilter`.
     * @returns A function that can be used to filter the master view list based on a search term.
     */
    getFilterFunc(): any;
    
    /**
     * open menu or back button click event
     */
    mobileBackOrMenuClick?(e: 'menu' | 'back', data?: any): void;
}


/**
 * Interface representing a mediator for managing a master view list with tree state.
 */
export interface MasterViewListMediatorWithTreeState extends MasterViewListMediator {
    /**
     * Updates the last navigated items when a list item is selected in a tree structure.
     * 
     * @param listItem - The selected list item.
     * @param masterViewDelegate - The delegate for handling master view events with tree state.
     */
    updateLastItems?(listItem: ListItem, masterViewDelegate: MasterViewOpenTreeEventDelegate): void;

    /**
     * Retrieves the last navigated list item in a tree structure.
     * 
     * @param masterViewDelegate - The delegate for handling master view events with tree state.
     * @param rootLevelListItem - The root-level list item.
     * @returns The last navigated list item or null if not found.
     */
    getLastNavigatedListItem?(masterViewDelegate: MasterViewOpenTreeEventDelegate, rootLevelListItem: ListItem): ListItem | null;

    /**
     * Resets the list of items in the master view with tree state.
     * 
     * @param list - The list of items to set in the master view.
     * @param rootTab - The root tab list item.
     * @param masterViewDelegate - The delegate for handling master view events with tree state.
     * @param isRecentItemTab - Whether the root tab is the recent items tab.
     */
    resetList?(list: ListItem[], rootTab: ListItem, masterViewDelegate: MasterViewOpenTreeEventDelegate, isRecentItemTab?: boolean): void;

    /**
     * Returns the number of filtered items that match the current search term.
     * If no search term is set, returns the total number of items.
     * 
     * @param masterViewDelegate - The delegate for handling master view events with tree state.
     * @returns The number of filtered items that match the current search term.
     */
    getFilteredItemsWithSearchWord?(masterViewDelegate: MasterViewOpenTreeEventDelegate): number;

    getStringOpenPath?(root: ListItem, target: string): string;
}

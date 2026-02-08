
// Maintain top level item
// Maintain selected item

import {ListItem} from '../models/list-item';
import { MasterViewListMediatorWithTreeState, MasterViewOpenTreeEventDelegate, MasterViewOpenTree, breadCrumbSeparator } from '../../../core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';

export interface MasterViewListMediator {
    meditatorObservable$: Observable<NestedMediatorData>
    clear();
    setSelectedListItem(listItem: ListItem, nestedDepth);
    isLastItemSelected(): boolean;
    getLastSelectedItem(): ListItem;
    getListItemFromId(list: ListItem[], id: number)
}

interface NestedMediatorData {
    lastSelectedListItem: ListItem;
}

export class NestedMasterViewListMediator implements  MasterViewListMediatorWithTreeState {
    private static ROOT_DEPTH = 1;
    private readonly breadCrumbSeparator = breadCrumbSeparator

    private listItemBranch: {};

    private lastSelectedListItemDepth: number;
    private lastSelectedListItem: ListItem;

    private mediatorSubject = new Subject<NestedMediatorData>();
    meditatorObservable$ = this.mediatorSubject.asObservable();

    constructor() {
        this.listItemBranch = {};
    }

    clear() {
        this.listItemBranch = {};
        this.lastSelectedListItemDepth = undefined;
        this.lastSelectedListItem = undefined;
        this.mediatorSubject.next({ lastSelectedListItem: this.lastSelectedListItem })
    }

    updateBranch(listItem, nestedDepth) {
        const itemBranch = {};

        // Go through the entries of the existing branch
        Object.entries(this.listItemBranch).forEach(entry => {
            const depth = entry[0];
            const item = <ListItem>entry[1];

            // For all nodes lower then the selected depth, deselect
            if (depth >= nestedDepth) {
                item.setSelected(false);
            } else {
                itemBranch[depth] = item;
            }

            // // deselect all items
            // item.setSelected(false)
            //
            // const itemId = item.getInnerModel().isFolderListItemModel ? item.getInnerModel().folder.id : item.getInnerModel().id
            // const listItemId = item .getInnerModel().isFolderListItemModel ? listItem.getInnerModel().folder.id : item.getInnerModel().id
            //
            // // reselect clicked item
            // if (itemId === listItemId) {
            //     item.setSelected(true)
            //     itemBranch[depth] = item
            // }
        });

        this.listItemBranch = itemBranch;
    }


    setSelectedListItem(listItem: ListItem, nestedDepth) {

        if (!listItem) {
            return;
        }
        // Cache list item state to allow clicking off items
        let listItemSelectedState = listItem.isSelected();
        this.updateBranch(listItem, nestedDepth);
        listItem.setSelected(!listItemSelectedState);
        listItemSelectedState = listItem.isSelected();

        if (listItemSelectedState) {
            // Assign new item at its depth
            this.listItemBranch[nestedDepth] = listItem;
            this.lastSelectedListItem = listItem;
            this.lastSelectedListItemDepth = nestedDepth;
        } else if (!listItemSelectedState && nestedDepth > NestedMasterViewListMediator.ROOT_DEPTH) {
            // If the listitem is being deselected and there is a nested item below.
            const newItemDepth = nestedDepth - 1;
            this.lastSelectedListItem = this.listItemBranch[newItemDepth];
            this.lastSelectedListItemDepth = newItemDepth;
        }
        this.mediatorSubject.next({ lastSelectedListItem: this.lastSelectedListItem })
    }

    getLastSelectedItem(): ListItem {
        return this.lastSelectedListItem;
    }

    isLastItemSelected(): boolean {
        return this.lastSelectedListItem && this.lastSelectedListItem.isSelected();
    }

    getListItemFromId(list: ListItem[], id: number) {
        // Expand masterViewList to get all child items
        function flattenList(list: ListItem[]): ListItem[] {
            const flatList: ListItem[] = [];
            for (let item of list) {
                flatList.push(item);
                if (item.hasNestedItems()) {
                    const nestedList = item.getNestedItems();
                    flatList.push(...flattenList(nestedList));
                }
            }
            return flatList;
        }
        const expandedListItems = flattenList(list)

        // for (let item of list) {
        //     if (item.hasNestedItems()) {
        //         for (let nestedItem of item.getNestedItems()) {
        //             expandedListItems.push(nestedItem);
        //         }
        //     } else {
        //         expandedListItems.push(item);
        //     }
        // }
        let foundItem: ListItem = expandedListItems.find(item => {
            if (item.getInnerModel().isFolderListItemModel) {
                return item.getInnerModel().folder.id === id
            }
            return item.getInnerModel().id === id
        })
        return foundItem;

    }

    getFilteredItemsWithSearchWord(dis: MasterViewOpenTreeEventDelegate) {
        return dis.filteredTabContent.filter(dis.getFilterFunc).length;
    }

    public getLastNavigatedListItem(masterViewDelegate: MasterViewOpenTreeEventDelegate, rootLevelListItem: ListItem): ListItem | null {
        let listItem: ListItem | null = rootLevelListItem;
        const range = masterViewDelegate.openTree.indexes.slice(1, masterViewDelegate.openTree.indexes.length)
        for (const index of range) {
            if (listItem.hasNestedItems() && index >= 0 && index < listItem.getNestedItems().length) {
                listItem = listItem.getNestedItems()[index];
                listItem.setSelected(false)
                this.setSelectedListItem(listItem, listItem.nestedDepth)
            }
        }
        masterViewDelegate.openTree.listItem = rootLevelListItem
        return listItem;
    }

    public updateLastItems(listItem: any, masterViewDelegate: MasterViewOpenTreeEventDelegate): void {
        if (listItem.getDisplayText() === masterViewDelegate.currentRootLevelTab) {
            return
        }

        if (this.isLibraryRootTab(listItem)) {
            if (masterViewDelegate.masterViewList.length > 1) {
                this._resetList(masterViewDelegate.masterViewList, listItem)
                masterViewDelegate.masterViewList.find(item => {
                    if (item.getDisplayText() === listItem.getDisplayText()) {
                        masterViewDelegate.rootParentIndex = masterViewDelegate.masterViewList.indexOf(item);
                        masterViewDelegate.currentRootLevelTab = item.getDisplayText();
                        masterViewDelegate.openTree = { listItem: listItem, indexes: [masterViewDelegate.rootParentIndex], childIndex: 0 };
                    }
                });
            }
        } else {
             let rootParentListItem = masterViewDelegate.masterViewList[masterViewDelegate.rootParentIndex];
             if (rootParentListItem) {
                masterViewDelegate.openTree = this.findInNestedStructureIndexes(rootParentListItem, listItem.getDisplayText(), [masterViewDelegate.rootParentIndex]);
             } else {
                console.error("rootParentListItem is undefined")
            }
        }
    }

    public isLibraryRootTab(listItem: ListItem): boolean {
        return listItem.folderId === undefined && listItem.id === undefined
            && listItem.getInnerModel() instanceof Array
            && listItem.nestedDepth === 1
    }
    
    public resetList(list: ListItem[], rootTab: ListItem, masterViewDelegate: MasterViewOpenTreeEventDelegate, isRecentItemTab: boolean): void {
        this._resetList(list, rootTab, isRecentItemTab)
        if (isRecentItemTab) {
            return
        }
        this.getLastNavigatedListItem(masterViewDelegate, rootTab);
    }
    
    public getStringOpenPath(root: ListItem, target: string): string {
        const path = this.findInNestedStructure(root, target)
        return path?.length > 0 ? path.join(this.breadCrumbSeparator) + `${this.breadCrumbSeparator}${target}` : target
    }

    // NOT BEING USED 
    private findInNestedStructure(root: ListItem, targetValue: string, parents: string[] = []): string[] | null {
        if (root.getDisplayText() === targetValue) {
            return parents;
        }
        
        if (root.hasNestedItems()) {
            for (const child of root.getNestedItems()) {
            const result = this.findInNestedStructure(child, targetValue, [...parents, root.getDisplayText()]);
            if (result) {
                return result;
            }
            }
        }
        return null; 
    }

    // WE USING THIS FOR INDEXING PURPOSES
    private findInNestedStructureIndexes(root: ListItem, targetValue: string, parentIndexes: number[] = []): MasterViewOpenTree | null {
        if (root.getDisplayText() === targetValue) {
            return { listItem: root, indexes: parentIndexes, childIndex: 0 };
        }

        if (root.hasNestedItems()) {
            const currentItem = root.getNestedItems()
            for (let i = 0; i < currentItem.length; i++) {
                const child = currentItem[i];
                const result = this.findInNestedStructureIndexes(child, targetValue, [...parentIndexes, i]);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    private flattenList(list: any[]): any[] {
        return _.flatMapDeep(list, item => {
            if (item.hasNestedItems()) {
                return [item, ...this.flattenList(item.getNestedItems())]
            } else {
                return item
            }
        })
    }
    
    private _resetList(list: ListItem[], rootTab: ListItem, resetAll: boolean = false) {
        const flattenedList = this.flattenList(list)
        flattenedList.map(
            (item: ListItem) => {
                if (!resetAll) {
                    if (item.getDisplayText() !== rootTab.getDisplayText()) {
                        item.setSelected(false)
                        item.isColoured = false
                    }
                } else {
                    item.setSelected(false)
                    item.isColoured = false
                    item.isFocused = false
                }
                return item
            }
        )
    }
}

import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ListItem } from "../models/list-item";
import { AMPStatus } from "../../../enums/status";


/**
 * Determines if an item can be dragged based on its previous and current positions and a specified range.
 *
 * @param {number} prev - The previous position of the item.
 * @param {number} cur - The current position of the item.
 * @param {number[]} range - An array representing the range within which the item can be dragged.
 * @returns {boolean} - Returns true if the item can be dragged, false otherwise.
 */
function itemCanBeDragged(prev: number, cur: number, range: number[]): boolean {
    const isPrevItemInGivenRange = range.includes(prev);
    const isCurrentItemInGivenRange = range.includes(cur);
    return isPrevItemInGivenRange && isCurrentItemInGivenRange;
}

/**
 * Handles the drag and drop event for a list of items.
 *
 * @param event - The drag and drop event from Angular CDK.
 * @param folderDraggableRanges - An array representing the range within which folder items can be dragged.
 * @param looseItemDraggableRanges - An array representing the range within which loose items can be dragged.
 * @returns Returns true if the drag and drop operation was successful, false otherwise.
 */
export function ampOnDragDrop(event: CdkDragDrop<ListItem[]>,
                              folderDraggableRanges: number[],
                              looseItemDraggableRanges: number[]): boolean {
    const canBeDragged = itemCanBeDragged(event.previousIndex, event.currentIndex, folderDraggableRanges)
        || itemCanBeDragged(event.previousIndex, event.currentIndex, looseItemDraggableRanges)

    if (canBeDragged) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        return true
    } else {
        console.warn('Drag and drop operation not performed. Item is not within the desired indexes.')
        return false
    }
}

export function masterViewReOrdered(listItem: ListItem[]): Array<number | bigint> {
    return listItem.map(item => {
        const _item = item.getInnerModel()
        if (_item.isFolderListItemModel) {
            return item.id
        }
        return item.getInnerModel().identifier
    })
}

export function updateDraggableRanges(listItem: Array<ListItem>, folderRef: Array<number>, looseItemRef: Array<number>, isDragAvailable: boolean = false) {
    if (listItem.length <= 0) { return }

    listItem.forEach((item, index) => {
        if (item.isFolder) {
            folderRef.push(index);
        } else {
            looseItemRef.push(index);
            if (item.getInnerModel().status === AMPStatus.DRAFT) {
                // FIXME: Disabled for now, but maybe required some time.
                // isDragAvailable = false
            }
        }
    });
}

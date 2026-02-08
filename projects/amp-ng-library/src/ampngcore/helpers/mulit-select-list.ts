import { Subject } from "rxjs";


export interface MultiSelectList {
    /** observable used for the offline system */
    selectedOrDeselected$: Subject<bigint[]> 
    selectItem(index);
    isSelected(index): boolean;
    getSelectedItemStyle(index): string;
    clearSelection();
    getSelected(): number[];
    hasSelected(): boolean;
    getSelectedIdentifiers(): bigint[];
    isSelectedByIdentifier(identifier: bigint): boolean;
}

export class MultiSelectListMediator implements MultiSelectList {

    selectedIndices: number[] = [];
    selectedIdentifiers: bigint[] = [];
    selectedOrDeselected$: Subject<bigint[]> = new Subject<bigint[]>()

    selectItem(index, identifier?) {
        if (this.selectedIndices.includes(index)) {
            this.selectedIndices.splice(this.selectedIndices.indexOf(index), 1);
        } else {
            this.selectedIndices.push(index);
        }
        if (!!identifier) {
            if (this.selectedIdentifiers.includes(identifier)) {
                this.selectedIdentifiers.splice(this.selectedIdentifiers.indexOf(identifier), 1);
            } else {
                this.selectedIdentifiers.push(identifier)
            }
        }
        this.selectedOrDeselected$.next(this.selectedIdentifiers)
    }

    hasSelected(): boolean {
        return this.selectedIndices.length > 0;
    }

    isSelected(index): boolean {
        return this.selectedIndices.includes(index)
    }

    getSelectedItemStyle(index): string {
        return this.isSelected(index) ? 'card-selected' : '';
    }

    clearSelection() {
        this.selectedIndices = [];
        this.selectedIdentifiers = []
    }

    getSelected() {
        return this.selectedIndices;
    }

    getSelectedIdentifiers(): bigint[] {
        return this.selectedIdentifiers
    }

    isSelectedByIdentifier(identifier: bigint): boolean {
        return !!this.selectedIdentifiers.find(selectedIdentifier => selectedIdentifier === identifier)
    }

}

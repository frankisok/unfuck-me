import { BehaviorSubject } from 'rxjs';
import { ActionPopoverController } from './action-popover.parent';
export default class GenericActionPopoverController implements ActionPopoverController {

    private _isOpen: boolean = false;
    /** This is the same as calling isActionPopoverOpen() */
    public readonly isOpen: BehaviorSubject<boolean>;

    constructor() {
        this._isOpen = false;
        this.isOpen = new BehaviorSubject(this._isOpen);
    }

    closeActionPopover(): void {
        this._isOpen = false;
        this.isOpen.next(this._isOpen);
    }

    /** @deprecated in favor of observable {@link isOpen}*/
    isActionPopoverOpen(): boolean {
        return this._isOpen;
    }

    openActionPopover(): void {
        this._isOpen = true;
        this.isOpen.next(this._isOpen);
    }

}

import { BehaviorSubject } from "rxjs";

export interface ActionPopoverController {
    openActionPopover();
    closeActionPopover();
    isActionPopoverOpen();
    readonly isOpen: BehaviorSubject<boolean>;
}

export interface ActionPopoverMediator {
    closeActionPopovers(popoverCtrls: Array<ActionPopoverController>);
    openPopover(popoverCtrls: Array<ActionPopoverController>, popoverCtrl: ActionPopoverController);
    getOpenPopover(popoverCtrls: Array<ActionPopoverController>): ActionPopoverController;
}

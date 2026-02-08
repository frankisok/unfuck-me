import {ActionPopoverController, ActionPopoverMediator} from './action-popover.parent';

export default class GenericActionPopoverMediator implements ActionPopoverMediator {
    closeActionPopovers(popoverCtrls: Array<ActionPopoverController>) {
        popoverCtrls.forEach((popoverCtrl) => popoverCtrl.closeActionPopover());
    }

    getOpenPopover(popoverCtrls: Array<ActionPopoverController>): ActionPopoverController {
        return popoverCtrls.find(popoverCtrl => popoverCtrl.isActionPopoverOpen());
    }

    openPopover(popoverCtrls: Array<ActionPopoverController>, popoverCtrl: ActionPopoverController) {
        this.closeActionPopovers(popoverCtrls);
        popoverCtrl.openActionPopover();
    }
}

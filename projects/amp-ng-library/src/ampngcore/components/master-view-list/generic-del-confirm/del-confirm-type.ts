import { Type } from "@angular/core";
import { MasterViewToolbarAction } from "../../master-view-toolbar/master-view-toolbar-action";
import { ActionPopoverController } from "../../popovers/action-popover.parent";
import { DelContentConfirmDelegate } from "./generic-del-confirm.delegate";

export enum DelConfirmType {
    INTERNAL,
    EXTERNAL,
}


/**
 * @description This interface is used to define the properties of the generic delete confirm component
 * In our case, this is only used for the master view toolbar
 * 
 * @Note: It must contain one of the optional fields
 */
export interface DelConfirmProps {
    content?: { [keyof: string]: any };
    folderItemModel?: { [keyof: string]: any };
    other?: { [keyof: string]: any };
}

/**
 * @description This interface is used to define configuration for a toolbar action, where the params are:
 * @className Additional class name to be added to the toolbar action, if needed
 * @toolbarActions Array of toolbar actions to be displayed
 * @deleteType Type of delete confirm to be displayed. where the options are INTERNAL or EXTERNAL
 *  - INTERNAL(0): The delete confirm is displayed within the library itself
 *  - EXTERNAL(1): The delete confirm is displayed outside the library, like the client app.
 * @popOverRef Reference to the popover controllers, dictionary of popover controllers.
 * @shouldReCreate Flag to indicate if the toolbar should be recreated, this needed to 
 */
export interface ToolBarAction extends DelConfirmProps {
    className: string;
    toolbarActions: Array<MasterViewToolbarAction>;
    deleteType?: DelConfirmType;
    popOverRef: { [key: string]: ActionPopoverController }
    shouldReCreate?: boolean;
}

export interface MasterViewToolbarConfig {
    delegate: DelContentConfirmDelegate,
    config: ToolBarAction,
    toolBarActionsComponent?: Type<any>;
}
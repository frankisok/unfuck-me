import {MasterViewToolbarAction} from '../master-view-toolbar-action';

export interface MasterViewToolbarController {
    getToolbarActions(): Array<MasterViewToolbarAction>;
    getToolbarStateStyle(): string;
}

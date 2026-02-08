
export class MasterViewToolbarAction {
    private readonly _icon;
    private readonly _onActionEvent;
    private readonly _className;

    constructor(icon, className, eventHandler) {
        this._icon = icon;
        this._className = className;
        this._onActionEvent = eventHandler;
    }

    get icon() {
        return this._icon;
    }

    get onActionEvent() {
        return this._onActionEvent;
    }

    get className() {
        return this._className;
    }
}


export enum ListItemIconType {
    IMAGE_ASSET,
    ICON
}

export enum ListItemIconConfigStates {
    NORMAL,
    SELECTED
}

export class ListItemIconConfig {

    private readonly iconStateMap;
    private readonly iconType: ListItemIconType;
    private readonly className: string;

    constructor(iconType: ListItemIconType, className: string) {
        this.iconType = iconType;
        this.className = className;
        this.iconStateMap = {
            [ListItemIconConfigStates.NORMAL] : '',
            [ListItemIconConfigStates.SELECTED]: ''
        };
    }

    pushIconState(state, asset) {
        this.iconStateMap[state] = asset;
    }

    getAssetForIconState(state) {
        return this.iconStateMap[state];
    }

    isImage() {
        return this.iconType === ListItemIconType.IMAGE_ASSET;
    }

    isIcon() {
        return this.iconType === ListItemIconType.ICON;
    }

    getClassName(state) {
        return `${this.className}--${state}`
    }
}

export class ListItemConfig {

    private readonly _leftHeadingIconConfig: ListItemIconConfig;
    private readonly _leftIconConfig?: ListItemIconConfig;
    private readonly _primaryIconConfig?: ListItemIconConfig;
    private readonly _secondaryIconConfig?: ListItemIconConfig;
    private readonly _tertiaryIconConfig?: ListItemIconConfig;

    constructor(iconConfig) {
        this._leftHeadingIconConfig = iconConfig.leftHeading;
        this._leftIconConfig = iconConfig.left;
        this._primaryIconConfig = iconConfig.primary;
        this._secondaryIconConfig = iconConfig.secondary;
        this._tertiaryIconConfig = iconConfig.tertiary;
    }

    get leftHeadingIconConfig(): ListItemIconConfig {
        return this._leftHeadingIconConfig;
    }

    get leftIconConfig(): ListItemIconConfig {
        return this._leftIconConfig;
    }

    get getPrimaryIconConfig(): ListItemIconConfig {
        return this._primaryIconConfig;
    }

    get getSecondaryIconConfig(): ListItemIconConfig {
        return this._secondaryIconConfig;
    }

    get getTertiaryIconConfig(): ListItemIconConfig {
        return this._tertiaryIconConfig;
    }

    getIcons() {
        return {
            leftHeading: this._leftHeadingIconConfig,
            left: this._leftIconConfig,
            primary: this._primaryIconConfig,
            secondary: this._secondaryIconConfig,
            tertiary: this._tertiaryIconConfig
        }
    }
}

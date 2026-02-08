import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, isDevMode, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {ListItem} from './models/list-item';
import {MasterViewListItemEventDelegate} from './interfaces/master-view-list-item-event-delegate';
import { ListItemIconConfigStates} from './models/list-item-config';

import { AMPStatus, ampOnDragDrop, masterViewReOrdered, memo, updateDraggableRanges } from '../../core';
import { Router } from '@angular/router';
import { LocationStrategy } from '@angular/common';
// import { PlaybackContent } from 'app/_interfaces/playback-content';
import { LibraryConfigService } from '../../../library/library-config-service';
import { DelegateType } from './_enum/delegate-type';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { AMPAccount, Venue } from '../../models';

/**
 * @Note: This component should not use OnPush due to extensive calculations, 
 * delegation, item selection and deselection, and icon indentation changes.
 */
@Component({
    selector: 'app-master-view-list-item',
    templateUrl: './master-view-list-item.component.html',
    // changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./master-view-list-item.component.scss'],
    standalone: false
})
export class MasterViewListItemComponent implements OnInit, OnChanges {

    DRAFT_STATUS = AMPStatus.DRAFT
    READY_TO_PUBLISH_STATUS = AMPStatus.READY_TO_PUBLISH

    @Input() listItem: ListItem;
    @Input() index: number;
    @Input() nestedDepth: number;
    @Input() eventDelegate: MasterViewListItemEventDelegate;
    @Input() delegateType: DelegateType;
    @Input() className?: string;
    @Input() isDashboard?: boolean;
    @Input() isDebugMode?: boolean;
    @Input() dirtyTimeStamp?: number;
    /** because we use master-view tool tab, if/when master-view has too many
     * list items the last one is not shown, sop using teh last item flag is
     * necessary to set margin bottom */
    @Input() lastItem?: boolean;
    
    // draggable handlers
    @Output() itemsReordered: EventEmitter<any> = new EventEmitter<any>();
    folderDraggableRanges: number[] = [];
    looseItemDraggableRanges: number[] = [];
    public isDragAvailable: boolean = true;
    listItemDepthPadding: { 1: { 'padding-left': string; }; 2: { 'padding-left': string; }; };
    isMobile: boolean;

    //For SVG
    fillColor: string | undefined;
    styleRoot: HTMLElement;

    constructor(
        // private account: AccountService,
        protected configService: LibraryConfigService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private location: LocationStrategy
    ) {
        this.styleRoot = document.documentElement;
		this.fillColor = getComputedStyle(this.styleRoot).getPropertyValue('--atmosphere-main-color').trim();
    }

    ngOnInit(): void {
        this.isMobile = this.configService.isMobile();
        this.addNestedDepth(this.listItem, this.nestedDepth)
        this.setupDepthPadding();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['listItem'] && changes['listItem'].currentValue !== changes['listItem'].previousValue) {
            const listItem: ListItem = changes['listItem'].currentValue;
            updateDraggableRanges(listItem.getNestedItems(), this.folderDraggableRanges, this.looseItemDraggableRanges);
            this.setupDepthPadding();
        }
    }

    addNestedDepth(listItem: ListItem, nestedDepth) {
        listItem.nestedDepth = nestedDepth
        if (listItem.hasNestedItems()) {
            let newNestedDepth = nestedDepth + 1
            for (let item of listItem.getNestedItems()) {
                this.addNestedDepth(item, newNestedDepth)
            }
        }
    }

    listItemIsCollapseOpen() {
        return this.listItem.hasNestedItems() && this.listItem.isSelected();
    }

    listItemOnClick(event) {
        if (this.listItem.isFolder) {
            this.location.replaceState(null, null, `${this.router.url.split('?')[0]}`, '')
        }
        event.nestedDepth = this.nestedDepth;
        this.eventDelegate.listItemSelected(event, this.listItem);
    }
    
    // not using memo on this because it's not a performance bottleneck and it requires adding to list-item observable. will not change it for now
    getListItemStyleState() {
        const listItemStyles = [];
        listItemStyles.push(this.lastItem ? 'master-view-last-item' : '')
        listItemStyles.push((this.listItemIsCollapseOpen()) ? 'master-view-list__list-item--collapse-open' : '');
        listItemStyles.push((!this.listItem.hasNestedItems() && this.listItem.isSelected()) ? 'master-view-list__list-item--selected' : '');
        listItemStyles.push((!this.listItem.hasNestedItems() && !this.listItem.isSelected() && this.nestedDepth > 1) ? 'master-view-list__list-item--not-selected' : '');
        listItemStyles.push(!(this.index === 0 && this.nestedDepth === 1) ? 'master-view-list__list-item--margin-top' : '');
        listItemStyles.push (!!this.className ? this.className : '')
        return listItemStyles.join(' ');
    }

    getLeftIcon() {
        let leftIcon;
        if (this.listItem.hasNestedItems()) {
            leftIcon = this.listItem.getIcons().leftHeading;
        } else {
            leftIcon = this.listItem.getIcons().left;
        }
        return leftIcon;
    }

    getDashboardIcon() {
        let leftIcon;

        if (this.listItem.getInnerModel().mediaType === 2) {
            leftIcon = this.listItem.getIcons().primary;
        } else if (this.listItem.getInnerModel().mediaType === 1) {
            leftIcon = this.listItem.getIcons().secondary;
        } else if (this.listItem.nestedDepth === 1) {
            leftIcon = this.listItem.getIcons().leftHeading;
        } else if (this.listItem.nestedDepth === 2) {
            leftIcon = this.listItem.getIcons().left;
        } else {
            leftIcon = this.listItem.getIcons().tertiary;
        }
        return leftIcon;
    }

    getAdminDebugModeIcons() {
        let leftIcon;
        if (this.listItem.nestedDepth === 1) {
            leftIcon = this.listItem.getIcons().leftHeading;
        } else if (this.listItem.nestedDepth === 2) {
            leftIcon = this.listItem.getIcons().left;
        } else if (this.listItem.getInnerModel().mediaType === 2) {
            leftIcon = this.listItem.getIcons().primary;
        } else if (this.listItem.nestedDepth === 3) {
            leftIcon = this.listItem.getIcons().secondary;
        } else {
            leftIcon = this.listItem.getIcons().tertiary;
        }
        return leftIcon;
    }

    getListItemPrefixIcon() {
        let leftIcon
        if (this.isDebugMode) {
            leftIcon = this.getAdminDebugModeIcons();
        } else if (this.isDashboard) {
            leftIcon = this.getDashboardIcon();
        } else {
            leftIcon = this.getLeftIcon();
        }
        if (this.listItem.getInnerModel().isFolderListItemModel === undefined) {
            return (this.listItem.isSelected() && !this.listItem.hasNestedItems()) ? leftIcon.getAssetForIconState(ListItemIconConfigStates.SELECTED) : leftIcon.getAssetForIconState(ListItemIconConfigStates.NORMAL);
        }
        return this.listItem.isColoured ? leftIcon.getAssetForIconState(ListItemIconConfigStates.SELECTED) : leftIcon.getAssetForIconState(ListItemIconConfigStates.NORMAL);
    }

    getIconClassName() {
        let leftIcon
        if (this.isDebugMode) {
            leftIcon = this.getAdminDebugModeIcons();
        } else if (this.isDashboard) {
            leftIcon = this.getDashboardIcon();
        } else {
            leftIcon = this.getLeftIcon();
        }
        return (this.listItem.isSelected() && !this.listItem.hasNestedItems()) ? leftIcon.getClassName(ListItemIconConfigStates.SELECTED) : leftIcon.getClassName(ListItemIconConfigStates.NORMAL);
    }

    isListItemPrefixImage() {
        let leftIcon
        if (this.isDebugMode) {
            leftIcon = this.getAdminDebugModeIcons();
        } else if (this.isDashboard) {
            leftIcon = this.getDashboardIcon();
        } else {
            leftIcon = this.getLeftIcon();
        }
        return leftIcon.isImage();
    }

    isListItemPrefixIcon() {
        let leftIcon
        if (this.isDebugMode) {
            leftIcon = this.getAdminDebugModeIcons();
        } else if (this.isDashboard) {
            leftIcon = this.getDashboardIcon();
        } else {
            leftIcon = this.getLeftIcon();
        }
        return leftIcon.isIcon();
    }

    getListItemPostfixIcon() {
        let postFixIcon = '';

        if (this.listItemIsCollapseOpen()) {
            postFixIcon = 'fa-chevron-up';
        } else if (this.listItem.hasNestedItems()) {
            postFixIcon = 'fa-chevron-down';
        } else if (this.listItem.isSelected()) {
            postFixIcon = 'fa-chevron-right';
        }

        return postFixIcon;
    }

    // componentStyle value of `1` represent the old padding style `2` represent the new padding style
    /**@deprecated in favor of {@link listItemDepthPadding} */
    getListItemDepthPadding(componentStyle) {
        if (!!this.className) return {}
        return componentStyle === 1 ? {'padding-left': `${this.nestedDepth * 28}px`} : {'padding-left': `${this.nestedDepth * 14}px`}
    }

    /**@deprecated no need for this, the value should passed directly in the template */
    getNextNestedDepth() {
        return this.nestedDepth + 1;
    }

    getListItemContainerStyleState() {
        return (this.nestedDepth === 1) ? 'master-view-list__list-item__container--lg' : '';
    }

    /**@deprecated no need for this, the value should passed directly in the template */
    getNestedContainerStyleState() {
        return (this.nestedDepth === 1) ? 'master-view-list__list-item__nested-container--scrolling' : '';
    }

    isFolder(): boolean {
        return this.listItem.getInnerModel().isFolderListItemModel
    }

    isMyContentDelegate() {
        return this.delegateType === DelegateType.MyContent
    }

    isAdmin(): boolean {
        return this.configService.accountInfo.isAdmin
    }

    getDraftColor() {
        if (this.isAdmin()) {
            const isDraftItem = this.listItem.getInnerModel().status === this.DRAFT_STATUS;

            if (this.isMyContentDelegate() && !this.listItem.isFolder && isDraftItem) {
                return true
            } else if (this.configService.isContentMode() && isDraftItem) {
                return true
            }
            return false
        } else {
            return false
        }
    }

    onDrop(event: CdkDragDrop<ListItem[]>) {
        const r = ampOnDragDrop(event, this.folderDraggableRanges, this.looseItemDraggableRanges);
        if (r) {
            const reorderItems = masterViewReOrdered(event.container.data)
            this.itemsReordered.emit({
                ids: reorderItems,
                folderId: event.container.data[0].folderId,
                folderCount: this.folderDraggableRanges.length
            })
        }
    }

    // for recursion
    onReorderUpdateMasterView(event) {
        this.itemsReordered.emit(event);
    }
    
    private setupDepthPadding() {
        this.listItemDepthPadding = {
            1: {'padding-left': `${this.nestedDepth * 28}px`},
            2: {'padding-left': `${this.nestedDepth * 14}px`}
        }
    }

  /**
   * Logic:
   * 1. `isDraftItem`: Relevant for any versionable list item object, including playlists, programmes, schedules, library content items, and products.
   * 2. `isPlayback`: True for playlists, programmes or schedules
   * 3. `isContentMode`: True for admin user content mode
   *
   * The method returns true if:
   * - 1. The item is a draft AND
   * - Either:
   *   - 2a. We are admin user and viewing playback or content mode
   *   - 2b. We are normal user, in dev mode, and viewing playback
   *
   *   NOTE: Conditions 1 and 2a are the same as always. Condition 2b is what is added for the normal user publishing feature.
   */
    protected isDraftColourEnabled(): boolean
    {
      const isDraftItem = this.listItem.getInnerModel().status === AMPStatus.DRAFT
      const isPlayback = this.isMyContentDelegate()
      const isContentMode = this.configService.isContentMode()
      return isDraftItem &&
        ((this.isAdmin() && (isContentMode || isPlayback)) || (isDevMode() && isPlayback))
    }
}

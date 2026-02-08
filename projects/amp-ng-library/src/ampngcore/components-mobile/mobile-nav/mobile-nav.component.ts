import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ListItem, MasterViewOpenTreeEventDelegate } from '../../core';
import { LibraryConfigService } from '../../../library/library-config-service';

@Component({
    selector: 'lib-mobile-nav',
    templateUrl: './mobile-nav.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./mobile-nav.component.scss'],
    standalone: false
})
export class MobileNavComponent implements OnInit {
    @Input() listItems: Array<ListItem>;
    @Input() eventDelegate: MasterViewOpenTreeEventDelegate;
	@Input() isMenuOpen: boolean;

    isMobile: boolean;
    showCards: boolean = false;
    currentListItem: ListItem;
    rootIndex: number;
    nestDepth: number = 1;
    openPath: string = '';

    constructor(
        private cdr: ChangeDetectorRef,
        private configService: LibraryConfigService,
    ) { }
    ngOnInit(): void {
        this.isMobile = this.configService.isMobile();
        this.configService.detailViewPropsListener$.subscribe((data) => {
            let rootIndex = this.eventDelegate.rootParentIndex;
            if (!this.currentListItem?.hasNestedItems()) {
                this.currentListItem = this.listItems[rootIndex];
            }
            this.openPath = data.openPath || '';
            this.rootIndex = rootIndex;
            this.showCards = data.showCards;
            this.cdr.markForCheck();
        });
        
        this.configService.backIsClicked$.subscribe((data) => {
            this.backClicked(data)
        });
    }

    ngOnChanges(): void {
    }

    listItemOnClick(event, listItem) {
        if (event.nestedDepth === undefined) {
            event.nestedDepth = 1;
        }
        // deselect the previous 
        this.listItems.map((item) => {
            (item as any).selected = false;
            // if (item.getNestedItems().length > 0) {
            //     item.getNestedItems().map((nestedItem) => {
            //         nestedItem.selected = false;
            //     });
            // }
        });

        this.currentListItem = listItem;
        this.eventDelegate.listItemSelected(event, listItem);
    }

    mobileBackOrMenuClick(e: 'menu' | 'back') {
        this.eventDelegate.mobileBackOrMenuClick(e);
    }
    
    private backClicked(event: any) {
       if (event.part === this.currentListItem?.getDisplayText() && event.nestedDepth !== 1) {
        return;
       }
        // recursively find the listItem where the display text matches the part, and return it
        let listItem = this.findListItem(this.listItems, event.part);
        this.currentListItem = listItem;
        this.eventDelegate.listItemSelected(event, listItem);
    }

    private findListItem(listItems: ListItem[], part: any): ListItem {
        let listItem = listItems.find((item) => item.getDisplayText() === part);
        if (listItem) {
            return listItem;
        }
        for (let i = 0; i < listItems.length; i++) {
            let item = listItems[i];
            if (item.hasNestedItems()) {
                listItem = this.findListItem(item.getNestedItems(), part);
                if (listItem) {
                    return listItem;
                }
            }
        }
        return null;
    }

}

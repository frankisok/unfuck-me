import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { breadCrumbSeparator, ListItem } from '../../../core';
import { LibraryConfigService } from '../../../../library/library-config-service';
@Component({
    selector: 'lib-mobile-nav-card-items',
    templateUrl: './mobile-nav-card-items.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./mobile-nav-card-items.component.scss'],
    standalone: false
})
export class MobileNavCardItemsComponent implements OnInit {

	@Input() nestedPath: string;
	@Input() listItems: ListItem[];
	@Input() nestedDepth: number;
	@Output() itemClick = new EventEmitter();

	readonly breadCrumbSeparator = breadCrumbSeparator

	constructor(
		private configService: LibraryConfigService,
	) { }

	listItemOnClick(event: any, listItem: any) {
		event.nestedDepth = this.nestedDepth + 1;
		this.itemClick.emit({ event, listItem });
	}

	ngOnInit(): void {

	}

	closeCards() {
		// TODO: reset the selected tab to the current root index select tab
		this.configService.updateDetailViewProps({
			...this.configService.detailViewProps,
			showCards: false,
			isDetailView: true
		})
	}

	isTheLastItem(part: string) {
		const indexPart = this.nestedPath.split(breadCrumbSeparator).indexOf(part);
		const len = this.nestedPath.split(breadCrumbSeparator).length
		return indexPart + 1 === len ? 'last-item' : ''
	}

	mobileOnPartClick(part: string) {
		this.configService.backIsClicked$.next({
			nestedDepth: this.nestedDepth + 1,
			part: part
		})
	}
}

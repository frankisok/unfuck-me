import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '../../../models';
import { LibraryAssetsService } from '../../../services/assets.service';

@Component({
	selector: 'lib-recursive-tag-tree',
	templateUrl: './recursive-tag-tree.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['./recursive-tag-tree.component.scss'],
	standalone: true,
	imports: [NgClass, NgIf, NgFor]
})
export class RecursiveTagTreeComponent implements OnInit {

	@Input() tags: Tag[]
	@Input() isSelected: Tag

	@Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();

	constructor(
		protected assetsService: LibraryAssetsService,
	) {
	}

	ngOnInit(): void {
	}

	selectedTag(event, item) {
		event.stopPropagation()
		if (this.isSelected === item) {
			this.isSelected = null
		} else {
			this.isSelected = item
		}
		this.selectedItem.emit(item)
	}

	selectedChildTag(item) {
		this.selectedItem.emit(item)
	}

	childClicked(event) {
		event.stopPropagation();
	}

}

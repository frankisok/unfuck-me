
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { NgbDateStruct, NgbCalendar, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import {UnSub} from '../../helpers/unsub.class';
import {memo} from '../../helpers/generic-memo';


type ContainerPlacement = 'top' | 'bottom' | 'left' | 'right';

@Component({
    selector: 'app-amp-date-picker',
    templateUrl: './amp-date-picker.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./amp-date-picker.component.scss'],
    standalone: false
})
/**
 * Component for an interactive date picker.
 *
 * This component provides a date picker interface that allows users to select dates and emits selected
 * date values when a date is chosen. It also supports dynamic placement and the ability to close the picker
 * when clicking outside the component.
 *
 * @export
 * @class AmpDatePickerComponent
 * @implements {OnInit}
 */
export class AmpDatePickerComponent extends UnSub implements OnInit {
	
	private _placement: string = 'bottom';
	showDatepicker: boolean = false;
	selectedDate: NgbDateStruct;
	model: NgbDateStruct;
	
	@Input() currentDate?: string | NgbDateStruct;
	/**
	 * use `::ng-deep` or `ViewEncapsulation.None` to target the app-amp-date-picker main container 
	 * anchor tag with the with your `css class name`. You can replace the `default` style with 
	 * whatever style you have set in the `css class name above`.
	 * 
	 * @example
	 * added the following line in the css component that uses the `app-amp-date-picker`
	 * - ::ng-deep app-amp-date-picker .datepicker-container.top.mycolor {background-color: white;}
	 */
	@Input() cssClassName?: string = '';
	@Input() calenderColor?: string = '';
	@Input() placement?: string;
	@Input() minDate?: NgbDateStruct;
	/** If the date should be returned as date struct or string. default is string */
	@Input() as?: 'date' | 'string' = 'string';
	/** Emits the selected date as either string or date struct*/
	@Output() dateSelected: EventEmitter<any> = new EventEmitter<any>();

	constructor(
		private calendar: NgbCalendar,
	) {
		super();
		this.selectedDate = this.calendar.getToday();

	}
	ngOnInit(): void {
		if (this.placement && this.isContainerPlacement(this.placement)) {
			this._placement = this.placement;
		}
		this.setMinDate()
	}

	setMinDate() {
		if (!this.minDate) {
			let d = new Date(Date.now());
			this.minDate = { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() };
		} else {
			this.minDate = this.selectedDate;
		}
	}

	closeCalendar(event) {
		//console.log(event);
		if (event.visible) {
			this.showDatepicker = false
		}
	}
	
	toggleDatepicker(enabled?: boolean) {
		if (enabled !== undefined) {
			this.showDatepicker = enabled;
		}
		else {
			this.showDatepicker = !this.showDatepicker;
		}
	}
	
	@memo('currentDate')
	displayedDate() {
		if (this.as === 'date') {
			return this.formatDate(this.currentDate as NgbDateStruct)
		}
		return this.currentDate ? this.currentDate : this.formatDate(this.selectedDate)
	}
	
	formatDate(date: NgbDateStruct): string {
		if (!date) return null;
		return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
	}
	
	dateChanged(date: NgbDateStruct): void {
		// this.selectedDate = date;
		if (this.as === 'date') {
			this.dateSelected.emit(date);
			this.toggleDatepicker();
			return
		}
		this.dateSelected.emit(this.formatDate(date));
		this.toggleDatepicker();
	}

	get containerStyle(): string {
		return `datepicker-container ${this._placement} ${this.cssClassName ? `${this.cssClassName}` : ''}`
	}

	isContainerPlacement(value: string): value is ContainerPlacement {
		return ['top', 'bottom', 'left', 'right'].includes(value);
	}

}

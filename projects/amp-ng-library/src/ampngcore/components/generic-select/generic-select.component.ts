import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UnSub } from '../../helpers/unsub.class';


@Component({
    selector: 'app-generic-select',
    templateUrl: './generic-select.component.html',
    styleUrls: ['./generic-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GenericSelectComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class GenericSelectComponent extends UnSub implements ControlValueAccessor {
	@Input() items: Array<any>;
	@Input() bindName?: string;
	@Input() containerCssName?: string;
	@Input() dropDownContainerCssName?: string;
	@Input() className?: string = '';
	@Input() disabled: boolean = false;
	@Input() placeholder?: string = '';
	@Input() outputIndex?: boolean = false;
	@Output() change = new EventEmitter<any>();
	selectedItem: any;

	writeValue(value: any): void {
		// this.selectedItem = value;
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}

	selectItem(item: any, index: number) {
		this.selectedItem = item;
		this.onChange(item);
		this.onTouched();
		if (this.outputIndex) {
			this.change.emit({value: item, index: index});
		}
		this.change.emit(item);
	}

	getDisplayName() {
		if (this.selectedItem !== undefined) {
			if (this.bindName) {
				return this.selectedItem[this.bindName];
			}
			return this.selectedItem?.name || this.selectedItem;
		}
		return '';
	}
	// The onChange and onTouched methods are part of the ControlValueAccessor interface
	private onChange = (value: any) => { };
	private onTouched = () => { };
}

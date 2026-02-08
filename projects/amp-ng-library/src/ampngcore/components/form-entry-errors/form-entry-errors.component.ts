import { ChangeDetectionStrategy,Component, Input, OnInit} from '@angular/core';
import {AbstractControl, UntypedFormGroup} from '@angular/forms';

@Component({
    selector: 'app-form-entry-errors',
    templateUrl: './form-entry-errors.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./form-entry-errors.component.scss'],
    standalone: false
})
export class FormEntryErrorsComponent implements OnInit {

    @Input() form: UntypedFormGroup;
    @Input() entryName: string = "";

    @Input() minLength: number = 2;
    @Input() maxLength: number = 30;

    control: AbstractControl;

    constructor() { }

    ngOnInit() {
        this.control = this.form.get(this.entryName);
    }
}

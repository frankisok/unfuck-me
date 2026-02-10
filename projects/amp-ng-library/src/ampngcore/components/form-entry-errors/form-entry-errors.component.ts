import { ChangeDetectionStrategy,Component, Input, OnInit} from '@angular/core';
import { AbstractControl, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-form-entry-errors',
    templateUrl: './form-entry-errors.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./form-entry-errors.component.scss'],
    standalone: true,
    imports: [NgIf, ReactiveFormsModule]
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

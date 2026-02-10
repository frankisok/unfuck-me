
import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import {
    AbstractControl,
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

@Component({
    selector: 'lib-autocomplete-search',
    templateUrl: './autocomplete-search.component.html',
    styleUrls: ['./autocomplete-search.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutocompleteSearchComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf]
})
export class AutocompleteSearchComponent implements OnInit, ControlValueAccessor {
    @Input() suggestions: string[] = [];
    @Input() strict? = false; // if true, enforce user input to match suggestion
    @Input() name = 'Input'; // Default to 'Input' if no name is passed

    formControl = new FormControl();
    filteredSuggestions!: Observable<string[]>;
    showSuggestions = false;

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    constructor() {}

    ngOnInit() {
        // Apply the custom validator if strict is true
        if (this.strict) {
            this.formControl.setValidators(this.suggestionValidator());
        }

        this.filteredSuggestions = this.formControl.valueChanges.pipe(
            startWith(''),
            map(value => this.filterSuggestions(value)),
        );

        this.formControl.valueChanges.subscribe(value => {
            this.onChange(value);
        });
    }

    private filterSuggestions(query: string): string[] {
        if (!this.suggestions || this.suggestions.length === 0) {
            return [];
        }

        const lowerCaseQuery = query.toLowerCase();
        return this.suggestions.filter(item => item.toLowerCase().includes(lowerCaseQuery));
    }

    writeValue(value: string): void {
        this.formControl.setValue(value, { emitEvent: false });
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        // Optional: handle disabled state if needed
    }

    onFocus() {
        const currentInput = this.formControl.value || '';
        const filtered = this.filterSuggestions(currentInput);
        this.showSuggestions = filtered.length > 0;
    }

    onInputChange() {
        this.showSuggestions = true;
    }

    selectSuggestion(suggestion: string) {
        this.formControl.setValue(suggestion);
        this.showSuggestions = false;
        this.onChange(suggestion);
    }

    private suggestionValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;
            if (this.suggestions && this.suggestions.includes(value)) {
                return null; // Valid if the input matches a suggestion
            }
            return { invalidSuggestion: true }; // Invalid if it doesn't match
        };
    }
}

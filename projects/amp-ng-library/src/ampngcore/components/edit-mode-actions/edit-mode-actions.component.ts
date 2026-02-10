
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { EditModeController, EditModeState } from '../../helpers/edit-mode/edit-mode-controller';
import { isDAMObject } from '../../util/type-guards';
import { UnSub } from '../../core';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { LibraryAssetsService } from '../../service';

@Component({
    selector: 'app-edit-mode-actions',
    templateUrl: './edit-mode-actions.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./edit-mode-actions.component.scss'],
    standalone: true,
    imports: [NgClass, NgIf]
})
export class EditModeActionsComponent extends UnSub implements OnInit, OnChanges {
    static disabled = 'disabled';

    @Input() editableModel: any;
    @Input() controller: EditModeController<any>;
    @Input() delegate: any;
    @Input() isMobile: boolean;

    @Input() dirtyTimeStamp: number = 0;

    @Input() invalidForm: boolean;

    public editModeObservable: EditModeState;
    public readonly CANCEL_BUTTON = 1;
    public readonly SAVE_BUTTON = 0;
    private readonly defaultCssName = 'amp-save-lg';
    private readonly defaultCancelCssName = 'amp-cancel-lg';

    private getButtonClassName(value: number): string {
        return value === 0 ? this.defaultCssName : this.defaultCancelCssName;
    }

    ngOnInit(): void {
        this.editModeObservable = this.controller.editModeState;
        this.controller.editModeObservable$.pipe(takeUntil(this.unsubscribe$)).subscribe((value: EditModeState) => {
           this.editModeObservable = value;
           this.ngZone.run(() => {
            this.cdr.markForCheck();
           })
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log(this.invalidForm)
        this.cdr.markForCheck()
    }

    /**
     * The class below will disable, enable all or some button based on the edit mode state.
     * Here are use-cases of what happens:
     *
     *      - saving in progress => disables all buttons
     *      - validated but save failed  => enables cancel button only
     *      - saving succeeded => enables all buttons upon exit of edit mode
     * @param value 0 == save button, value 1 == cancel button
     * @returns css class name
     */
    getCssClassName(value: number): string {
        if (this.controller.isSaveInProgress()) {
            return EditModeActionsComponent.disabled;
        }

        if (value === this.SAVE_BUTTON && this.controller.isValidated()) {
            if (!this.controller.isSaveAvailable()) {
                return EditModeActionsComponent.disabled;
            }
            return this.getButtonClassName(value);
        }

        if (value === this.CANCEL_BUTTON) {
            const css = this.getButtonClassName(value);
            if (css) {
                return css;
            }
        }
        return EditModeActionsComponent.disabled;
    }

    protected readonly isDAMObject = isDAMObject;
    constructor(
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone,
        protected assetsService: LibraryAssetsService,
    ) {
        super();
    }

}

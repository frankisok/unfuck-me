import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { DelContentConfirmDelegate } from './generic-del-confirm.delegate';
import { DelConfirmProps, DelConfirmType } from './del-confirm-type';




/**
 * Generic delete confirmation component
 * 
 * @description This component is used to display a generic delete confirmation dialog.
 * 
 * @example ```html
 * <app-generic-del-confirm [eventDelegate]="eventDelegate" [deleteType]="deleteType" [config]="config" [contentType]="contentType"></app-generic-del-confirm>
 * ```
 */
@Component({
    selector: 'app-generic-del-confirm',
    templateUrl: './generic-del-confirm.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./generic-del-confirm.component.scss'],
    standalone: false
})
export class GenericDelConfirmComponent implements OnInit {

    @Input() eventDelegate: DelContentConfirmDelegate;
    @Input() deleteType: DelConfirmType;
    @Input() contentType: string;
    @Input() config: DelConfirmProps;

    DELETE_CONTENT_TYPE = DelConfirmType;

    private _content: { name: string, description: string, items: { [keyof: string]: any } };
    
    constructor(
    ) { }
    
    ngOnInit(): void {
        console.log(this.config);
        this.setItems();
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['config'].isFirstChange()) {
            this.setItems();
        }
    }

    onCancel() {
        this.eventDelegate.onDelContentCancel();
    }

    onConfirm() {
        this.eventDelegate.onDelContentConfirm(this._content.items, this.contentType);
    }
    
    get deleteProps() {
        return this._content;
    }
    
    private setItems() {
        if (this.deleteType === DelConfirmType.EXTERNAL) {
            if (this.config.content) {
                this._content = { name: this.config.content['name'], description: `DELETE ${this.contentType || ''}`, items: this.config.content };
            } else {
                this._content = { name: this.config.folderItemModel['folder'].name, description: 'DELETE FOLDER', items: this.config.folderItemModel };
            }
        } else {
            // delete plans model or any other models
            this._content = { name: this.config.other['name'], description: 'DELETE PLAN', items: this.config.other };
        }
    }

}

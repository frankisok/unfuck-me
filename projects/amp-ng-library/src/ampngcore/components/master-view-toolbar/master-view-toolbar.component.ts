import { ChangeDetectionStrategy,Component, Input} from '@angular/core';
import { NgClass } from '@angular/common';
import {MasterViewToolbarAction} from './master-view-toolbar-action';
import { ListItem } from '../../core';

@Component({
    selector: 'app-master-view-toolbar',
    templateUrl: './master-view-toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./master-view-toolbar.component.scss'],
    standalone: true,
    imports: [NgClass]
})
export class MasterViewToolbarComponent {
    @Input() toolbarActions: Array<MasterViewToolbarAction>;
    @Input() className: string;
    @Input() selectedItem: ListItem;
}

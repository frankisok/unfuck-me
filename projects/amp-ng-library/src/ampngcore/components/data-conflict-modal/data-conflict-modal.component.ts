
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'lib-data-conflict-modal',
    templateUrl: './data-conflict-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./data-conflict-modal.component.scss'],
    standalone: false
})
export class DataConflictModalComponent implements OnInit {
    constructor(private modal: NgbActiveModal) {}

    ngOnInit(): void {}

    confirm() {
        this.modal.close();
    }
}

import { ChangeDetectionStrategy, ViewEncapsulation, AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-action-popover',
    templateUrl: './action-popover.component.html',
    styleUrls: ['./action-popover.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class ActionPopoverComponent implements AfterViewInit {

    @ViewChild('actionPopOver', {static: false}) public popover: NgbPopover;
    private hasViewInit = false;

    @Input() className: string;
    @Input() placement: string;
    @Input() open: BehaviorSubject<boolean>;

    ngAfterViewInit(): void {
        this.open.subscribe((open) => {
            this.handleOpenState(open);
        });
        this.handleOpenState(this.open.getValue());
        this.hasViewInit = true;
    }


    handleOpenState(open): void {
        if (open && !this.popover.isOpen()) {
            this.popover.open();
        } else if (!open && this.popover.isOpen()) {
            this.popover.close();
        }
    }
}

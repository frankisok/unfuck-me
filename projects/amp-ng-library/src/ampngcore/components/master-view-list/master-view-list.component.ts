import { AfterContentInit, ChangeDetectionStrategy,ChangeDetectorRef,Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ListItem} from './models/list-item';
import {MasterViewListItemEventDelegate} from './interfaces/master-view-list-item-event-delegate';

@Component({
    selector: 'app-master-view-list',
    templateUrl: './master-view-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./master-view-list.component.scss'],
    standalone: false
})
export class MasterViewListComponent implements OnInit, OnChanges, AfterContentInit {
    @Input() listItems: Array<ListItem>;
    @Input() eventDelegate: MasterViewListItemEventDelegate;
    @Input() hasTabs?: boolean;
    @Input() hasToolbar?: boolean;
    @Input() isTagsList?: boolean
    @Input() isDashboard?: boolean;
    @Input() isDebugMode?: boolean;
    @Input() dirtyTimeStamp?: number;
    
    constructor(
        private cdr: ChangeDetectorRef
    ) {
        
    }
    ngAfterContentInit(): void {
        setTimeout(() => {
            console.log(this.listItems)
            this.cdr.markForCheck()
        }, 1000);
    }
    
    ngOnInit(): void {
        console.log('init called')
        console.log(this.listItems)
        
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        console.log('changed...')
        console.log(changes)
        if (changes['dirtyTimeStamp'] && !changes['dirtyTimeStamp'].firstChange) {
            this.cdr.detectChanges()
        }
    }
    

}

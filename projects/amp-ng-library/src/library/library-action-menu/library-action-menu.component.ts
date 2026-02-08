import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UnSub } from '../../ampngcore/core';

import { LibraryConfigService } from '../library-config-service';


@Component({
    selector: 'library-action-menu',
    templateUrl: './library-action-menu.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./library-action-menu.component.scss'],
    standalone: false
})

export class LibraryActionMenuComponent extends UnSub implements OnInit {

    @Input() hasCallBackComponent: boolean
    @ViewChild('menuContainer', { read: ViewContainerRef, static: false }) menuContainer: ViewContainerRef

    constructor(
        // public account: AccountService,
        private configService: LibraryConfigService,
    ) {
        super()
    }

    ngOnInit(): void {
        this.renderLibraryMenu()
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.renderLibraryMenu()
        }, 200)
    }

    renderLibraryMenu(): void {
        if (this.hasCallBackComponent && this.menuContainer) {
            this.menuContainer.createComponent(this.configService.getConfig().component)
        }
    }

}


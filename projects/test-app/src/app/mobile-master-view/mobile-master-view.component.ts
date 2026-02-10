import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { LibraryConfigService, MobileMasterViewTabs } from 'amp-ng-library';
import { AppLibraryConfigService } from '../app-library.service';
import { Router } from '@angular/router';


@Component({
    selector: 'lib-mobile-master-view',
    templateUrl: './mobile-master-view.component.html',
    styleUrls: ['./mobile-master-view.component.scss'],
    standalone: true,
    imports: [NgFor]
})
export class MobileMasterViewComponent implements OnInit {

	masterViewTabs: Array<MobileMasterViewTabs>;

	constructor(
		private configService: AppLibraryConfigService,
		private router: Router
	) { }

	ngOnInit(): void {
		this.masterViewTabs = this.configService.device.masterViewTabs;
	}

	listItemOnClick($event: MouseEvent, _t5: MobileMasterViewTabs) {
		this.configService.updateMasterViewTabsCallback(_t5.url)
		this.router.navigate([_t5.url])
		
	}

}

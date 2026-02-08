import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { DelConfirmType, ToolBarAction } from '../master-view-list/generic-del-confirm/del-confirm-type';
import { DelContentConfirmDelegate } from '../master-view-list/generic-del-confirm/generic-del-confirm.delegate';
import { LibraryConfigService } from '../../../library/library-config-service';

@Component({
    selector: 'lib-toolbar-wrapper',
    templateUrl: './lib-toolbar-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./lib-toolbar-wrapper.component.scss'],
    standalone: false
})
export class LibToolbarWrapperComponent implements OnInit {

	eventDelegate: DelContentConfirmDelegate;
	deleteType: DelConfirmType;
	config: ToolBarAction;
	contentType?: string;

	constructor(
		private configService: LibraryConfigService,
	) { }

	ngOnInit(): void {
		this.setupParams();
	}
	
	private setupParams(): void {
		this.eventDelegate = this.configService.getConfig().masterViewToolbarConfig.delegate;
		this.deleteType = this.configService.getConfig().masterViewToolbarConfig.config.deleteType;
		this.config = this.configService.getConfig().masterViewToolbarConfig.config;
	}
}

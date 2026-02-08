import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges, ViewChild, ViewContainerRef } from '@angular/core';
import { UnSub } from '../../core';
import { LibraryConfigService } from '../../../library/library-config-service';
import { LibraryComponentService } from '../../../library/library-component-service';
import { ToolBarAction } from '../master-view-list/generic-del-confirm/del-confirm-type';

@Component({
    selector: 'lib-generic-tool-bar',
    templateUrl: './generic-tool-bar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./generic-tool-bar.component.scss'],
    standalone: false
})
export class GenericToolBarComponent extends UnSub implements OnInit {
	config: ToolBarAction;
	shouldRenderToolBar: boolean = false;
	@ViewChild('toolBarContainer', { read: ViewContainerRef, static: true }) toolBarContainer: ViewContainerRef

	constructor(
		private configService: LibraryConfigService,
		private componentService: LibraryComponentService
	) {
		super()
	}

	ngOnInit(): void {
		this.config = this.configService.getConfig()?.masterViewToolbarConfig?.config;
		this.componentService.toolBarObservable$.subscribe((config) => {
			console.log('observed config: ', config)
			this.config = config
			// if (this.config.shouldReCreate) {
			// 	this.toolBarContainer.clear()
			// 	this.renderToolBar()
			// }
		})
	}
	
	override ngOnDestroy(): void {
		console.log('destroying tool bar')
		super.ngOnDestroy()
		// this.toolBarContainer.clear()
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			// this.renderToolBar()
		}, 200)
	}

	renderToolBar(): void {
		if (this._shouldRenderToolBar()) {
			this.toolBarContainer.createComponent(this.configService.getConfig().masterViewToolbarConfig.toolBarActionsComponent)
		}
	}

	private _shouldRenderToolBar(): boolean {
		this.shouldRenderToolBar = !!this.configService.getConfig().masterViewToolbarConfig?.toolBarActionsComponent && !!this.toolBarContainer
		return this.shouldRenderToolBar
	}
}

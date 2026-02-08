import { ChangeDetectionStrategy, Component, ComponentRef, HostListener, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { LibraryConfigService, MobileMasterViewTabs } from '../../../library/library-config-service';

@Component({
    selector: 'lib-mobile-nav-wrapper',
    templateUrl: './mobile-nav-wrapper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./mobile-nav-wrapper.component.scss'],
    standalone: false
})
export class MobileNavWrapperComponent implements OnInit {
	@ViewChild('mobileMenuContainer', { read: ViewContainerRef, static: false }) mobileMenuContainer: ViewContainerRef
	c: ComponentRef<any>

	constructor(
		private configService: LibraryConfigService,
	) { }

	ngOnInit(): void {
		this.renderLibraryMenu()
	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			this.renderLibraryMenu()
		},)
	}

	renderLibraryMenu(): void {
		if (this.mobileMenuContainer) {
			// if (this.configService.isMobile() && this.mobileMenuContainer) {
			this.c = this.mobileMenuContainer.createComponent(this.configService.getConfig().mobileMenu)
		}
	}

	// if c is not null and click is not within this id=menu-wrap-container, then close menu
	@HostListener('document:click', ['$event'])
	onClickOutsideContainer(event: MouseEvent) {
		const menuWrapContainer = document.getElementById('menu-wrap-container')
		if (this.c && menuWrapContainer && !menuWrapContainer.contains(event.target as Node)) {
			this.configService.updateDetailViewProps({
				...this.configService.detailViewProps,
				isMenuOpen: false
			})
			this.c.destroy()
		}
	}

}


import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output } from '@angular/core';

@Directive({
    selector: '[appDynamicHostListener]',
    standalone: false
})
/**
 * Handles dynamic host listeners
 * 
 * Adds a host listener to the document for click events
 * - The first click event is used for initialization
 * - The subsequent click event is used for toggling the visibility of the element
 */
export class AmpDynamicHostListenerDirective implements OnDestroy {
	private enabled = false;
	private clickCount: number = 0;
	
	@Output() clickOutsideListenerTags: EventEmitter<any> = new EventEmitter<any>();
	@Input() set appDynamicHostListener(enabled: boolean) {
		this.enabled = enabled;
		if (enabled) {
			this.attachListener();
		} else {
			this.detachListener();
			this.clickCount = 0;
		}
	}


	constructor(private el: ElementRef) { }

	@HostListener('document:click', ['$event'])
	onClick(event: Event): void {
		//console.log(`clickCount: ${this.clickCount}`);
		if (this.enabled) {
			this.clickOutsideListener(event);
		}
		this.clickCount++;
	}

	ngOnDestroy() {
		this.detachListener();
	}

	/**
	 * Handles the click outside event when the directive is enabled.
	 *
	 * Emits the `clickOutsideListenerTags` event with information about the click, including whether the directive
	 * is enabled and whether the clicked element was visible.
	 *
	 * @param event - The click event to handle.
	 */
	private clickOutsideListener(event: Event): void {
		if (!this.el) { return }
		if (this.enabled && !this.el.nativeElement.contains(event.target)) {
			this.clickOutsideListenerTags.emit({ enabled: this.enabled, visible: this.clickCount >= 1 });
		}
		if (!this.el.nativeElement.contains(event.target)) {
			this.clickOutsideListenerTags.emit({ enabled: this.enabled, visible: this.clickCount >= 1 });
			this.detachListener();
		}
	};

	private attachListener(): void {
		document.addEventListener('click', this.clickOutsideListener);
	}

	private detachListener(): void {
		document.removeEventListener('click', this.clickOutsideListener);
	}
}

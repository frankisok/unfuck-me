import { Injectable } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

enum ModalClosedReason {
	BACK_BUTTON = 'back-button',
	DISMISSED = 'dismissed'
}

@Injectable({
	providedIn: 'root',
})
/**
 * This service is used to open and close modals. It also keeps track of the modals that are open.
 * for in component view of modal hosted under a different path.
 * 
 * ```
 * example: it allows you to open programme/playlist detail modal from the schedule detail modal
 * ```
 */
export class AMPModalService {
	private modalStack: NgbModalRef[] = [];

	constructor(
		private ngbModal: NgbModal,
	) { }


	/**
	 * Opens a modal dialog with the specified content and options.
	 *
	 * @param content The content to display in the modal. This can be a component, template, or any valid modal content.
	 * @param options (Optional) Additional options for configuring the modal dialog.
	 * @returns A reference to the opened modal dialog (`NgbModalRef`).
	 * 
	 * - Toggle the appearance of the previous modal if any on opening a new modal. 
	 * - Toggle the appearance of the previous modal in the stack when closing the current modal.
	 */
	open(content: any, options?: NgbModalOptions): NgbModalRef {


		const modalRef = this.ngbModal.open(content, options);
		// this.toggleLastModal()
		this.modalStack.push(modalRef);

		modalRef.result.then(
			(reason: string) => {
				this.modalDismissed(reason);
				// this.toggleLastModal()
			},
			(reason: string) => {
				this.modalDismissed(reason);
				// this.toggleLastModal()
			}
		);

		return modalRef;
	}


	closeActiveModal(result?: any): void {
		if (this.modalStack.length > 0) {
			const activeModal = this.modalStack[this.modalStack.length - 1];
			activeModal.close(result);
		}
	}

	dismissAll(): void {
		this.ngbModal.dismissAll();
		this.modalStack = [];
	}

	close(delegate) {
		this.close(delegate);
	}

	dismissed() {
		this.dismissed();
	}

	toggleLastModal() {
		if (this.modalStack.length > 0) {
			const previousModal = this.modalStack[this.modalStack.length - 1];
			previousModal.componentInstance.toggle();
		}
	}

	get hasOpenModals(): boolean {
		return this.modalStack.length > 1;
	}

	private modalDismissed(reason: string) {
		if (ModalClosedReason.DISMISSED === reason) {
			this.dismissAll();
			return
		}
		this.modalStack.pop();
	}

}

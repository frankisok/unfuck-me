
export interface AMPWebSocketDelegate {
	close(): void;
	onOpen(e: any): void;
	onClose(e: any): void;
	onError(e: any): void;
	onMessage(e: any): void;
}

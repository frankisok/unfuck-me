export interface WebsocketServiceDelegate {
    wsClosed(): void;
    wsOpened(): void;
    close(): void;
    wsError(e: string): void;
    wsDataReceived(messageData: any): void;
    wsChannelOpened(deviceEndpoint: string): void;
    wsChannelClosed(deviceEndpoint: string): void;
}

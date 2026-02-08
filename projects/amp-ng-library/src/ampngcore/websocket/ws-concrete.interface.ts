export interface WSConnection {
    openChannel(): void;
    closeChannel(): void;
    getPlayStatus(): void;
    connectionStat(): {
        isOpen: boolean;
        isChannelOpen: boolean;
    }
}
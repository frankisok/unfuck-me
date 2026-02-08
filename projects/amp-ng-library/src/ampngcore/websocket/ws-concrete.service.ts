import { Injectable } from '@angular/core';
import { WSService } from './websocket.service';
import { LibraryConfigService } from '../../library/library-config-service';
import { AlertService, EventBusService } from '../service';
import { WSMessageData } from './message-data.interface';
import { Logger } from '../core';
import { AMPWSMessageType } from './amp-websocket-protocol';
import { AMPEventName } from '../protocols/events.protocol';
import { WSConnection } from './ws-concrete.interface';
import { WebsocketServiceDelegate } from '../interfaces/amp-websocket-service.delegate';

@Injectable({
    providedIn: 'root'
})
export abstract class WebsocketService extends WSService implements WebsocketServiceDelegate, WSConnection {
    obj: { isOpen: boolean, isChannelOpen: boolean, data: any } = { isOpen: false, isChannelOpen: false, data: null }
    eventType = null
    
    abstract wsOpened(): void;
    abstract wsError(e: string): void;
    abstract wsChannelClosed(deviceEndpoint: string): void;

    constructor(
        protected override configService: LibraryConfigService,
        protected clientService: ClientServiceExtension,
        protected eventBus: EventBusService,
    ) {
        super(configService)
        this.config(this).connect()
    }

    wsClosed(): void {
        // either ws closed by the server or client, when we get a call here
        // already handled in super
    }

    wsDataReceived(messageData: WSMessageData): void {
        Logger.debug('message received: ' + JSON.stringify(messageData));
        this.obj = { ...this.obj, ...this.connectionStat(), data: messageData }
    }

    wsChannelOpened(deviceEndpoint: string): void {
        Logger.debug('Channel opened successfully to device endPoint: ' + deviceEndpoint, 'green');
        this.clientService.updateDeviceEndPoint = deviceEndpoint;
        this.getDeviceInfo()
    }


    configCallback(f: (e: any) => void) {
        this.f = f;
    }

    muteVolume(mute: boolean): void {
        const ampWsMessageData = this.buildMsgData();
        ampWsMessageData.setValueMute(mute);
        this.sendDeviceMessage(AMPWSMessageType.mutePlayback, ampWsMessageData);
    }

    setVolume(volume: number): void {
        const ampWsMessageData = this.buildMsgData();
        ampWsMessageData.setValueVolume(volume);
        this.sendDeviceMessage(AMPWSMessageType.setVolume, ampWsMessageData)
    }

    startPlayback(): void {
        this.sendDeviceMessage(AMPWSMessageType.startPlay, this.buildMsgData());
    }

    playPlaylist(playListName: string, id = 0, shuffle = false) {
        const ampWsMessageData = this.buildMsgData();
        ampWsMessageData.setValueShuffle(shuffle);
        ampWsMessageData.setValuePlaylistName(playListName);
        ampWsMessageData.setValuePlaylistId(id)
        this.sendDeviceMessage(AMPWSMessageType.playPlaylist, ampWsMessageData)
    }

    stopPlayback(): void {
        this.sendDeviceMessage(AMPWSMessageType.stopPlay, this.buildMsgData());
    }

    getPlayStatus() {
        const ampWsMessageData = this.buildMsgData();
        ampWsMessageData.getValueDataValues();
        this.sendDeviceMessage(AMPWSMessageType.getInstallationStatus, ampWsMessageData)
    }

    protected broadCastWSMsg(data: any, type: any) {
        this.eventBus.publish({
            eventName: AMPEventName.WS_EVENT,
            eventPayload: {
                eventType: type,
                eventData: data
            }
        })
        if (this.f) {
            this.f({ type: type, eventData: data })
        }
    }

    private getDeviceInfo() {
        this.sendDeviceMessage(AMPWSMessageType.getInstallationStatus, this.buildMsgData());
    }

    private f: ((e: any) => void) | undefined
}


@Injectable({
    providedIn: 'root'
})
export abstract class ClientServiceExtension {
    protected abstract systemId: string;
    abstract getSystemId(): string;
    abstract getDeviceId(): number;
    abstract getDeviceEndPoint(): string;
    abstract updateDeviceEndPoint?: string;
}
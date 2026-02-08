import { Injectable } from '@angular/core';
import { LibraryConfigService } from '../../library/library-config-service';
import { AMPWebSocketDelegate } from '../interfaces/amp-websocket.delegate';
import { AMPWebSocket } from './amp-websocket';
import { WebsocketServiceDelegate } from '../interfaces/amp-websocket-service.delegate';
import { AMPWSMessage, AMPWSMessageData, AMPWSMessageDataType, AMPWSMessageType } from './amp-websocket-protocol';
import { WSMessage } from './message-data.interface';
import { Logger } from '../helpers/logger';


/**
 * uses either delegate of call back depending if the class is being used as injector or just created as instance
 */
export class WSService implements AMPWebSocketDelegate {
	WS_ENDPOINT: string
	deviceEndpoint: string = ''
	delegate: WebsocketServiceDelegate;

	private _isOpen: boolean = false;
	private _isChannelOpened = false
	private ampWebSocket: AMPWebSocket;
	private clb: (e: any) => void;

	constructor(
		protected configService: LibraryConfigService,
	) {
		this.configService.deviceEndPointChanged.asObservable().subscribe((endPoint) => {
			this.deviceEndpoint = endPoint;
		})
	}
	
	public connect() {
		this.WS_ENDPOINT = this.configService.environment.wsServer
		this.ampWebSocket = new AMPWebSocket(this.WS_ENDPOINT, this.configService.environment.wsProtocols, this);
	}

	public config(delegate: WebsocketServiceDelegate, clb?: (e: any) => void, deviceEndpoint?: string) {
		this.deviceEndpoint = !!deviceEndpoint ? deviceEndpoint : this.configService.device.deviceEndpoint;
		this.delegate = delegate;
		this.clb = clb;
		return this
	}

	public connectionStat(): { isOpen: boolean, isChannelOpen: boolean } {
		return {
			isOpen: this._isOpen,
			isChannelOpen: this._isChannelOpened,
		}
	}

	public close() {
		this._isOpen = false
		this.ampWebSocket.close()
	}


	public onOpen(e: any) {
		this._isOpen = true;
		if (!!this.clb) {
			this.clb(this.connectionStat())
		} else {
			this.delegate?.wsOpened();
		}
	}

	public onClose(e: any) {
		this._isOpen = false
		if (!!this.clb) {
			this.clb(this.connectionStat())
		} else {
			this.delegate.wsClosed()
		}
	}


	public onError(e: any) {
		console.error('On Error')
		this.delegate.wsError('network error')
		if (!this.clb) {
			this.delegate.wsError('network error')
		}
	}

	public onMessage(msg: WSMessage) {
		if (!!this.clb) {
			this.useCallBacks(msg)
			return;
		}
		switch (msg.messageType) {
			case AMPWSMessageType.receiveData:
				// Logger.info('WS message received')
				this.delegate.wsDataReceived(msg.messageData);
				break;

			case AMPWSMessageType.channelOpened:
				this._isChannelOpened = true
				Logger.debug('Channel opened successfully', 'green');
				this.delegate.wsChannelOpened(this.getDeviceEndpoint(msg))
				break;

			case AMPWSMessageType.channelClosed:
				Logger.debug('Channel closed successfully', 'green');
				this._isChannelOpened = false
				this.delegate.wsChannelClosed(this.getDeviceEndpoint(msg));
				break;

			case AMPWSMessageType.wsError:
				// Show Error message
				Logger.debug('Ws ERROR', 'red');
				this.delegate.wsError(msg.messageData.dataValues.errorDescription);
				break;
		}
	}

	public useCallBacks(msg: any) {
		switch (msg.messageType) {
			case AMPWSMessageType.receiveData:
				this.clb(msg.messageData)
				break;

			case AMPWSMessageType.channelOpened:
				this._isChannelOpened = true
				this.clb(this.connectionStat());
				break;

			case AMPWSMessageType.channelClosed:
				this._isChannelOpened = false
				this.clb(this.connectionStat());
				break;

			case AMPWSMessageType.wsError:
				// Show Error message
				console.error(msg.messageData.dataValues.errorDescription)
				break;
		}
	}

	// Connectivity
	public openChannel() {
		Logger.info('open Channel message sent');
		this.sendDeviceMessage(AMPWSMessageType.openChannel, this.buildMsgData());
	}

	public closeChannel() {
		Logger.info('close channel for device endpoint: ' + this.deviceEndpoint);
		this.sendDeviceMessage(AMPWSMessageType.closeChannel, this.buildMsgData());
	}

	/**
	 * Creates AMPWSMessage and sends it to via WS
	 * @param messageType an `AMPWSMessageType` action type
	 */
	protected sendDeviceMessage(messageType: AMPWSMessageType, ampWsMessageData: AMPWSMessageData) {
		// console.log("Message:" + ampWsMessageData.dataType);
		const ampWsMessage = new AMPWSMessage(messageType, ampWsMessageData);
		this.ampWebSocket.sendMsg(ampWsMessage)
	}

	/**
	 * Creates AMPWSMessageData with default values
	 * @return an `AMPWSMessageData`
	 */
	protected buildMsgDataForType(dataType: AMPWSMessageDataType): AMPWSMessageData {
		const ampWsMessageData = new AMPWSMessageData(dataType);
		ampWsMessageData.setValueDeviceEndpoint(!!this.deviceEndpoint ? this.deviceEndpoint : this.configService.device.deviceEndpoint);
		return ampWsMessageData;
	}

	protected buildMsgData(): AMPWSMessageData {
		return this.buildMsgDataForType(AMPWSMessageDataType.installationActionParams);
	}

	private getDeviceEndpoint(msg: any): string {
		return msg.messageData.dataValues.deviceEndpoint;
	}
}
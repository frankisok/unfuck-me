import { AMPWebSocketDelegate } from "../interfaces/amp-websocket.delegate";
import { AMPWSMessage } from "./amp-websocket-protocol";

export class AMPWebSocket {
    url: string;
    endpoint: string
    ampDelegate: AMPWebSocketDelegate;
    useProtocols: string[];

    private readonly appType = 'lra';
    private _websocket: WebSocket

    constructor(
        url: string,
        protocols: string[],
        delegate: AMPWebSocketDelegate
    ) {
        this.url = url;
        this.endpoint = this.UUIDv4(protocols);
        if (protocols.length > 2) {
            protocols.pop()
        }
        this.useProtocols = [...protocols, this.endpoint];
        this.ampDelegate = delegate;
        this._websocket = this.createWS(this.url, this.useProtocols,
            this.onOpen, this.onMessage, this.onClose, this.onError, this.ampDelegate
        )
        window.addEventListener('beforeunload', () => this.close());
    }

    sendMsg(msg: AMPWSMessage) {
        msg.messageData.setValueObserverEndpoint(this.endpoint);
        if (this.webSocket.readyState !== WebSocket.OPEN) return
        this.webSocket.send(JSON.stringify(msg));
    }

    close(code?: number, reason?: string) {
        if (this.webSocket && this.webSocket.readyState === this.webSocket.OPEN) {
            this._websocket.close(code, reason);
            this._websocket = null;
            this.ampDelegate.onClose('ws server closed');
        }
    }

    getEndpoint() {
        return this.endpoint;
    }

    get webSocket(): WebSocket {
        return this._websocket
    }

    private onOpen(dis: AMPWebSocketDelegate, e: any): void {
        dis.onOpen(e)
    }

    private onClose(dis: AMPWebSocketDelegate, e: any): void {
        dis.onClose(e)
    }

    private onError(dis: AMPWebSocketDelegate, e: any): void {
        dis.onError(e)
    }

    private onMessage(dis: AMPWebSocketDelegate, e: any): void {
        dis.onMessage(e)
    }

    private UUIDv4(protocols: string[]): string {
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
            if (c === 'y') {
                r = r & 0x3 | 0x8;
            }
            return r.toString(16);
        });
        if (protocols.includes(this.appType)) {
            uuid = this.appType + '-' + uuid;
        }
        else {
            if (protocols.length > 2) {
                uuid = protocols[2] + '-' + uuid;
            }
        }
        console.log('Current UUID: ', uuid)
        return uuid;
    }

    private createWS(url: string, wsprotocols: string | string[],
        ampOnopen: (dis: AMPWebSocketDelegate, e: any) => void,
        ampOnmessage: (dis: AMPWebSocketDelegate, e: any) => void,
        ampOnclose: (dis: AMPWebSocketDelegate, e: any) => void,
        ampOnerror: (dis: AMPWebSocketDelegate, e: any) => void,
        delegate: AMPWebSocketDelegate): WebSocket {
        var ws = new WebSocket(url, wsprotocols);
        ws.onopen = (e) => {
            ampOnopen(delegate, e)
        };
        ws.onclose = (e) => {
            ampOnclose(delegate, e)
        };
        ws.onerror = (e) => {
            ampOnerror(delegate, e)
        };
        ws.onmessage = (e) => {
            var msg = eval('(' + e.data + ')');
            ampOnmessage(delegate, msg);
        }
        return ws;
    }
}
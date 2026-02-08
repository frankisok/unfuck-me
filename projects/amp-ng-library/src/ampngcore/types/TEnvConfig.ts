export type TEnvConfig = 'online' | 'offline' | 'online-minimal-read-only' | 'online-read-only' | 'offline-write';
export type WebsiteViewMode = 'default' | 'web-view-minimum' | 'web-view-full';
export enum EAppMode  {
    WEB_APP = 'webapp',
    REMOTE_APP = 'remoteapp',
    DESKTOP_APP = 'desktopapp'
}
export type AppMode = EAppMode.WEB_APP | EAppMode.REMOTE_APP | EAppMode.DESKTOP_APP;
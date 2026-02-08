import { MediaType } from "../core";
import { AMPAudioPlayerConfigState, AMPAudioPlayerPlayState, AMPWSMessageDataType, AMPWSMessageType } from "./amp-websocket-protocol";

export interface PlayProgress {
    duration: any;
    position: any;
    percent?: number
    mediaType?: MediaType
}
export interface LogsHistoryRange {
    currentPosition: number;
    historyLogState: number;
    logLines: string[];
}
export interface PlayStatus {
    schedule: string;
    programme: string;
    masterVolume: number;
    playingItem: string;
    configState: AMPAudioPlayerConfigState;
    muted: boolean;
    currentVolume: number;
    actionName: string;
    playState: AMPAudioPlayerPlayState;
    playProgress: PlayProgress;
}
export interface ScheduleStatus {
    nextProgramme: string;
    sequencePlayback: {
        nextPlaylistTimer: string;
    }
}
export interface SystemInfoStatus {
    freeSpace: number;
    memory: number;
    systemId: string;
    osVersion: string;
    thermalState: number;
    ipAddress: string;
    version: string;
    processName: string;
    systemUptime: Number,
}
export interface DeviceStatus {
    licenceProducts: any[];
    licenceStatus: string;
    playlistNames: string[];
    systemId: string;
    playProgress: PlayProgress;
    playStatus: PlayStatus;
    scheduleStatus: ScheduleStatus;
    systemInfo: SystemInfoStatus;
}

export interface WSDataValues {
    observerEndPoint: string;
    errorDescription?: string;
    deviceEndPoint?: string;
    playProgress?: PlayProgress;
    deviceStatus?: DeviceStatus
    playerEvent?: PlayStatus
    logLines?: string[];
    historyRanges?: LogsHistoryRange;
}

export interface WSMessageData {
    dataType: AMPWSMessageDataType;
    dataValues: WSDataValues;
}

export interface WSMessage {
    messageType: AMPWSMessageType;
    messageData: WSMessageData;
}
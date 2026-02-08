export enum AMPWSMessageType {
    updateLibrary = 1,
    updateSchedule,
    updateLibraryAndSchedule,
    updateApp,
    updateLicence,
    restartApp,
    restartSystem,
    stopPlay,
    startPlay,
    mutePlayback,
    setVolume,
    playPlaylist,
    purgeContent,
    updatePlaylists,
    getInstallationStatus,
    startContentUpdate,
    resetLibrary,
    stopContentUpdate,
    updateConfig,

    // Sent from Device to Server
    connectVia = 101,
    disconnectVia,

    // Sent from Browser to Server
    openChannel = 103,
    closeChannel,
    startPlayerLogStream,
    stopPlayerLogStream,
    startUpdateLogStream,
    stopUpdateLogStream,
    setPlayerLogLevel,
    setUpdateLogLevel,
    getHistoricalLogs,

    // Sent to browser from device or server
    receiveData = 201,
    channelOpened,
    channelClosed,

    wsError = 301
}

export enum AMPWSMessageDataType {
    noData,
    installationActionParams,
    audioPlayerStatus,
    playerEvent,
    playerLog,
    updateLog,
    logLevel,
    configData,
    playerStatus,
    playProgress,
    historicalLog,

    errorData = 501
}

export enum AMPAudioPlayerConfigState {
    notConfigured = 1,
    configured,
    hasLicence,
    hasLibrary,
    ready,
    updatingLicence,
    updatingLibrary,
    updatingPlaylists,
    updatingSchedule,
}

export enum AMPAudioPlayerPlayState {
    launching = 1,
    playingSchedule,
    stoppingPlay,
    stopped,
    countingDownToSchedule,
    playingPlaylist,
    restarting,
    startingPlay
}

export enum AMPLicenceStatus {
    NoLicense = 1,
    Expired,
    Valid
}

export enum AMPWSLogLevelValue {
    none,
    info,
    debug,
    trace
}

export interface HistoryRange {
    startDate: any;
    endDate: any;
    linesFromPosition: number;
    linesToPosition: number;
}

export class AMPWSMessageData {
    private static readonly DATA_VALUE_DEVICE_ENDPOINT = "deviceEndpoint"
    private static readonly DATA_VALUE_DEVICE_VIA_ENDPOINT = "deviceVidEndpoint"
    private static readonly DATA_VALUE_OBSERVER_ENDPOINT = "observerEndpoint"
    private static readonly DATA_VALUE_LOG_LINES = "logLines"
    private static readonly DATA_VALUE_DEVICE_STATUS = "deviceStatus"
    private static readonly DATA_VALUES_DATA_TYPE = "dataType"
    private static readonly DATA_VALUES = "dataValues"
    private static readonly DATA_VALUE_MESSAGE_DATA = "messageData"
    private static readonly DATA_VALUE_LOG_LEVEL = "logLevel"
    private static readonly DATA_VALUE_CONFIG_STATE = "configState"
    private static readonly DATA_VALUE_SET_LICENCE = "setLicenceCode" // take all license related code out
    private static readonly DATA_VALUE_MUTE = "mute"
    private static readonly DATA_VALUE_VOLUME = "volume"
    private static readonly DATA_VALUE_PLAYLIST_NAME = "playlist"
    private static readonly DATA_VALUE_PLAYLIST_ID = "playlistId"
    private static readonly DATA_VALUE_IMMEDIATE = "immediate"
    private static readonly DATA_VALUE_HISTORY_RANGES = "historyRanges"
    private static readonly DATA_VALUE_USE_ONLINE_SCHEDULE = 'useOnlineSchedule'
    private static readonly DATA_VALUE_SHUFFLE = 'shuffle'

    private dataType: AMPWSMessageDataType;
    private dataValues: { [keyof: string]: any }

    constructor(dataType: AMPWSMessageDataType, dataValues = {}) {
        this.dataType = dataType;
        this.dataValues = dataValues;
    }

    getValueDataValues() {
        return this.dataValues;
    }

    getValueDataType(): AMPWSMessageDataType {
        return this.dataType;
    }

    getValueDeviceEndpoint(): string {
        return this.dataValues[AMPWSMessageData.DATA_VALUE_DEVICE_ENDPOINT];
    }

    getValueObserverEndpoint(): string {
        return this.dataValues[AMPWSMessageData.DATA_VALUE_OBSERVER_ENDPOINT];
    }

    getValueLogLevel(): AMPWSLogLevelValue {
        return this.dataValues[AMPWSMessageData.DATA_VALUE_LOG_LEVEL];
    }

    getValueConfigState() {
        return this.dataValues[AMPWSMessageData.DATA_VALUE_CONFIG_STATE]
    }

    setValuePlaylistName(playListName: string): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_PLAYLIST_NAME] = playListName;
    }

    setValuePlaylistId(id: number): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_PLAYLIST_ID] = id;
    }

    setValueMute(mute: boolean): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_MUTE] = mute;
    }

    setHistoryRanges(historyRanges: HistoryRange): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_HISTORY_RANGES] = historyRanges;
    }

    setValueVolume(volume: number): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_VOLUME] = volume;
        this.dataValues[AMPWSMessageData.DATA_VALUE_IMMEDIATE] = true;
    }

    setValueLogLevel(level: AMPWSLogLevelValue): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_LOG_LEVEL] = level;
    }

    setValueConfigState(state) {
        this.dataValues[AMPWSMessageData.DATA_VALUE_CONFIG_STATE] = state;
    }

    setValueLicenceCode(code) {
        this.dataValues[AMPWSMessageData.DATA_VALUE_SET_LICENCE] = code;
    }

    setValueDataValues(dataValues) {
        this.dataValues = dataValues;
    }

    setValueDataType(dataType) {
        this.dataType = dataType;
    }

    setValueDeviceEndpoint(endpoint: string): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_DEVICE_ENDPOINT] = endpoint;
    }

    setValueObserverEndpoint(endpoint: string): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_OBSERVER_ENDPOINT] = endpoint;
    }

    setValueUseOnlineSchedule(use: boolean): void {
        this.dataValues[AMPWSMessageData.DATA_VALUE_USE_ONLINE_SCHEDULE] = use;
    }

    setValueShuffle(shuffle: boolean) {
        this.dataValues[AMPWSMessageData.DATA_VALUE_SHUFFLE] = shuffle
    }

    asDict(): { dataType: AMPWSMessageDataType; dataValues: { [keyof: string]: any; }; } {
        return {
            dataType: this.dataType,
            dataValues: this.dataValues
        }
    }

}

export class AMPWSMessage {
    messageType: AMPWSMessageType;
    messageData: AMPWSMessageData;
    constructor(messageType: AMPWSMessageType, messageData: AMPWSMessageData) {
        this.messageType = messageType;
        this.messageData = messageData;
    }

    asDict() {
        return {
            messageType: this.messageType,
            messageData: this.messageData.asDict()
        }
    }
}

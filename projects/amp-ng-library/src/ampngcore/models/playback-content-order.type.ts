import {AMPObjectType} from '../enums/amp-object-type.enum';

export type PlaybackContentOrder = {
    folderId: number
    identifiersOrder: { identifier: number | bigint, type: AMPObjectType}[]
}
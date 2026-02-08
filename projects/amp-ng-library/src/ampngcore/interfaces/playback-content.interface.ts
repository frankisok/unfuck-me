import {MediaType} from '../enums/media-type';
import {AMPStatus} from '../enums/status';
import {PlaybackContentVisibility} from '../enums/visibility';
import {AMPPlayEntityTranslation} from '../models/play-entity-translation';

export interface PlaybackContent {
    id: number
    name: string
    folderId: number
    folderIndex: number
    mediaType: MediaType
    imageUrl?: string
    status: AMPStatus
    identifier: bigint
    visibility: PlaybackContentVisibility
    translations: AMPPlayEntityTranslation[]
    editVersion: number

}
export interface SearchablePlaybackContent extends PlaybackContent {
    showItemInSearch?: boolean
}
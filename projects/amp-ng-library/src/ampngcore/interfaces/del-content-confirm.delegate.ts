import {PlaybackContent} from './playback-content.interface';
import {ContentType} from '../enums/content-type.enum';


export interface DelContentConfirmDelegate {
    onDelContentConfirm(content: PlaybackContent, contentType: ContentType);
    onDelContentCancel();
}

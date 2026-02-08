
import {PlaybackContent} from './playback-content.interface';
import {AddContentForm} from './add-content-form';
import {MediaType} from '../enums/media-type';
import {FolderType} from '../enums/folder-type';
import {DelContentConfirmDelegate} from './del-content-confirm.delegate';
import DelFolderConfirmDelegate from './del-folder-confirm.delegate';
import {AddFolderFormDelegate} from './add-folder-form.delegate';
import {EditFolderFormDelegate} from './edit-folder-form.delegate';
import {ContentType} from '../enums/content-type.enum';

export interface AddContentFormDelegate {
    onAddContentSubmit(content: PlaybackContent, contentType: ContentType);
    onAddContentCancel();
    register(addContentForm: AddContentForm)
}


export interface ToolbarPlaybackDelegate extends AddContentFormDelegate, DelContentConfirmDelegate, DelFolderConfirmDelegate, AddFolderFormDelegate, EditFolderFormDelegate {
    getMediaType(): MediaType;
    getFolderType(): FolderType;
    getLastListItemModel(): PlaybackContent;
    isLastItemFolder(): boolean;
}
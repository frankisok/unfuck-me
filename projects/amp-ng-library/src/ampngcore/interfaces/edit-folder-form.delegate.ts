import {AMPFolder} from '../models/folder';

export interface EditFolderFormDelegate {
    onEditFolderSubmit(folder: AMPFolder);
    onEditFolderCancel();
}

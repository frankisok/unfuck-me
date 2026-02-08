import {AMPFolder} from '../models/folder';

export interface AddFolderFormDelegate {
    onAddFolderSubmit(folder: AMPFolder);
    onAddFolderCancel();
}

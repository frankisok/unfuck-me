import {AMPFolder} from '../models/folder';

export default interface DelFolderConfirmDelegate {
    onDelFolderConfirm(folder: AMPFolder, deleteContents: boolean);
    onDelFolderCancel();
}

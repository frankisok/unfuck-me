import { Tag } from '../../models/tag';

export interface AddOrEditContentConfirmDelegate {
    onAddOrEditContentSubmit(content: Tag);
    onAddOrEditContentCancel();
}

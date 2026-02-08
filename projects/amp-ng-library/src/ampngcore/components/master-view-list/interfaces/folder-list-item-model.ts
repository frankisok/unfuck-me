

export default interface FolderListItemModel {
    isFolderListItemModel: boolean;
}


export const isFolderListItemModel = (model: any): model is FolderListItemModel  => {
    return 'isFolderListItemModel' in model;
};

import {ListItemConfig} from './list-item-config';
// import { PlaylistFolderListItemModel } from 'app/playback/playlists/util/playlist-listitem-factory';


interface NestableVariance<T> {
    hasNestedItems(): boolean;
    getNestedItems(): Array<T>;
}


export class ListItem implements NestableVariance<ListItem> {
    // Data
    private displayText: Function;
    private readonly innerModel: any;
    private readonly config: ListItemConfig;

    // State
    protected _hasNestedItems: boolean;
    private selected: boolean;

    nestedDepth?: number
    isFocused?: boolean
    isColoured: boolean
    id: number
    folderId: number
    folderIndex: number
    isFolder: boolean
    showItemInSearch:boolean = true
    isProduct?: boolean;
    isContentItem?: boolean;
    isProductPlans?: boolean;

    constructor(config, displayText, model) {
        if (config === null) {
            return
        }
        this.config = config;

        this.displayText = displayText;
        this.innerModel = model;

        this.selected = false;
        this._hasNestedItems = false;
        this.isColoured = false
        this.id = !!this.getInnerModel().id ? this.getInnerModel().id : undefined
        this.folderId = !!this.getInnerModel().folderId ? this.getInnerModel().folderId : undefined
        this.folderIndex = this.getInnerModel().folderIndex ? this.getInnerModel().folderIndex : 0
        this.isFolder = false
    }

    hasNestedItems(): boolean {
        return this._hasNestedItems;
    }

    getNestedItems(): Array<ListItem> {
        return [];
    }

    getInnerModel() {
        return this.innerModel;
    }

    isSelected(): boolean {
        return this.selected;
    }

    setSelected(selected: boolean) {
        this.selected = selected;
    }

    getDisplayText(): string {
        return this.displayText(this);
    }

    getIcons() {
        return this.config.getIcons();
    }

    getMediaType() {
        return this.innerModel._folder.mediaType
    }
}

export class List extends ListItem {
    private readonly nestedItems: Array<ListItem>;
    override isFocused: boolean

    constructor(config, displayText, model, nestedItems) {
        super(config, displayText, model);
        this.nestedItems = nestedItems;
        this._hasNestedItems = true;
        this.isFocused = false
        if (this.getInnerModel().isFolderListItemModel) {
            this.id = this.getInnerModel().folder.id
            this.folderId = this.getInnerModel().folder.folderId
            this.folderIndex = this.getInnerModel().folder.folderIndex
        }
        this.isFolder = true

    }

    override hasNestedItems(): boolean {
        return this._hasNestedItems;
    }

    override getNestedItems(): Array<ListItem> {
        return this.nestedItems;
    }

    // to create a list from an obj
    static createFromObject(obj) {
        const { config, displayText, innerModel, nestedItems, isFocused } = obj;
        const list =new List(config, displayText, innerModel, nestedItems);
        list.isFocused = isFocused;
        return list;
    }
}

// once i get the rendering done properly this can be merged with list class above
export class NestableList extends ListItem {
    private readonly nestedItems: Array<ListItem>;
    private name: string
    private _parentId: number
    private _id:number
    constructor(config, displayText, model, nestedItems, name, id) {
        super(config, displayText, model);
        this.nestedItems = nestedItems;
        this._hasNestedItems = true;
        this.name = name
        this._parentId = id
    }
    // constructor(listItem: ListItem) {
    //     super(this.config)
    // }

    override hasNestedItems(): boolean {
        return this._hasNestedItems;
    }

    override getNestedItems(): Array<ListItem> {
        return this.nestedItems;
    }

    get Name(){
        const model = this.getInnerModel();
        return this.name
    }
    get parentId() {return this._parentId}
    get Id() {
        const model = this.getInnerModel();
        return  model === null ?  null : (model.folder ? model.folder.id : -1)
    }
}
export class NestedList {
    private currentList: NestableList;
    private children: NestedList[];
    private id: number;
    private folderSelected: boolean = false;


    nestedDepth: number
    constructor(nestableList: NestableList){
        this.id = nestableList.Id ? nestableList.Id : 0;
        this.currentList = nestableList;
        this.children = []
        this.nestedDepth = 0
    }
    setChildren(child: NestedList){this.children.push(child)}
    getCurrentList(): NestableList {return this.currentList}
    getChildren(): NestedList[] {return this.children}
    get Id(): number {return this.id}
    get parentId(): number {return this.currentList.parentId}
    get Name(): string {return this.currentList.Name}
    hasChildren(): boolean {return this.children.length > 0}
    showInnerFolders(): void {this.folderSelected = !this.folderSelected; this.children.map(child => {return child.folderSelected = !child.folderSelected})}
    setFolderSelected(): void {this.folderSelected = !this.folderSelected}
    isFolderSelected():boolean{return this.folderSelected}
}


export class NestableListItemTree  {
    private tree: NestedList
    private nestableList: NestedList[]
    constructor(nestableList: NestableList[], heading:string, conf:any) {
        // this.createNestedList(heading, mediaType)
        this.nestableList = this.createNestableListItemFolder(nestableList, conf)
        const virtual = new NestableList(null, heading, null, null, null, 0)
        this.tree = new NestedList(virtual)
        this.buildTree(this.tree);
    }

    private createNestableListItemFolder(nestableList: NestableList[], conf:any): NestedList[]{
        const nestableListItem:NestedList[] = nestableList.map(nestableListItem => {
            // return new NestedList(nestableListItem)
            if (nestableListItem instanceof NestableList){
                return new NestedList(nestableListItem)
            }
            else {
                const listItem = nestableListItem as ListItem
                const leaf = new NestableList(
                    conf,
                    listItem.getDisplayText(),
                    listItem.getInnerModel(),
                    listItem.getNestedItems(),
                    'leaf',
                    0
                )
                return new NestedList(leaf)
            }
        })
        return nestableListItem
        // the above van be done in one line but this way is more readable
    }

    private buildTree(root: NestedList) {
        const children = this.nestableList.filter(l => l.parentId === root.Id);
        if (children.length === 0) {return};

        children.forEach(child => {
            child.nestedDepth = root.nestedDepth + 1;
            root.setChildren(child)
            this.buildTree(child)
        })
    }

    public getTree():NestedList[] {
        return this.tree.getChildren()
    }
}

export enum ListItemType {
    FOLDER,
    CONTENT
}


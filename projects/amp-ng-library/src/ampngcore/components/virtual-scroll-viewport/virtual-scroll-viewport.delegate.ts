
export interface VirtualScrollViewportDelegate {
    contentIsSelectable(): boolean
    contentIsDraggable(): boolean
    reorderContent(reorderedContent: object[])
    getGenres?(item: any): string
    contentIsEditable(): boolean
    multiSelectEnabled(): boolean
    singleSelectEnabled(): boolean
}

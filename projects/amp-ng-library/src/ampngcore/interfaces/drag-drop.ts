export interface DragDroppableComponent {
    isDraggable(): boolean;
    handleDragoverEvent(event, model: any): void;
    handleDragstartEvent(event, model: any): void;
    handleDropEvent(event, model: any): void;
}

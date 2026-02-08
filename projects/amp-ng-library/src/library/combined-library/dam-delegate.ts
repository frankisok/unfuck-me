import { Tag } from "../../ampngcore/models/tag";
import { ListItem } from "../../ampngcore/core";

export interface DamDelegate {
    getProducts?(): Promise<any>;
    getProductsByMediaType?(): Promise<any>
    getProductPlans?(): Promise<any>
    publishObject?(id: bigint): void;
    getDamObject?(selectedItem: ListItem): Promise<any>;
    
    onAddOrEditContentSubmit?(content: Tag);
    onAddOrEditContentCancel?();
  }
  
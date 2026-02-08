import { FolderType } from '../core';
import { MediaType } from '../core';

export class AMPFolder {
    constructor(public id: number,
                public folderName: string,
                public folderType: FolderType,
                public mediaType: MediaType,
                public folderId: number,
                public folderIndex: number,
                public accountId?: number) {
    }
}

// export class NestableAMPFolder extends AMPFolder implements NestableItem {
//
//     name: string
//     contents: (NestableItem)[];
//     nestedDepth: number;
//
//     constructor(public id: number,
//                 public folderName: string,
//                 public folderType: FolderType,
//                 public mediaType: MediaType,
//                 public folderId: number,
//                 public accountId?: number
//     ) {
//         super(id, folderName, folderType, mediaType, folderId, accountId);
//         this.name = folderName
//         this.nestedDepth = 0
//         this.contents = []
//     }
// }

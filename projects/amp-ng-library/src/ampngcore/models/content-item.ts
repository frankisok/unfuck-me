import { Tag } from '../models';
import { Translation } from './translation';
import { AMPStatus } from '../core';

export class AMPContentItem {
    id: number;
    identifier: bigint;
    version: number;
    status: AMPStatus;
    editVersion: number;
    firstPublishedDate: number;
    lastPublishedDate: number;
    name: string;
    categoryId: bigint;
    duration: number;
    artistId: number;
    bpm: number;
    children: any[];
    createdDate: number;
    mediaEnd: number;
    mediaStart: number;
    musicKeyIn: number;
    musicKeyOut: number;
    promoVideoId: any;
    publisherId: number;
    renditions: any[];
    runtimePath: string;
    tags: Tag[];
    timelineEvents: any[];
    translations: Translation[];
    type: number;
    volumeAdjust: number;
    volumeNorm: number;
    year: number;
    isSelected?: boolean;

    constructor(data?: Partial<AMPContentItem>) {
        // Initialize properties with default values or provided data
        if (data) {
            Object.assign(this, data);
        }
    }
}

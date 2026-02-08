import { Rendition } from "./rendition";
import { Translation } from "./translation";

export interface DownloadQueueItem {
    artistId: number;
    bpm: number;
    categoryId: bigint;
    children: DownloadQueueItem[];
    createdDate: number;
    duration: number;
    firstPublishedDate: number;
    id: number;
    identifier: bigint;
    lastPublishedDate: number
    mediaEnd: number;
    mediaStart: number;
    musicKeyIn: number;
    musicKeyOut: number;
    name: string;
    publisherId: number;
    renditions: Rendition[];
    status: number;
    tags: any[];
    timelineEvents: any[];
    type: number;
    version: number
    promoVideoId: string,
    volumeNorm: 100,
    translations: Translation[],
    year: number;
    runtimePath: string;
}

export interface DownloadingMovie {
    movie: DownloadQueueItem;
    percent: number
}

export interface DownloadingItem {
    identifier: bigint;
    percent: number
}
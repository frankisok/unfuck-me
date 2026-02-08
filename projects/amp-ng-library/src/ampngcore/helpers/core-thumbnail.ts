import { ampEncodeURI } from '../core';

export function getImgForContentItem(contentItem, imageServer: string, imageDirectory: string) {
    const encodedAMPPath = getEncodedAMPPath(contentItem);
    const image = `${imageServer}/${imageDirectory}/` + encodedAMPPath + '/icon.jpg';
    const img = ampEncodeURI(image);
    return img;
}

export function getEncodedAMPPath(contentItem) {
    let amppath = contentItem.runtimePath;
    return amppath;
}

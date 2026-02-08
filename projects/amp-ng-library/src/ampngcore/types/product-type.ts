export enum EProduct {
    AUDIO_LIBRARY,
    VIDEO_LIBRARY,
    OTHER
}
export type ProductType = EProduct.AUDIO_LIBRARY | EProduct.VIDEO_LIBRARY | EProduct.OTHER
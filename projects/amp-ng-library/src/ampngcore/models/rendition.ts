export type Rendition = {
    id: number,
    name: string,
    description: string
    width: number,
    height: number,
    codec: number,
    encodingType: ""
    formats: RenditionFormat[]

}

export type RenditionFormat = {
    id: number,
    name: string,
    renditionId: number,
    codec: number
}
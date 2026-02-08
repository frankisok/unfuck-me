export class AMPPlayEntityTranslation {
    constructor(
        public id: number,
        public entityType: number,
        public entityId: number,
        public lang: string,
        public displayName: string,
        public description: string
    ){
    }
}
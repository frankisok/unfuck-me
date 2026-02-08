export class Translation {

    constructor(
        public referenceId: number,
        public language: string,
        public displayName: string,
        public summary: string,
        public itemDescription: string
    ) { }
}
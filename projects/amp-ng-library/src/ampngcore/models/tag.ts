export class Tag {
  constructor(public accountId: number,
              public id: bigint,
              public name: string,
              public tagGroupId: bigint,
              public mediaType: number,
              public children: Array<Tag>
            ) {
    }
}

export class TagRequestClass {
  constructor (
  public id : bigint,
  public name: string,
  public tagGroupId: bigint,
  public mediaType: number
) {}
}

export class Movie {

  imagePath: string = "";
  displayName: string = "displayName";
  summary: string = "summary";
  itemDescription: string = "itemDescription";

  constructor(public id: number = 0,
              public identifier: number = 0,
              public name: string = "",
              public promoVideoId: string = "") {}

}

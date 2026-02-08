export class ProductPayload {

  id: number;
  productRenditionCode: string;
  productName: string;
  currency: string;
  plusVAT : boolean;
  price: number;
  resellerPrice: number;
  displayName: string;
  productSummary: string;
  productDescription: string;
  licenced: boolean;
  movies: MoviePayload[];
  promoVideoId: string;

}

export class MoviePayload {

  id: number;
  identifier: number;
  name: string;
  runtimePath: string;
  promoVideoId: string;
  translations: TranslationPayload[];

}

export class TranslationPayload {

  id: number;
  language: string;
  displayName: string;
  summary: string;
  itemDescription: string;

}


export class TrialProductPayload {

  productRenditionCode: string;
  productName: string;
}

// import {environment} from '../../environments/environment';
import { Injectable } from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Router } from "@angular/router";
// import {Observable} from "rxjs/Observable";
import { Product } from '../models';
import { ProductPayload } from '../models';
import { Movie } from '../models';
import { PurchaseOrderRequest, ampEncodeURI } from '../core';

// import {ampEncodeURI} from '../shared/util/regex';
import { LibraryConfigService } from '../../library/library-config-service';
import { Observable } from "rxjs";
import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {

  contentMode: boolean

constructor(private http: HttpClient,
            private router: Router,
            private configService: LibraryConfigService,
            // private account: AccountService
            ) {
      this.contentMode = this.configService.isContentMode()
}

public fetchProducts(): Observable<any[]> {
  let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/products`;
  if (this.contentMode) {
      url = this.addDraftToUrl(url)
  }
   let options = this.makeOptionsHeaderText()
    return this.http.get(url, options).pipe(
        map((response: HttpResponse<any>) => {
            const r = this.convertToJson(response);
            return (r.constructor === Object && Object.keys(r).length === 0) ? [] : r;
        }));
}

public fetchProductPlans(mediaType: number): Observable<any[]> {
  let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/productplans/mediatype/${mediaType}`;
  let options = this.makeOptionsHeaderText()

  return this.http.get(url, options).pipe(
    map((response: HttpResponse<any>) => {
      return this.convertToJson(response)
    })
  )
}

public fetchProduct(productId: number): Observable<Product> {
  let url = `${this.configService.server}/ampapi/account/${this.configService.accountId}/shop/product/${productId}`;
   let options = this.makeOptionsHeaderText()
  return this.http.get(url, options).pipe(
    map((response: HttpResponse<any>) => (this.convertToJson(response)),
    map((productPayload: ProductPayload) => {

      let product = this.productFromPayload(productPayload);

      var filename1 = ampEncodeURI(productPayload.productName);
      var filename2 = productPayload.productName.replace(/\s/g, "_");
      product.productImage = `${this.configService.environment.imageServer}/atmosphere365.images/${this.configService.environment.imageDirectory}/Products.v2/${filename1}/${filename2}`;

      for (let movie of productPayload.movies) {

        let movieView: Movie = new Movie(movie.id, movie.identifier, movie.name, movie.promoVideoId);

        for (let translation of movie.translations) {
          if (translation.language === this.configService.getLanguage()) {
            movieView.displayName = translation.displayName;
            movieView.itemDescription = translation.itemDescription;
            movieView.summary = translation.summary;
            var runtimePathNoExt = movie.runtimePath.replace(/\.amp$/, "");
            var runtimePath = ampEncodeURI(runtimePathNoExt);
            var tempFilename = movieView.name.replace(/\s/g, "_");
            var filename = tempFilename.replace(/\&/g, "and");
            movieView.imagePath = `${this.configService.environment.imageServer}/atmosphere-images/${this.configService.environment.imageDirectory}/Content/UHD/${runtimePath}/${filename}`;
            product.movies.push(movieView);
          } // if

        } // for

      } // for

      return product;
    })));

}

public openCheckout(product: Product) {

  var _self = this;

  let handler = (<any>window).StripeCheckout.configure({
    key: this.configService.environment.stripeAPIKey,
    locale: "auto",
    token: function (token: any) {
      let url = `${this.configService.server}/ampapi/account/${_self.configService.accountId}/shop/purchase`
      let body = new PurchaseOrderRequest(product.productCode, token.id, _self.configService.accountId, product.currency, product.plusVAT);
      let options = {headers: _self.configService.getHeaders()};
      _self.http.post(url, body, options).pipe(
        map((response: Response) => response.json()),
        map(data => {
          _self.router.navigate(["/shop/products"]);
        }, error => {
          console.log(JSON.stringify(error.json()));
        }));

    }
  });

  handler.open({
    name: "atmosphere365",
    description: product.displayName,
    image: product.productImage + ".primary.jpg",
    currency: product.currency,
    email: this.configService.accountInfo.email,
    allowRememberMe: false,
    amount: product.priceToPay()
  });

} // openCheckout

private  productFromPayload (productPayload : ProductPayload)
{
  let product = new Product(
    productPayload.id,
    productPayload.productRenditionCode,
    productPayload.productName,
    productPayload.currency,
    productPayload.plusVAT,
    productPayload.price,
    productPayload.resellerPrice,
    productPayload.displayName,
    productPayload.productSummary,
    productPayload.productDescription,
    productPayload.licenced,
    productPayload.promoVideoId
  );
  return product;
}


  private imageForNameAndType(productName: string, type: string) {
      const name = productName;
      const image = `${this.configService.environment.imageServer}/${this.configService.environment.imageDirectory}/Products.v2/${name}/${type}/${name}.png`;
      const img = ampEncodeURI(image);
      return img;
  }


  public posterImage(name: string) : string
  {
      const img = this.imageForNameAndType(name, 'poster');
      return img;
  }

  public thumbnailImage(name: string) : string
  {
      const img = this.imageForNameAndType(name, 'thumbnail');
      return img;
  }

  private makeOptionsHeaderText()
  {
      return {headers: this.configService.getHeaders(), observe: 'response' as 'response', responseType: 'text' as const};
  }

  private addDraftToUrl(url: string): string {
      return url + '/draft/true'
  }

  private convertToJson(response: any) {
    const r = typeof response.body === 'string' ? JSON.parse(response.body).responseData : response.body.responseData;
    return r;
  } 
}

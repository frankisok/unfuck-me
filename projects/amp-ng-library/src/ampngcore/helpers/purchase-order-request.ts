export class PurchaseOrderRequest {

  productCode: string;
  purchaseToken: string;
  accountId: string;
  currency: string;
  plusVAT: boolean;

  constructor(productCode: string, purchaseToken: string, accountId: string, currency: string, plusVAT: boolean) {
    this.productCode = productCode;
    this.purchaseToken = purchaseToken;
    this.accountId = accountId;
    this.currency = currency;
    this.plusVAT = plusVAT;
  }

}

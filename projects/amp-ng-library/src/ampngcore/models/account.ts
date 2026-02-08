import {Installation} from "./installation";
import { Venue } from "./venue";


export class AMPAccount {
  public static SYSTEM_USER_ACCOUNT = 1;
  public venues?: Venue[] = [];
  public clients?: AMPAccount[] = [];

  constructor(
    public id: number = 0,
    public type: number = 0,
    public status: number = 0,
    public name: string = "",
    public addressLine1: string = "",
    public addressLine2: string = "",
    public city: string = "",
    public state: string = "",
    public country: string = "",
    public countryRecord: Country = null,
    public postcode: string = "",
    public phone: string = "",
    public businessNumber: string = "",
    public parentId: number = 0,
    public accountId: string = "",
    public validationHash: string = "",
    public accountPassword: string = "",
    public contactName: string = "",
    public contactEmail: string = "",
    public preferredLanguage: string = "",
  ) {
  }
}

export class Account {

  public static SYSTEM_USER_ACCOUNT = 1;
  public installations: Installation[] = [];
  public children: Account[] = [];

  constructor(
    public id: number = 0,
    public type: number = 0,
    public status: number = 0,
    public name: string = "",
    public addressLine1: string = "",
    public addressLine2: string = "",
    public city: string = "",
    public state: string = "",
    public country: string = "",
    public countryRecord: Country = null,
    public postcode: string = "",
    public phone: string = "",
    public businessNumber: string = "",
    public parentId: number = 0,
    public accountId: string = "",
    public validationHash: string = "",
    public accountPassword: string = "",
    public contactName: string = "",
    public contactEmail: string = "",
    public preferredLanguage: string = "",
  ) {
  }


  addInstallation(installation: Installation) {
    for (const i of this.installations) {
      if (i.id === installation.id) {
        return;
      }
    }
    this.installations.push(installation);
  }

}

export type Country = {
    code: string
    name: string

}

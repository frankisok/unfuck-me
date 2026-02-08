import {Account} from './account';
import {Licence} from './licence';


export class ResellerLicences {

  constructor(
    public client: Account,
    public installations: Licence[]) {}

}

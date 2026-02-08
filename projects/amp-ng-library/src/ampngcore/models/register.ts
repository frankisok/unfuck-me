import {Business} from './business';

export class Register {

  constructor(
    public account: Business,
    public password: string,
    public confirmPassword: string,
    public venue: Business,
    public utcOffsetMinutes: number
  ) {}

}

export class RegisterTrial extends Register {
    constructor(
        public override account: Business,
        public override password: string,
        public override confirmPassword: string,
        public override venue: Business,
        public resellerId: string,
        public productRenditionCode: string,
        public override utcOffsetMinutes: number,
    ) {
        super(account, password, confirmPassword, venue, utcOffsetMinutes);
    }
}

export class Business {
  public organisationId: number;

  constructor(
    public businessName: string,
    public contactName: string,
    public addressLine1: string,
    public addressLine2: string,
    public city: string,
    public state: string,
    public country: string,
    public postcode: string,
    public businessNumber: string,
    public phone: string,
    public contactEmail: string,
    public preferredLanguage?: string,
    public parentId?: number
  ) {}

}

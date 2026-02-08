import {Installation} from './installation';


export class Licence {

  public selectedInstallation: Installation = new Installation(0, '', 0, '');
  public disabled: boolean = false;
  public perpetual: boolean = false;

  constructor(
    public productName: string,
    public licenceCode: string,
    public licenceStatus: number,
    public venueName: string,
    public installationId: number,
    public installationName: string,
    public expiryDate: Date,
    public productRendition: string,
    public code: string,
    public scheduleId: number,
    public updatesEnabled: boolean,
    public productIdentifier: bigint,
    public mediaType: number
  ) {
    }

  public isP()
  {
    return this.expiryDate.getFullYear() > 2100;
  }
}

export class InstalledLicense {
  public clientId: number;
  public expiryDate: Date;
  public installationId: number;
  public installationName: string;
  public licenceCode: string;
  public licenceStatus: number;
  public productIdentifier: bigint;
  public productName: string;
  public scheduleId: bigint;
  public updatesEnabled: boolean;
  public venueName: string;

  constructor() {}
}


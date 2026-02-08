import {Licence} from './licence';
import {LicenceStatus} from '../core';


export class Installation {

    LINUX_OS = 'Linux'

    public licenceStatus: number;
    public licences: Licence[] = [];
    public hasInfo = false
    public playlists: any[] = []
    // isAudioDevice = false
    constructor(public id: number = 0,
        public installationName:string = '',
                public venueId: number = 0,
                public systemId: string = '',
                public scheduleId: bigint = BigInt(0),
                public deviceInfo : {} = {})
    {
        this.licenceStatus = LicenceStatus.Active;
    }


    public getLicences() {
        return this.licences;
    }



    public addLicence(licence: Licence)
    {
        this.licences.push(licence);

        if (licence.licenceStatus === LicenceStatus.Expired)
        {
            this.licenceStatus = LicenceStatus.Expired;
        }
        else if (licence.licenceStatus === LicenceStatus.AwaitingActivation)
        {
            if (this.licenceStatus === LicenceStatus.Active)
            {
                this.licenceStatus = LicenceStatus.AwaitingActivation;
            }
        }

        else if (licence.licenceStatus === LicenceStatus.AwaitingReactivation)
        {
            if (this.licenceStatus === LicenceStatus.Active)
            {
                this.licenceStatus = LicenceStatus.AwaitingReactivation;
            }
        }
        else if (licence.licenceStatus === LicenceStatus.ReactivationEnabled)
        {
            if (this.licenceStatus === LicenceStatus.Active)
            {
                this.licenceStatus = LicenceStatus.AwaitingReactivation;
            }

        }
    }

    setDeviceInfo(info: {}) {
        this.deviceInfo = info;
        this.hasInfo = true;
        const systemId = info['systemId'];
        // this.isAudioDevice = info['capabilities'] === 1;
    }
}

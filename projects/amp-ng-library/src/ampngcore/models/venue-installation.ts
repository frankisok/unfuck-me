
export class VenueInstallation {
    id: number
    installationName: string
    venueId: number
    hardwareKey: string
    systemId: string
    scheduleId: bigint
    updatesEnabled: number
    mediaType: number
    playlists: any[]
    schedule: any
    details: AMPInstallationDetails
    name?: string
}

export class AMPInstallationDetails {
    id: number
    installationId: number
    systemId: string
    osName: string
    osVersion: string
    buildNumber: number
}

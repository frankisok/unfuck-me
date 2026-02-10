
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ContentOwner, ContentType, MediaType } from '../../core';
import { AMPState, StateService } from '../../services/state.service';
import { EventBusService } from '../../services/event-bus.service';
import { AMPEventName, AMPEventType } from '../../protocols/events.protocol';
import { LibraryConfigService } from '../../../library/library-config-service';
@Component({
    selector: 'app-my-content-toggle-base',
    templateUrl: './my-content-toggle-base.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./my-content-toggle-base.component.scss'],
    standalone: true,
    imports: [NgClass, NgIf, TranslateModule]
})
export class MyContentToggleBaseComponent implements OnInit {

    SYSTEM_STATE = ContentOwner.SYSTEM
    MY_STATE = ContentOwner.MY

    @Input() contentType: ContentType

    currentState: AMPState

    dataOn: string
    dataOff: string

    @ViewChild('checkbox', { static: true }) checkbox: ElementRef

    constructor(
        protected stateService: StateService,
        protected eventBus: EventBusService,
        protected router: Router,
        protected translate: TranslateService,
        protected configService: LibraryConfigService
    ) { }

    get deviceTypeNOrientation() {
        return this.configService.deviceTypeNOrientation
    }

    ngOnInit(): void {
        this.currentState = this.stateService.getCurrentState()
        this.checkbox.nativeElement.checked = this.currentState.contentOwner != this.SYSTEM_STATE
        this.setDataOffOrOn();
    }

    toggle() {
        this.currentState.contentOwner = this.currentState.contentOwner == this.SYSTEM_STATE ? this.MY_STATE : this.SYSTEM_STATE
        this.stateService.updateContentOwnerState(this.currentState.contentOwner)
        const newUrl = this.getRouteToPath();

        this.eventBus.publish({
            eventName: AMPEventName.TOGGLE,
            eventPayload: {
                eventType: AMPEventType.TOGGLE_CONTENT_OWNER,
                eventData: this.currentState.contentOwner
            }
        })

        this.router.navigateByUrl(newUrl);
    }
    
    /**
     * sets data on and off values based on content type, this should be extended in amp ng playlist project
     */
    setDataOffOrOn() {
         switch (this.contentType) {
            case ContentType.LIBRARY:
                this.dataOn = this.translate.instant('atmosphere')
                this.dataOff = this.translate.instant('My Library')
                break;
            default:
                break;
        }
    }


    /**
     * this should be extended to cover other amp ng playlist project 
     * @returns 
     */
    getRouteToPath() {
        let path
        const owner = this.stateService.getCurrentState().contentOwner === ContentOwner.SYSTEM ? 'system' : 'my'
        const mediaType = this.currentState.mediaType === MediaType.AUDIO ? 'audio' : 'video'

        switch (this.contentType) {
            case ContentType.LIBRARY:
            default:
                path = `/library/${ owner }/${ mediaType }`;
                break
        }
        return path
    }
}

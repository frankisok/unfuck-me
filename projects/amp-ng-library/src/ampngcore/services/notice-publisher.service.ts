import { Injectable } from "@angular/core";
import {EventBusService} from './event-bus.service';
import {AMPEventName} from '../protocols/events.protocol';

@Injectable({ providedIn: 'root' })
export class NoticePublisherService {

    constructor(
        private eventBus: EventBusService
    ) {
    }

    error(message: string): void {
        this.publishNotice(message, false);
    }

    success(message: string): void {
        this.publishNotice(message, true);
    }

    private publishNotice(message: string, isSuccessful: boolean): void {
        this.eventBus.publish({
            eventName: AMPEventName.NOTICE_RECEIVED,
            eventPayload: {
                eventData: {
                    success: isSuccessful ? message : null,
                    error: isSuccessful ? null : message
                }
            }
        })
    }
}
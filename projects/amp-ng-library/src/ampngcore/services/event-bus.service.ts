import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {AMPEvent, AMPEventName} from '../protocols/events.protocol';

@Injectable({
    providedIn: 'root'
})

export class EventBusService {
    private eventSubjects: Map<AMPEventName, Subject<AMPEvent>> = new Map();

    constructor() {
        Object.keys(AMPEventName).forEach((eventName) => {
            this.eventSubjects.set(AMPEventName[eventName], new Subject<AMPEvent>());
        });
    }

    publish(ev: AMPEvent) {
        const subject = this.eventSubjects.get(ev.eventName);
        if (subject) {
            subject.next(ev);
        }
    }

    subscribe(eventName: AMPEventName): Observable<any> {
        const subject = this.eventSubjects.get(eventName);
        if (subject) {
            return subject.asObservable();
        } else {
            throw new Error(`Event subject not found for event name: ${eventName}`);
        }
    }





}
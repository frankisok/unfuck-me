import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {Alert} from '../models/alert.model';
import {NoticePublisherService} from './notice-publisher.service';


@Injectable({ providedIn: 'root' })
export class AlertService extends NoticePublisherService {
    private subject = new Subject<Alert>();
    private defaultId = 'default-alert';

    // enable subscribing to alerts observable
    onAlert(id = this.defaultId): Observable<Alert> {
        return this.subject.asObservable().pipe(filter(x => x && x.id === id));
    }

    // convenience methods
    // success(message: string, options?: any) {
    //     this.alert(new Alert({ ...options, autoClose: true, type: AlertType.Success, message }));
    // }

    // error(message: string, options?: any) {
    //     this.clear()
    //     this.alert(new Alert({ ...options, autoClose: true, type: AlertType.Error, message }));
    // }

    // info(message: string, options?: any) {
    //     this.alert(new Alert({ ...options, type: AlertType.Info, message }));
    // }

    // warn(message: string, options?: any) {
    //     this.alert(new Alert({ ...options, autoClose: true, type: AlertType.Warning, message }));
    // }

    // main alert method
    alert(alert: Alert) {
        alert.id = alert.id || this.defaultId;
        this.subject.next(alert);
    }

    // clear alerts
    clear(id = this.defaultId) {
        this.subject.next(new Alert({ id }));
    }
}

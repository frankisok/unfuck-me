import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

    isViewDisabled: boolean = true

    private playbackDataLoadingSubject = new Subject<boolean>()
    playbackDataLoadingInProgress$ = this.playbackDataLoadingSubject.asObservable()

    private detailLoadingSubject = new Subject<boolean>()
    detailLoadingInProgress$ = this.detailLoadingSubject.asObservable()
    
    private detailDisableUISubject = new Subject<boolean>()
    detailDisableUISubject$ = this.detailDisableUISubject.asObservable()

    private actionSubject = new Subject<boolean>()
    actionInProgress$ = this.actionSubject.asObservable()

    showPlaybackDataLoadingSpinner() {
        this.playbackDataLoadingSubject.next(true)
    }

    hidePlaybackDataLoadingSpinner() {
        this.playbackDataLoadingSubject.next(false)
    }

    showDetailLoadingSpinner() {
        this.detailLoadingSubject.next(true)
    }

    hideDetailLoadingSpinner() {
        this.detailLoadingSubject.next(false)
    }

    showActionSpinner() {
        this.actionSubject.next(true)
    }

    hideActionSpinner() {
        this.actionSubject.next(false)
    }

    showDetailDisableUI() {
        this.detailDisableUISubject.next(true)
    }

    hideDetailDisableUI() {
        this.detailDisableUISubject.next(false)
    }

    constructor() { 
        this.detailDisableUISubject$.subscribe((isViewDisabled) => {
            this.isViewDisabled = isViewDisabled
        })
    }
}

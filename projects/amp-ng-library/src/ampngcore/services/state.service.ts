import {Injectable} from '@angular/core';
import {ContentOwner, MediaType} from '../core';
import { BehaviorSubject } from 'rxjs';

export enum UserMode {
    USER,
    ADMIN,
    CONTENT,
    SYSTEM
}

export interface AMPState {
    mediaType: MediaType;
    contentOwner: ContentOwner;
    currentMode: UserMode;
    isAdminUser: boolean;
}

export interface FULL_PATH {
    playback: string,
    library: string,
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

    static USER_MODE_KEY = 'userMode';
    private _playbackFullPath = '';
    private fullPaths: FULL_PATH = {
        playback: '',
        library: '',
    }

    private DEFAULT_STATE: AMPState = {
        mediaType: MediaType.VIDEO,
        contentOwner: ContentOwner.SYSTEM,
        currentMode: UserMode.USER,
        isAdminUser: false
    }

    private stateSubject = new BehaviorSubject<AMPState>(this.DEFAULT_STATE);
    public state$ = this.stateSubject.asObservable();


  constructor() {
      this.initializeUserMode()
  }

    getCurrentState(): AMPState {
        return this.stateSubject.getValue();
    }

    updateMediaTypeState(mediaType: MediaType): void {
        this.updateState({ mediaType });
    }

    updateContentOwnerState(contentOwner: ContentOwner): void {
        this.updateState({ contentOwner });
    }

    getCurrentContentPath(): string {
        const state = this.getCurrentState();
        return (state.contentOwner === 1 ? 'system' : 'my') + '/' + (state.mediaType === 1 ? 'video' : 'audio');
    }

    updateState(partialState: Partial<AMPState>): void {
        const currentState = this.getCurrentState();
        const newState = { ...currentState, ...partialState };
        this.stateSubject.next(newState);
    }

    initializeUserMode(): void {
        let mode = UserMode.USER;

        // Check localStorage for saved mode
        const storedMode: UserMode = +localStorage.getItem(StateService.USER_MODE_KEY);
        if (storedMode) {
            mode = storedMode;
        }

        this.updateState({
            currentMode: mode
        });
    }

    switchMode(mode: UserMode): void {
        this.updateState({ currentMode: mode });
        localStorage.setItem(StateService.USER_MODE_KEY, mode.toString());
    }

    isUserMode(): boolean {
        return this.getCurrentState().currentMode === UserMode.USER;
    }

    isAdminMode(): boolean {
        return this.getCurrentState().currentMode === UserMode.ADMIN;
    }

    isContentMode(): boolean {
        return this.getCurrentState().currentMode === UserMode.CONTENT;
    }

    isSystemMode(): boolean {
        return this.getCurrentState().currentMode === UserMode.SYSTEM;
    }

    userModeAvailable(): boolean {
        const state = this.getCurrentState();
        return state.isAdminUser && (this.isAdminMode() || this.isContentMode() || this.isSystemMode());
    }

    contentModeAvailable(): boolean {
        const state = this.getCurrentState();
        return state.isAdminUser && (this.isAdminMode() || this.isUserMode() || this.isSystemMode());
    }

    adminModeAvailable(): boolean {
        const state = this.getCurrentState();
        return state.isAdminUser && (this.isUserMode() || this.isContentMode() || this.isSystemMode());
    }

    systemModeAvailable(): boolean {
      const state = this.getCurrentState();
      return state.isAdminUser && (this.isUserMode() || this.isContentMode() || this.isAdminMode());
    }

    resetState(): void {
        localStorage.removeItem('userMode');
        this.stateSubject.next(this.DEFAULT_STATE);
    }

    updateLibraryPlaybackFullPaths(fullPaths: FULL_PATH): void {
        this.fullPaths = fullPaths;
    }
    getLibraryPlaybackFullPaths(): FULL_PATH {
        return this.fullPaths
    }

}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ContentOwner, MediaType, memo, UnSub } from '../../core';
import { StateService, AMPState } from '../../services/state.service';
import { EventBusService } from '../../services/event-bus.service';
import { AMPEventName, AMPEventType } from '../../protocols/events.protocol';
import { LibraryConfigService } from '../../../library/library-config-service';
import { LibraryAssetsService } from '../../services/assets.service';

@Component({
	selector: 'library-toggle',
	templateUrl: './library-toggle.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	styleUrls: ['library-toggle.component.scss'],
	standalone: false
})
export class LibraryToggleComponent extends UnSub implements OnInit {

	VIDEO_STATE = MediaType.VIDEO
	AUDIO_STATE = MediaType.AUDIO

	@ViewChild('checkbox', { static: true })
	checkbox: ElementRef

	currentState: AMPState

	dataOn: string
	dataOff: string

	@Input() hasSearchBar = false;
	public searchTerm = '';

	constructor(
		private stateService: StateService,
		private eventBus: EventBusService,
		private location: Location,
		private router: Router,
		private cdr: ChangeDetectorRef,
		private translate: TranslateService,
		private configService: LibraryConfigService,
		protected assetsService: LibraryAssetsService,
	) {
		super();
	}

	get deviceTypeNOrientation() {
		return this.configService.deviceTypeNOrientation
	}

	ngOnInit(): void {
		this.currentState = this.stateService.getCurrentState();
		const path = this.location.path();

		// Use regex to match /library/system/video or /library/system/video/dam exactly
		const isVideo = /^\/library\/video(\/dam)?($|\/)/.test(path);

		this.checkbox.nativeElement.checked = isVideo;
		this.currentState.mediaType = isVideo ? MediaType.VIDEO : MediaType.AUDIO;
		this.stateService.updateMediaTypeState(this.currentState.mediaType);

		this.dataOff = this.translate.instant('Video');
		this.dataOn = this.translate.instant('Audio');
	}

	toggle() {
		this.currentState.mediaType = this.currentState.mediaType == this.VIDEO_STATE ? this.AUDIO_STATE : this.VIDEO_STATE
		this.cdr.markForCheck();
		this.stateService.updateMediaTypeState(this.currentState.mediaType)
		const newUrl = this.getRelativePath(this.stateService.getCurrentState().mediaType)
		this.cdr.detectChanges();
		this.router.navigateByUrl(newUrl);
	}

	getRelativePath(mediaType: MediaType) {
		const path = this.location.path();
		const newMediaType = mediaType === MediaType.AUDIO ? 'audio' : 'video';
		const newPath = path.replace(/\/(video|audio)(\/dam)?/, `/${newMediaType}$2`);
		return newPath;
	}

	updateSearchTerm() {
		this.eventBus.publish({
			eventName: AMPEventName.SEARCH_FILTER,
			eventPayload: {
				eventData: { searchTerm: this.searchTerm }
			}
		});
	}

	toggleContainerCssClass() {
		return this.stateService.getCurrentState().contentOwner === ContentOwner.SYSTEM ? 'd-flex media_toggle_with_search' : 'd-flex';
	}
}

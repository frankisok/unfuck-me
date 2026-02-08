import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { ampEncodeURI, memo, reIndex, UnSub } from '../../core';
import { LibraryConfigService } from '../../../library/library-config-service';
@Component({
    selector: 'mobile-song-preview',
    templateUrl: './mobile-song-preview.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./mobile-song-preview.component.scss'],
    standalone: false
})
export class MobileSongPreviewComponent extends UnSub implements OnInit {
	@ViewChild('audio') audioRef: ElementRef<HTMLAudioElement>;
	@Output() mobilePreview: EventEmitter<any> = new EventEmitter<any>();

	public url: SafeResourceUrl;
	imgPath: string;
	contentItem: any;
	artistName: string;
	duration: string;
	isMobile: boolean;
	currentProgress = 0;
	previewCurTime = '0:00';
	previewDuration = '0:00';
	isFullControlsVisible = false;
	isPlaying = false;
	// randomColor: string;
	isAudio: boolean;
	public data: any;

	constructor(
		private configService: LibraryConfigService,
		public sanitizer: DomSanitizer) {
			super();

	}

	ngOnInit(): void {
		this.configService.previewListener$.subscribe((data) => {
			this.extractPreviewDetails(data);
		});
		this.extractPreviewDetails(this.data);
	}


	@memo(...['contentItem', 'artistName', 'url'])
	getName(name) {
		return name.replace(reIndex, '');
	}

	showFullView() {
		this.mobilePreview.emit({ fullView: !this.isFullControlsVisible })
		this.isFullControlsVisible = !this.isFullControlsVisible;
	}
	closePreviewPlayer() {
		this.reset();
		this.mobilePreview.emit({ close: true });
	}

	toggleControls() {
		this.isFullControlsVisible = !this.isFullControlsVisible;
		const audio = this.audioRef.nativeElement;
		const audioPlayer = document.querySelector('.audio-player') as HTMLElement;

		if (this.isFullControlsVisible) {
			audioPlayer.style.display = 'block';
		} else {
			audioPlayer.style.display = 'none';
		}
	}

	updateProgress() {
		const audio = this.audioRef.nativeElement;
		const progress = (audio.currentTime / audio.duration) * 100;
		this.currentProgress = progress;
		this.previewCurTime = this.formatCurrentTime(audio.currentTime);
		this.previewDuration = this.formatCurrentTime(audio.duration);
		if (progress === 100) {
			this.isPlaying = false;
		}
	}

	togglePlayPause() {
		const audio = this.audioRef?.nativeElement;
		if (audio === undefined) {
			return
		}
		if (audio.paused) {
			audio.play();
			this.isPlaying = true;
		} else {
			audio.pause();
			this.isPlaying = false;
		}
	}
	
	private extractPreviewDetails(data: any) {
		this.reset();
		const preURL = this.url;
		this.contentItem = data.contentItem;
		this.artistName = data.artistName;
		this.duration = data.duration;
		this.imgPath = data.imgPath;
		this.currentProgress = 0;
		this.isPlaying = false;
		this.isAudio = data.isAudio;
		if (data.isAudio) {
			this.setupUp();
		} else {
			this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/' + this.contentItem.promoVideoId);
		}
		this.isFullControlsVisible = false;
		// this.randomColor = this.generateRandomColor();
		if (preURL !== this.url) {
			setTimeout(() => {
				this.togglePlayPause();
			}, 1000);
		}
	}
	
	private setupUp() {
		this.isMobile = this.configService.isMobile();
		let folderPath = this.contentItem.runtimePath;
		const dirLevels = folderPath.split('/');
		let fileName = dirLevels.pop();
		fileName = fileName.replace('.amp', '.m4a');

		// Audio Sample instead of audio
		folderPath = folderPath.replace('Audio/', '');
		folderPath = 'audio/sample/' + folderPath;
		const url = 'https://www.atmosphere365.com/' + folderPath + '/' + fileName;
		const encodedURI = ampEncodeURI(url);
		this.url = this.sanitizer.bypassSecurityTrustResourceUrl(encodedURI);
		// const audio = this.audioRef.nativeElement;
		// audio.addEventListener('timeupdate', this.updateProgress.bind(this));
	}
	
	// private generateRandomColor(): string {
	// 	const index = Math.floor(Math.random() * colors.length);
	// 	return colors[index];
	// }

	private formatCurrentTime(previewCurTime:number) {
		const minutes = Math.floor(previewCurTime / 60);
		const seconds = Math.floor(previewCurTime % 60);
		return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
	}
	
	private reset() {
		this.isPlaying = false;
		const audio = this.audioRef?.nativeElement;
		if (audio) {
			this.url = null;
		}
		this.audioRef = null
		this.isFullControlsVisible = false;
	}
}

// const colors = [
// 	// '#FF5733', // bright red
// 	'#FF8333', // orange
// 	'#8333FF', // indigo
// 	'#FF33D1', // magenta
// 	'#FFC133', // gold
// 	'#FF6933', // dark orange
// 	'#000000',
// 	'#1b1917',
// 	'#FFAD33', // dark yellow
// ];

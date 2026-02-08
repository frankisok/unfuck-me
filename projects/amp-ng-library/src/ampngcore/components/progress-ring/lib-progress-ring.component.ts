import { Component, Input, Output, EventEmitter } from '@angular/core';
import { LibraryAssetsService } from '../../service';
import { MediaType } from '../../enums/media-type';

@Component({
    selector: 'lib-progress-ring',
    templateUrl: './lib-progress-ring.component.html',
    styleUrl: './lib-progress-ring.component.scss',
    standalone: false
})
export class LibProgressRingComponent {
	
	/** */
	@Input() isDiscProgress: boolean = false;

	/** 
	 * Radius of the progress ring circle. 
	 * - Please note radius in range of 20s should have  relatively small value {@link inProgress} and {@link progressBackground}
	*/
	@Input() radius: number = 30;

	/** 
	 * Stroke width of the progress bar. 
	 * Please note that if this is bigger or closer to the @see {@link progressBackground} value with a radius of less than 30 the circle becomes hard to see progress after 95% */
	@Input() inProgress: number = 5;

	/** Stroke width of the background circle. */
	@Input() progressBackground: number = 8;

	/** Current progress percentage (0-100). */
	@Input() progression: number = 0;

	@Input() disable: boolean = false;

	@Input() isStop: boolean = false;
	
	@Input() mediaType!: MediaType

	/** callback when the progress ring is clicked. */
	@Output() onClick: EventEmitter<any> = new EventEmitter<any>();

	/**
	 * the total distance around the circle
	 * π × (2 × r): Multiplying the diameter by π gives the total circumference of the circle.
	 */
	get circleCircumference(): number {
		return 2 * Math.PI * this.radius;
	}

	/** computes the total width and height of the SVG canvas (in pixels) that contains the circular progress ring. */
	get widthHeight(): number {
		return this.radius * 2 + Math.max(this.inProgress, this.progressBackground) * 2;
	}

	/** calculates the center position (x and y coordinates) of the circular progress ring within the SVG canvas */
	get circlePosition(): number {
		return this.radius + Math.max(this.inProgress, this.progressBackground);
	}

	styleRoot: HTMLElement | undefined;
	fillColor: string;
	circleBg: string = '#e0e0e0'

	constructor(
		protected assetsService: LibraryAssetsService
	) {
		this.styleRoot = document.documentElement;
		this.fillColor = getComputedStyle(this.styleRoot!).getPropertyValue('--atmosphere-main-color').trim();
	}


	/** calculates how much of the circular progress bar is "hidden" (or offset) to visually represent the progress */
	getStrokeDashOffset(): number {
		// Ensure progression value is between 0 and 100
		const progressionValue = Math.min(Math.max(this.progression, 0), 100);
		const offset = this.circleCircumference * (1 - progressionValue / 100);
		return offset;
	}

	fnCalBck() {
		const button = this.progression ? 'stop' : 'play'
		this.onClick.emit({
			button: button,
			mediaType: this.mediaType
		});
	}

	getProgressPath(): string {
		const progress = Math.min(Math.max(this.progression, 0), 100);
		if (progress <= 0) return '';

		const startAngle = 0;
		const endAngle = (progress / 100) * 360;

		return this.describeArc(50, 50, this.radius, startAngle, endAngle);
	}

	polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
		const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
		return {
			x: cx + r * Math.cos(angleInRadians),
			y: cy + r * Math.sin(angleInRadians)
		};
	}

	describeArc(x: number, y: number, r: number, startAngle: number, endAngle: number): string {
		const start = this.polarToCartesian(x, y, r, endAngle);
		const end = this.polarToCartesian(x, y, r, startAngle);

		const largeArcFlag = endAngle - startAngle > 180 ? '1' : '0';

		return [
			`M ${x} ${y}`, // move to center
			`L ${end.x} ${end.y}`, // line to start of arc (remember: this is startAngle)
			`A ${r} ${r} 0 ${largeArcFlag} 1 ${start.x} ${start.y}`, // arc to endAngle
			'Z'
		].join(' ');
	}
}

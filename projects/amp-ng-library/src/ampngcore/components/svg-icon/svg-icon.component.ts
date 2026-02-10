import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-svg-icon',
    templateUrl: './svg-icon.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './svg-icon.component.scss',
    standalone: true,
    imports: [NgClass]
})
export class SvgIconComponent implements OnInit {

	iconPath: SafeResourceUrl | undefined;
	_fillColor: string = '#dd6a15';
	@Input() className = 'd-block pr-2';
	@Input() iconIndex: number = 0
	@Input() iconName!: string;
	@Input() set fillColor(v: string) {
		this._fillColor = v;
		if(this.svgElement) {
			this.loadSvg();
		}
	};
	@Input() size: string = '30px';
	@Input() disable: boolean = false;
	@Input() iconText: string = '' // the text displayed under the icon
	@Output() onClick: EventEmitter<any> = new EventEmitter<any>();

	private basePath: string = '../../../assets/img/';
	svgElement: SVGSVGElement | null | undefined;


	constructor(
		private sanitizer: DomSanitizer,
		private http: HttpClient,
	) {
	}

	ngOnChanges(): void {
		this.iconPath = this.sanitizer.bypassSecurityTrustResourceUrl(`${ this.basePath }${ this.iconName }.svg`);
		if (!this.svgElement) {
			this.loadSvg()
		}
	}

	ngOnInit(): void {
		this.loadSvg()
	}

	onSvgLoad(event: Event): void {
		const objectElement = event.target as HTMLObjectElement;
		const svgDoc = objectElement.contentDocument;

		if (svgDoc) {

			const svgElement = svgDoc.querySelector('svg');
			if (svgElement) {
				svgElement.addEventListener('click', this.clicked.bind(this));

				if (this._fillColor) {
					svgElement.setAttribute('fill', this._fillColor);
					const paths = svgElement.querySelectorAll('path');
					paths.forEach(path => path.setAttribute('fill', this._fillColor));
				}

				// Only set dimensions if not already defined
				if (!svgElement.getAttribute('width') && !svgElement.getAttribute('height')) {
					svgElement.setAttribute('width', this.size);
					svgElement.setAttribute('height', this.size);
				}
			}
		}
	}

	clicked($event: any): void {
		this.onClick.emit($event)
	}

	// Inline SVG, this approach is better for more control
	loadSvg(): void {
		this.http.get(`${ this.basePath }${ this.iconName }.svg`, { responseType: 'text' }).subscribe(svgContent => {
			this.renderSvg(svgContent);
		});
	}
	renderSvg(svgContent: string): void {
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
		this.svgElement = svgDoc.querySelector('svg');

		if (this.svgElement) {
			this.svgElement.setAttribute('width', this.size)
			this.svgElement.setAttribute('height', this.size)

			const paths = this.svgElement.querySelectorAll('path');
			paths.forEach(path => {
				path.setAttribute('fill', this._fillColor);
			});

			// Attach the inline SVG to the DOM
			const container = document.querySelector(`#${ this.iconName+this.iconIndex }`);
			setTimeout(() => {
				if (!container) return;
				container!.innerHTML = new XMLSerializer().serializeToString(this.svgElement!);
				if (container) {
					container.classList.add('svgContainer');
					container.classList.add(this.iconName);
				}
			}, 100)

			// Add click listeners
			this.svgElement.addEventListener('click', this.clicked.bind(this));
		}
	}

}

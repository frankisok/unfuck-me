import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { LibraryConfigService } from '../../../library/library-config-service';
@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./spinner.component.scss'],
    standalone: true,
    imports: [NgIf]
})
export class SpinnerComponent implements OnInit {

	@Input() loadingComponentText: string = 'Loading data please wait...'
	isMobile: boolean;

	constructor(
		private configService: LibraryConfigService
	) { 
	}

	ngOnInit(): void {
		this.isMobile = this.configService.isMobile()
	}

}

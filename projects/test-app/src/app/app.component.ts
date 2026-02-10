import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DamService, MediaType, StateService } from 'amp-ng-library';
import { AppLibraryConfigService, RenditionService } from './app-library.service';
import { Location } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule]
})
export class AppComponent implements OnInit {
  title = 'test-app';
  mediaType: MediaType = MediaType.AUDIO;
  isLibraryTabs = false;

  constructor(
    protected configService: AppLibraryConfigService,
    private dam: DamService,
    stateService: StateService,
    renditionService: RenditionService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
  ) {
    console.log('configService', configService);
    configService.configureLibrary(
      null,
      null,
      stateService,
      dam,
      renditionService
    );
  }

  ngOnInit() {
    this.activatedRoute.data.subscribe((params: any) => {
      console.log(params)
      if (params.mediaType) {
        this.mediaType = params.mediaType;
      }
    });

    // capture the url path before navigation and set the active tab if url is a master view tab
    this.location.onUrlChange((url: string) => {
      this.configService.updateMasterViewTabsCallback(!!url ? url : '/library/audio');
    });
  }
  
  toggleLibraryVisibility() {
    this.isLibraryTabs = !this.isLibraryTabs;
  }
}

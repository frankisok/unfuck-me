import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LibraryConfigService, LibraryComponentService, AMPNGLibraryModule, ProductFilterService, ProductService, StateService } from 'amp-ng-library';

import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AppLibraryConfigService, RenditionService } from './app-library.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AudioWrapperComponent } from './wrapper/audio-wrapper/audio-wrapper.component';
import { VideoWrapperComponent } from './wrapper/video-wrapper/video-wrapper.component';
import { RouterModule } from '@angular/router';
import { ProductWrapperComponent } from './wrapper/product-wrapper/product-wrapper.component';
import { MobileMasterViewComponent } from './mobile-master-view/mobile-master-view.component';

const providers = [
  HttpClient,
  ProductFilterService,
  ProductService,
  RenditionService,
  // StateService,
  // LibraryComponentService,
  TranslateService,
  { provide: LibraryConfigService, useExisting: AppLibraryConfigService },
]

@NgModule({
  declarations: [
    AppComponent,
    AudioWrapperComponent,
    VideoWrapperComponent,
    ProductWrapperComponent,
    MobileMasterViewComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AMPNGLibraryModule,
    TranslateModule.forRoot(),
    RouterModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    ...providers
  ]
})
export class AppModule { }

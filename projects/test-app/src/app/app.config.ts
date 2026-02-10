import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { APP_ROUTES } from './app.routes';
import { LibraryConfigService, ProductFilterService, ProductService } from 'amp-ng-library';
import { AppLibraryConfigService, RenditionService } from './app-library.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(APP_ROUTES),
    provideHttpClient(withInterceptorsFromDi()),
    AppLibraryConfigService,
    ProductFilterService,
    ProductService,
    RenditionService,
    { provide: LibraryConfigService, useExisting: AppLibraryConfigService },
  ],
};

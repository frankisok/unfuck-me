import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryActionMenuComponent } from './library-action-menu/library-action-menu.component';
import { AudioLibraryDetailComponent } from './combined-library/audio-lib-detail/audio-lib-detail.component';
import { LibraryComponent } from './combined-library/library.component';
import { VideoLibDetailComponent } from './combined-library/video-lib-detail/video-lib-detail.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AMPNGCoreModule } from '../ampngcore/ampngcore.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AddContentFormComponent } from "../ampngcore/components/crud-actions/add-content-form/add-content-form.component";
import { EditContentFormComponent } from '../ampngcore/components/crud-actions/edit-content-form/edit-content-form.component';
import { RouterModule } from '@angular/router';


const providers: Array<Provider> = [
	// AudioLibraryService,
	// {provide: HTTP_INTERCEPTORS, useClass: ResponseJsonInterceptor, multi: true},
	// {provide: HTTP_INTERCEPTORS, useClass: RequestJsonInterceptor, multi: true},
]
/**
 * `AMPNGLibraryModule` is an AMPLibrary module that provides components and services related to the library feature of the application.
 * 	The library module comes with the audio/video library feature as it core component, along with many others.
 *
 * It imports several modules needed for its functionality such as `CommonModule`, `ScrollingModule`, `AMPNGCoreModule`, `TranslateModule`, and `FormsModule`.
 *
 * It declares components that are part of the library feature such as `LibraryActionMenuComponent`, `AudioLibraryDetailComponent`, `LibraryComponent`, `VideoLibDetailComponent`, `LibraryDetailHeaderComponent`, and `ProductInfoPanelComponent`.
 *
 * It also provides `AudioLibraryService` as a service and `RequestJsonInterceptor` and `ResponseJsonInterceptor` as HTTP interceptors.
 */
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		TranslateModule,
		AMPNGCoreModule,
		ScrollingModule,
		RouterModule,
		AddContentFormComponent,
		EditContentFormComponent
],

	declarations: [
		AudioLibraryDetailComponent,
		LibraryActionMenuComponent,
		LibraryComponent,
		VideoLibDetailComponent,
	],

	exports: [
		AMPNGCoreModule,
		LibraryComponent
	],
	providers: providers
})
export class AMPNGLibraryModule {
	/**
	 * A static method that provides the `AMPNGLibraryModule` with the additional services as a provider.
	 *
	 * @returns An array of providers that includes the `AudioLibraryService`.
	 */
	static forRoot(services?: Array<Provider>): ModuleWithProviders<AMPNGLibraryModule> {
		let libraryProviders = [...providers];

		if (services && services.length > 0) {
			for (const service of services) {
				if (!service) {
					console.error(`Service is Undefined: Undefined service provider`);
				} else {
					libraryProviders.push(service);
				}
			}
		}

		return {
			ngModule: AMPNGLibraryModule,
			providers: libraryProviders
		}
	}
}

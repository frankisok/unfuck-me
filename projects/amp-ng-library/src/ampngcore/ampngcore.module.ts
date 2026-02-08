import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MasterViewListComponent} from './components/master-view-list/master-view-list.component';
import {MasterViewListItemComponent} from './components/master-view-list/master-view-list-item.component';
import {ProductFilterComponent} from './components/product-filter/product-filter.component';
import {NgbDatepickerModule, NgbPopoverModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import {VideoPreviewModalComponent} from './components/video-preview-modal/video-preview-modal.component';
import {AudioPreviewModalComponent} from './components/audio-preview-modal/audio-preview-modal.component';
import {VirtualScrollViewportComponent} from './components/virtual-scroll-viewport/virtual-scroll-viewport.component';
import {CdkTreeModule} from '@angular/cdk/tree';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {TranslateModule} from '@ngx-translate/core';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {EditModeActionsComponent} from './components/edit-mode-actions/edit-mode-actions.component';
import {MasterViewToolbarComponent} from './components/master-view-toolbar/master-view-toolbar.component';
import {ActionPopoverComponent} from './components/popovers/action-popover.component';
import {GenericDelConfirmComponent} from './components/master-view-list/generic-del-confirm/generic-del-confirm.component';
import {GenericToolBarComponent} from './components/generic-tool-bar/generic-tool-bar.component';
import {LibToolbarWrapperComponent} from './components/lib-toolbar-wrapper/lib-toolbar-wrapper.component';
import {AddPlansFormComponent} from './components/master-view-list/add-plans-form/add-plans-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DataConflictModalComponent} from './components/data-conflict-modal/data-conflict-modal.component';
import {MasterViewComponent} from './components/master-view-list/master-view/master-view.component';
import {MediaTypeToggleComponent} from './components/media-type-toggle/media-type-toggle.component';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {FormEntryErrorsComponent} from './components/form-entry-errors/form-entry-errors.component';
import {AmpDynamicHostListenerDirective} from './components/directives/click-outside-directive';
import {AmpDatePickerComponent} from './components/amp-date-picker/amp-date-picker.component';
import { TruncatePipe } from './helpers/truncate.pipe';
import { MobileSongPreviewComponent } from './components-mobile/mobile-song-preview/mobile-song-preview.component';
import { MobileNavComponent } from './components-mobile/mobile-nav/mobile-nav.component';
import { MobileNavWrapperComponent } from './components-mobile/mobile-nav-wrapper/mobile-nav-wrapper.component';
import { MobileNavCardItemsComponent } from './components-mobile/mobile-nav/mobile-nav-card-items/mobile-nav-card-items.component';
import { AutocompleteSearchComponent } from './components/autocomplete-search/autocomplete-search.component';
import { GenericSelectComponent } from './components/generic-select/generic-select.component';
import { SvgIconComponent } from './components/svg-icon/svg-icon.component';
import { LibraryToggleComponent } from './components/library-toggle/library-toggle.component';
import { LibProgressRingComponent } from './components/progress-ring/lib-progress-ring.component';
import {TagLoaderComponent} from './components/virtual-scroll-viewport/virtual-scroll-genres/tag-loader/tag-loader.component';
import { MyContentToggleBaseComponent } from './components/my-content-toggle/my-content-toggle-base.component';

/**
 * `AMPNGCoreModule` is a core module that provides essential services and components for the application.
 *
 * This module should be imported only once, preferably in the AppModule. It provides singleton services
 * that are used throughout the application. It may also declare and export common components, directives,
 * and pipes that are used in multiple feature modules.
 *
 * It can import other modules like `HttpClientModule` or `FormsModule` that are needed for its services
 * and components. It can also provide application-wide singleton services by adding providers to its
 * `@NgModule` decorator.
 */
@NgModule({
    imports: [
        CommonModule,
        CdkTreeModule,
        NgbTooltipModule,
        NgbPopoverModule,
        TranslateModule,
        CdkTreeModule,
        DragDropModule,
        ScrollingModule,
        FormsModule,
        TranslateModule,
        NgbDatepickerModule,
        ReactiveFormsModule,
        
        
    ],
    declarations: [
        MasterViewListComponent,
        MasterViewListItemComponent,
        ProductFilterComponent,
        VideoPreviewModalComponent,
        AudioPreviewModalComponent,
        VirtualScrollViewportComponent,
        TagLoaderComponent,
        EditModeActionsComponent,
        MasterViewToolbarComponent,
        ActionPopoverComponent,
        GenericDelConfirmComponent,
        GenericToolBarComponent,
        LibToolbarWrapperComponent,
        AddPlansFormComponent,
        DataConflictModalComponent,
        MasterViewComponent,
        MediaTypeToggleComponent,
        MyContentToggleBaseComponent,
        SpinnerComponent,
        FormEntryErrorsComponent,
        AmpDynamicHostListenerDirective,
        AmpDatePickerComponent,
        TruncatePipe,
        MobileSongPreviewComponent,
        MobileNavComponent,
        MobileNavWrapperComponent,
        MobileNavCardItemsComponent,
        GenericSelectComponent,
        SvgIconComponent,
        AutocompleteSearchComponent,
        LibraryToggleComponent,
        LibProgressRingComponent,

    ],
    exports: [
        MasterViewListComponent,
        MasterViewListItemComponent,
        ProductFilterComponent,
        VideoPreviewModalComponent,
        AudioPreviewModalComponent,
        VirtualScrollViewportComponent,
        EditModeActionsComponent,
        MasterViewToolbarComponent,
        ActionPopoverComponent,
        GenericToolBarComponent,
        GenericDelConfirmComponent,
        AddPlansFormComponent,
        DataConflictModalComponent,
        MasterViewComponent,
        MediaTypeToggleComponent,
        MyContentToggleBaseComponent,
        SpinnerComponent,
        FormEntryErrorsComponent,
        AmpDynamicHostListenerDirective,
        AmpDatePickerComponent,
        TruncatePipe,
        MobileSongPreviewComponent,
        MobileNavComponent,
        MobileNavWrapperComponent,
        GenericSelectComponent,
        SvgIconComponent,
        FormsModule,
        AutocompleteSearchComponent,
        LibraryToggleComponent,
        LibProgressRingComponent,
    ],
})
export class AMPNGCoreModule {}

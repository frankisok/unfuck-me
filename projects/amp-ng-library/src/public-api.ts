/*
 * Public API Surface of amp-ng-library
 */

// NB: IN ORDER TO KEEP IT CLEAN AND CONSIST, ONLY COMPONENT SHOULD BE EXPORTED IN THIS FILES, EVERYTHING ELSE SHOULD BE EXPORTED IN core/services/models

// export core modules/interfaces/enums/models/services
export * from './ampngcore/service';
export * from './ampngcore/core';
export * from './ampngcore/models';
export * from './ampngcore/models/play-entity-translation';
export * from './ampngcore/interfaces/playback-content.interface';
export * from './ampngcore/protocols/events.protocol';
export * from './ampngcore/services/state.service';
export * from './ampngcore/enums/amp-object-type.enum';
export * from './ampngcore/websocket/amp-websocket-protocol';
export * from './ampngcore/websocket/message-data.interface';
export {ContentService, ContentServiceMethod} from './ampngcore/services/content.service';

// export library module/services
export * from './library/library-component-service';
export * from './library/library-config-service';
// (NgModule exports removed in standalone migration)

// export components
// export * from '../../../backup/lib/amp-ng-library.component';
export * from './library/combined-library/library.component';
export * from './ampngcore/components/audio-preview-modal/audio-preview-modal.component';
export * from './ampngcore/components/master-view-list/master-view-list.component';
export * from './ampngcore/components/master-view-list/master-view-list-item.component';
export * from './ampngcore/components/master-view-list/master-view/master-view.component';
export * from './ampngcore/components/master-view-list/util/list-item-config-factory';
export * from './ampngcore/components/product-filter/product-filter.component';
export * from './ampngcore/components/product-filter/product-filter.delegate';
export * from './ampngcore/components/video-preview-modal/video-preview-modal.component';
export * from './ampngcore/components/virtual-scroll-viewport/virtual-scroll-viewport.component';
export * from './ampngcore/components/generic-tool-bar/generic-tool-bar.component';
export * from './ampngcore/components/master-view-toolbar/master-view-toolbar-action';
export * from './amp-ng-library.component';
export * from './ampngcore/components/edit-mode-actions/edit-mode-actions.component';
export * from './ampngcore/components/popovers/action-popover.parent';
export * from './ampngcore/components/popovers/action-popover.component';
export * from './ampngcore/components/popovers/generic-popover.controller';
export * from './ampngcore/components/popovers/generic-popover.mediator';
export * from './ampngcore/components/generic-select/generic-select.component';
export * from './ampngcore/components/master-view-list/add-plans-form/add-plans-form.component';
export * from './ampngcore/components/data-conflict-modal/data-conflict-modal.component';
export * from './ampngcore/components/media-type-toggle/media-type-toggle.component';
export * from './ampngcore/components/my-content-toggle/my-content-toggle-base.component';
export * from './ampngcore/components-mobile/mobile-song-preview/mobile-song-preview.component';
export * from './ampngcore/components-mobile/mobile-nav/mobile-nav.component';
export * from './ampngcore/components-mobile/mobile-nav-wrapper/mobile-nav-wrapper.component';
export * from './ampngcore/components/svg-icon/svg-icon.component';

// dam
export * from './library/combined-library/library-detail-header.delegate';
export * from './library/combined-library/dam-delegate';

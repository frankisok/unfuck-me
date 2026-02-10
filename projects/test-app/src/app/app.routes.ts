import { Routes } from '@angular/router';
import { AudioWrapperComponent } from './wrapper/audio-wrapper/audio-wrapper.component';
import { VideoWrapperComponent } from './wrapper/video-wrapper/video-wrapper.component';
import { ProductWrapperComponent } from './wrapper/product-wrapper/product-wrapper.component';

export const APP_ROUTES: Routes = [
  { path: '', component: AudioWrapperComponent },
  { path: 'library/audio', component: AudioWrapperComponent },
  { path: 'library/video', component: VideoWrapperComponent },
  { path: 'library/product', component: ProductWrapperComponent },
];

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioWrapperComponent } from './wrapper/audio-wrapper/audio-wrapper.component';
import { VideoWrapperComponent } from './wrapper/video-wrapper/video-wrapper.component';
import { ProductWrapperComponent } from './wrapper/product-wrapper/product-wrapper.component';


const routes: Routes = [
  { path: '', component: AudioWrapperComponent },
  { path: 'library/audio', component: AudioWrapperComponent },
  { path: 'library/video', component: VideoWrapperComponent },
  { path: 'library/product', component: ProductWrapperComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl, } from '@angular/platform-browser';
import { ampEncodeURI, memo, reIndex } from '../../core';
import { LibraryAssetsService } from '../../service';


@Component({
    selector: 'amp-video-preview-modal',
    templateUrl: './video-preview-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./video-preview-modal.component.scss'],
    standalone: false
})
export class VideoPreviewModalComponent implements OnInit {

  public contentItem: any;
  public url: SafeResourceUrl;
  public artistName: any;
  public duration: any;


  constructor(
    private activeModal: NgbActiveModal,
    protected assetsService: LibraryAssetsService,
    public sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/' + this.contentItem.promoVideoId);
    document.querySelector('.modal-dialog').classList.add('full-width');
    document.querySelector('.modal-dialog.modal-dialog-centered.modal-lg').classList.add('full-width');
  }

  close() {
    this.activeModal.close(this);
  }

  @memo(...['contentItem', 'artistName', 'url'])
  getName(name) {
    return name.replace(reIndex, '');
  }
}

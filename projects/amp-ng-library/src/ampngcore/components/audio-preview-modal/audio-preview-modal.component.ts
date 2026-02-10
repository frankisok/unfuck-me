import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ampEncodeURI, MEDIA_DIRECTORY, memo, PUBLIC_HTML_SERVER, reIndex } from '../../core';
import { LibraryAssetsService } from '../../service';

@Component({
    selector: 'amp-audio-preview-modal',
    templateUrl: './audio-preview-modal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./audio-preview-modal.component.scss'],
    standalone: true,
    imports: [NgClass],
})
export class AudioPreviewModalComponent implements OnInit {

    public contentItem: any;
    public url: SafeResourceUrl;
    public artistName: any;
    public duration: any;
    
    constructor(private activeModal: NgbActiveModal,
                protected assetsService: LibraryAssetsService,
                public sanitizer: DomSanitizer) {
    }

    ngOnInit(): void {
        const filename = this.contentItem?.name + '.m4a';
        const url = `${PUBLIC_HTML_SERVER}/${MEDIA_DIRECTORY}/${this.contentItem?.runtimePath}/${filename}`;
        const encodedURI = ampEncodeURI(url);
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(encodedURI);
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

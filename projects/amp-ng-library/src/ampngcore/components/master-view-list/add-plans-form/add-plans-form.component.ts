import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AMPProductPlan } from '../../../models/product';
import { AddPlanConfirmDelegate } from './add-plan-confirm.delegate';
import { ListItem } from '../models/list-item';
import { MediaType } from '../../../enums/media-type';

@Component({
    selector: 'lib-add-plans-form',
    templateUrl: './add-plans-form.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./add-plans-form.component.scss'],
    standalone: true,
    imports: [FormsModule, NgIf]
})
export class AddPlansFormComponent implements OnInit {
    planName: string = '';

    @Input() selectedItem: ListItem
    @Input() eventDelegate: AddPlanConfirmDelegate;

    // mediaType
    AUDIO_MEDIA = MediaType.AUDIO;
    VIDEO_MEDIA = MediaType.VIDEO;

    constructor() {}

    ngOnInit(): void {}

    onCancel() {
        this.eventDelegate.onAddContentCancel();
        this.planName = ''
    }

    setMediaType(): number {
        var mediaType: number
        if (this.selectedItem && (this.selectedItem.getDisplayText() === 'Audio Product Plans' || this.selectedItem.getInnerModel().mediaType === 2)) {
            console.log('audio plan')
            return mediaType = this.AUDIO_MEDIA
        } else {
            console.log('video plan')
            return mediaType = this.VIDEO_MEDIA
        }
    }

    onConfirm() {
        const newPlan = new AMPProductPlan({
            id: 0,
            identifier: BigInt(0),
            version: 1,
            status: 1,
            editVersion: 0,
            firstPublishedDate: 0,
            lastPublishedDate: 0,
            code: '',
            name: this.planName,
            description: '',
            renditions: [],
            products: [],
            translations: [],
            mediaType: this.setMediaType()
        });

        this.eventDelegate.onAddContentSubmit(newPlan);
        this.planName = '';
    }
}

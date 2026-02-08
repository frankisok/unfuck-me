import { Component, OnInit } from '@angular/core';
import { Tag } from '../../models';
import { AddOrEditContentConfirmDelegate } from '../crud-actions/add-edit-content-delegate';
import { LibraryConfigService } from '../../../library/library-config-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RecursiveTagTreeComponent } from './recursive-tag-tree/recursive-tag-tree.component';

@Component({
  selector: 'lib-tag-selection-modal',
  imports: [RecursiveTagTreeComponent],
  templateUrl: './tag-selection-modal.component.html',
  styleUrl: './tag-selection-modal.component.scss'
})
export class TagSelectionModalComponent implements OnInit {

  tags: Tag[]
  isSelected: Tag
  selectedTag: Tag
  selectedOption: Tag
  eventDelegate: AddOrEditContentConfirmDelegate;

  constructor(
    private configService: LibraryConfigService,
    private activeModal: NgbActiveModal
  ) {
  }

  get deviceTypeNOrientation() {
    return this.configService.deviceTypeNOrientation;
  }

  ngOnInit(): void {
    
  }

  selectedItem(item) {
    this.selectedOption = item
  }

  close() {
    this.activeModal.close()
  }

  moveTag() {
    if (!this.selectedOption) {
      this.selectedTag.tagGroupId = BigInt(0n)
    } else {
      this.selectedTag.tagGroupId = this.selectedOption.id
    }
    this.eventDelegate.onAddOrEditContentSubmit(this.selectedTag)
    this.activeModal.close()
  }

}

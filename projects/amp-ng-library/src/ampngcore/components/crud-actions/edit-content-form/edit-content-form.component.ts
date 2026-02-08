import { Component, Input, OnInit } from '@angular/core';
import { ListItem } from '../../../core';
import { FormsModule } from '@angular/forms';
import { AddOrEditContentConfirmDelegate } from '../add-edit-content-delegate';
import { NgIf } from '@angular/common';

@Component({
  selector: 'lib-edit-content-form',
  imports: [FormsModule, NgIf],
  templateUrl: './edit-content-form.component.html',
  styleUrl: './edit-content-form.component.scss'
})
export class EditContentFormComponent implements OnInit {

  @Input() eventDelegate: AddOrEditContentConfirmDelegate
  @Input() selectedItem: ListItem

  constructor() {}

  get isRootGroup(): boolean {
    return this.selectedItem.getInnerModel().children.length > 0 && Number(this.selectedItem.getInnerModel().tagGroupId) === 0;
  }

  ngOnInit(): void {}

  editTag() {
    this.eventDelegate.onAddOrEditContentSubmit(this.selectedItem.getInnerModel())
  }

  cancel() {
    this.eventDelegate.onAddOrEditContentCancel()
  }

}

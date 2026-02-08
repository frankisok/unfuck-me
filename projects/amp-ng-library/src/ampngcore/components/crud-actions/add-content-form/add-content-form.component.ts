import { Component, Input, OnInit } from '@angular/core';
import { AddOrEditContentConfirmDelegate } from '../add-edit-content-delegate';
import { Tag } from '../../../models/tag';
import { ListItem, MediaType } from '../../../core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-add-content-form',
  imports: [FormsModule],
  templateUrl: './add-content-form.component.html',
  styleUrl: './add-content-form.component.scss'
})
export class AddContentFormComponent implements OnInit {

  @Input() eventDelegate: AddOrEditContentConfirmDelegate
  @Input() mediaType: MediaType
  @Input() selectedItem: ListItem
  name: string =''

  constructor() {}

  ngOnInit(): void {}

  getGroupId() {
    let groupId

    const isNode = this.selectedItem.getDisplayText() === 'Attributes'

    if (isNode) {  // Creating a new node tag category
      groupId = BigInt(0)
      return groupId
    } else {
      groupId =  this.selectedItem.getInnerModel().id
      return groupId
    }
  }

  addTag() {
    const newTag = new Tag(
      1,
      BigInt(0),
      this.name,
      this.getGroupId(),
      this.mediaType,
      []
    )
    this.eventDelegate.onAddOrEditContentSubmit(newTag)
  }

  cancel() {
    this.eventDelegate.onAddOrEditContentCancel()
  }

}

// Added standalone clonedeep dependency from lodash.
// Reduce side effects of object references where relevant.
import cloneDeep from 'lodash';
import { Observable, Subject } from 'rxjs';
import { memo } from '../../core';

enum EDMEditState {
  IN_VIEW_MODE,
  IN_EDIT_MODE,
  VALIDATED,
  SAVE_IN_PROGRESS,
  SAVE_FAILED_OUT_OF_DATE,
  SAVE_FAILED_UNKNOWN
}

/**
 * EditModeState is a state object that represents the state of GenericEditModeController.
 * {@link GenericEditModeController}
 */
export interface EditModeState {
  saveAvailable: boolean;
  objectOutOfDate: boolean;
  saveInProgress: boolean;
  saveFailed: boolean;
  validated: boolean;
  editMode: boolean;
}

export interface EditModeController<T> {
  startEditMode(activeObject: T): void;
  saveEditMode(editedObject: T): void;
  cancelEditMode(): void;
  exitEditMode(): void;
  isInEditMode(): boolean;
  isSaveInProgress(): boolean;
  isValidated(): boolean;
  savingFailed(): boolean;
  getEditStateClassName(): string;
  isSaveAvailable(): boolean
  handleUnknownError(): void;
  handleOutOfDateError(): void;
  editModeObservable$: Observable<EditModeState>;
  editModeState: EditModeState;
}
/**
 * GenericEditModeController is a generic implementation of EditModeController.
 * 
 * - {@link EditModeController}
 * - {@link EditModeState} Please use this object to determine the state of the edit mode. rather calling the controller methods directly. when possible
 */
export class GenericEditModeController<T> implements EditModeController<T> {
  private _editMode: boolean;
  private _saveInProgress: boolean
  private _saveFailed: boolean
  private _cachedObject: T;
  private _saveAvailable: boolean
  private _objectOutOfDate: boolean
  private readonly _saveHandler: (editedObj: T) => void;
  private readonly _cancelHandler: (cachedObj: T, objectOutOfDate: boolean) => void;
  private readonly _validator: (cachedObj: T) => boolean;
  private readonly _copyHandler: () => void;
  private _editModeState: EditModeState = {
    saveAvailable: false,
    objectOutOfDate: false,
    saveInProgress: false,
    saveFailed: false,
    validated: false,
    editMode: false
  }
  private __saveInProgress: Subject<boolean> = new Subject<boolean>()
  private __isInEditMode: Subject<boolean> = new Subject<boolean>()
  saveInProgress$: Observable<boolean> = this.__saveInProgress.asObservable()
  isInEditMode$: Observable<boolean> = this.__isInEditMode.asObservable()
  private _editModeObservable: Subject<EditModeState> = new Subject<EditModeState>()
  editModeObservable$: Observable<EditModeState> = this._editModeObservable.asObservable()


  getEditStateClassName(): string {
    return (this._editMode) ? 'atmosphere-workspace--edit-mode' : '';
  }

  constructor(saveHandler, cancelHandler, copyHandler?, validator?) {
    this._editMode = false;
    this._saveInProgress = false
    this._saveFailed = false
    this._objectOutOfDate = false
    this._saveHandler = saveHandler;
    this._cancelHandler = cancelHandler;
    this._validator = validator;
    this._copyHandler = copyHandler
  }
  
  private updateEditModeState() {
    this._editModeState = {
      saveAvailable: this._saveAvailable,
      objectOutOfDate: this._objectOutOfDate,
      saveInProgress: this._saveInProgress,
      saveFailed: this._saveFailed,
      validated: this.isValidated(),
      editMode: this._editMode
    }
    this._editModeObservable.next(this._editModeState)
  }
  get editModeState(): EditModeState { 
    return this._editModeState 
  }

  startEditMode(activeObject: T): void {
    this._cachedObject = cloneDeep(activeObject);
    if (this._copyHandler) {
      this._copyHandler();
    }
    this._editMode = true;
    this._saveAvailable = true
    this._objectOutOfDate = false
    this.updateEditModeState()
  }

  isValidated(): boolean {
    return this._validator && this._validator(this._cachedObject) || !this._validator
  }

  // Test: you can simulate slow server response by adding the following
  // setTimeout(() => {this._saveHandler(editedObject)}, 10000),
  // assuming the data is validated it will block user from pressing cancel/save button again
  saveEditMode(editedObject: T): void {
    if (this._editMode) {
      if (this.isValidated()) {
        this._saveInProgress = true;
        this._saveHandler(editedObject);
        this.updateEditModeState()
        // this._disableButtons = false;
      }
    }
  }

  cancelEditMode(): void {
    if (this._editMode) {
      this._editMode = false;
      this._saveFailed = false
      this._cancelHandler(this._cachedObject, this._objectOutOfDate);
      this.updateEditModeState()
    }
  }

  exitEditMode(): void {
    console.log('exitEditMode()')
    this._editMode = false
    this._saveInProgress = false;
    this.updateEditModeState()
  }

  @memo('_editMode')
  isInEditMode(): boolean {
    console.log('isInEditMode', this._editMode)
    return this._editMode;
  }

  @memo('_saveInProgress')
  isSaveInProgress(): boolean {
    console.log('isSaveInProgress()')
    return this._saveInProgress
  }

  // enableCancel(): void {
  //     this._saveInProgress = false
  //     this._saveFailed = true
  // }

  savingFailed(): boolean {
    return this._saveFailed
  }

  handleOutOfDateError() {
    this._objectOutOfDate = true
    this._saveInProgress = false
    this._saveFailed = true
    this._saveAvailable = false
    this.updateEditModeState()
  }

  handleUnknownError() {
    console.log('Unknown error. Reset Save and Cancel.')
    this._saveInProgress = false
    this._saveFailed = true
    this._saveAvailable = true
    this.updateEditModeState()
  }

  isSaveAvailable(): boolean {
    return this._saveAvailable
  }

}



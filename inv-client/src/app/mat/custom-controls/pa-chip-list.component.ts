import { Component, OnInit, Input, OnDestroy, HostBinding, ElementRef, forwardRef, Optional, Self, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldControl, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion'

@Component({
  selector: 'pa-chip-list',
  template: `
    <div [formGroup]="form" #main>
      <mat-chip-list #chipList>
        <mat-chip
          *ngFor="let item of selectedList"
          [selectable]="selectable"
          [removable]="removable"
          (removed)="remove(item)"
          style="background: #65a2f7; color: #fff"
        >
          {{displayText(item)}}
          <mat-icon matChipRemove *ngIf="removable">cancel</mat-icon>
        </mat-chip>
        <input
          matInput
          #itemInput
          [placeholder]="placeholder"
          formControlName="itemInput"
          [matAutocomplete]="auto"
          [matChipInputFor]="chipList"
          [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
          [matChipInputAddOnBlur]="addOnBlur"
          (click)="onInputClick()"
        >
      </mat-chip-list>
      <mat-autocomplete 
        #auto="matAutocomplete" 
        (optionSelected)="onOptionSelected($event)"
      >
        <mat-option *ngFor="let item of filteredList" [value]="item">
          {{item.text}}
        </mat-option>
      </mat-autocomplete>
    </div>
  `,
  providers: [
    { provide: MatFormFieldControl, useExisting: PAChipListControl }
  ],
})
export class PAChipListControl implements OnInit, OnDestroy, MatFormFieldControl<number[]>, ControlValueAccessor {

  stateChanges = new Subject<void>()
  unselected = true;
  form: FormGroup;
  selectable = true;
  removable = true;
  addOnBlur = false;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredList: any[]
  selectedList: number[] = []
  @ViewChild('itemInput', { read: MatAutocompleteTrigger, static: false }) trigger: MatAutocompleteTrigger
  @ViewChild('main', { read: false, static: false }) main: ElementRef
  
  @Input() list: any[]

  @Input()
  get value(): number[] | null {
    return this.selectedList.length > 0 ? this.selectedList : null;
  }
  set value(value: number[] | null) {
    value = value || []
    this.selectedList = value
    if (this._onChange) this._onChange(value);
    this.stateChanges.next();
  }

  static nextId = 0;
  @HostBinding() id = `PA-chip-list-${PAChipListControl.nextId++}`;

  @Input()
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(placeholder) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }
  private _placeholder: string;

  focused = false;

  get empty() {
    return this.selectedList.length == 0
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required(): boolean {
    return this._required;
  }
  set required(required: boolean) {
    this._required = coerceBooleanProperty(required);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(disabled: boolean) {
    this._disabled = coerceBooleanProperty(disabled);
    this.setDisable();
    this.stateChanges.next();
  }
  private _disabled = false;

  controlType = 'PA-chip-list';

  @HostBinding('attr.aria-describedby') describedBy = '';
  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if (!this.disabled) {
      this._onTouched();
    }
  }

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private fb: FormBuilder,
    private fm: FocusMonitor,
    private elRef: ElementRef<HTMLElement>
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    fm.monitor(elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      itemInput: null
    });
    this.setDisable();
    
    this.form.valueChanges.subscribe(
      () => {
        const value = this.value;
        if(this._onChange) this._onChange(value);
        this.stateChanges.next()
      }
    )
    
    this.filteredList = this._filter(null)
    //console.log(this.filteredList.length, 'after calling filter')
    this.form.get('itemInput').valueChanges
      .subscribe(inputValue => {
        this.filteredList = this._filter(inputValue)
        this.stateChanges.next()
      })

    console.log(this._onTouched) 
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  writeValue(value: number[]): void {
    this.selectedList = value || []
    this.stateChanges.next()
  }

  _onChange: (_: any) => void;
  registerOnChange(fn: (_: any) => void): void {
    this._onChange = fn;
  }

  _onTouched: () => void;
  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private setDisable(): void {
    if (this.disabled && this.form) {
      this.form.disable()
    }
    else if (this.form) {
      this.form.enable()
    }
  }

  get errorState() {
    return this.ngControl.errors !== null && !!this.ngControl.touched
  }

  remove(item: any): void {
    const index = this.selectedList.indexOf(item);
    if (index >= 0) {
      this.selectedList.splice(index, 1)
    }
    this.form.get('itemInput').setValue(null)
    this.stateChanges.next()
    this.main.nativeElement.click()
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    
    this.selectedList.push(event.option.value.value);
    this.form.get('itemInput').setValue(null)
    setTimeout(() => this.trigger.openPanel(), 0)
    this.stateChanges.next()
  }

  displayText(value: any): any {
    let item = this.list.find(r => r.value == value)
    return item ? item.text : value
  }

  private _filter(value: any): any {
    //console.log(this.list.length, 'calling filter')
    if (typeof value !== 'string' || !value) {
      return this.list.filter(item => !this.selectedList.find(r => r == item.value));
    }
    const filterValue = value ? value.toLowerCase() : null
    return this.list.filter(item => item.text.toLowerCase().includes(filterValue) && !this.selectedList.find(r => r == item.value));
  }

  onInputClick() {
    if (!this.form.get('itemInput').value && this.filteredList.length == 0) {
      this.filteredList = this._filter(null)
    }
  }

}
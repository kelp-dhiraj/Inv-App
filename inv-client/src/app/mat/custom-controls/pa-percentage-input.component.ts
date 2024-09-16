import { Component, OnInit, Input, OnDestroy, HostBinding, ElementRef, Optional, Self, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, ControlValueAccessor, NgControl } from '@angular/forms';
import { MatFormFieldControl  } from '@angular/material';
import { Subject } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion'

@Component({
  selector: 'pa-percentage-input',
  template: `
    <div [formGroup]="form">
      <input
        matInput
        [placeholder]="placeholder"
        formControlName="itemInput"
        style="width: calc(100% - 40px); "
      >
      <span class="pa-percentage-sign">%</span>
      <div class="pa-percentage-up-down">
        <div class="block-arrow" (click)="onUpClick()"></div>
        <div class="block-arrow" (click)="onDownClick()"></div>
      </div>
    </div>
  `,
  styles: [
    '.pa-percentage-up-down { display: inline-block; margin-left: 4px; position: absolute; right: 5px; }',
    '.pa-percentage-up-down > div:first-child { transform: rotate(180deg); margin-bottom: 8px;}',
    '.pa-percentage-up-down > div { display: block; cursor: pointer }'
  ],
  providers: [
    { provide: MatFormFieldControl, useExisting: PAPercentageInputControl }
  ],
})
export class PAPercentageInputControl implements OnInit, OnDestroy, MatFormFieldControl<number>, ControlValueAccessor {

  stateChanges = new Subject<void>()
  unselected = true;
  form: FormGroup;
  @Output() change=new EventEmitter()


  @Input()
  get value(): number | null {
    const value = this.form.value.itemInput
    return (value && value != null && value != '') || (value == 0) ? value : null
  }
  set value(value: number | null) {
    this.form.setValue({itemInput: value}) 
    //this._processChange(value)
  }

  private _processChange(value) {
    if (this._onChange) this._onChange(value)
    if (!this.focused) this.change.emit(value)
    this.stateChanges.next()
  }

  static nextId = 0;
  @HostBinding() id = `pa-percentage-input-${PAPercentageInputControl.nextId++}`;

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
    return this.value == null
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

  controlType = 'pa-percentage-input';

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
        this._processChange(value)
      }
    )
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.elRef.nativeElement);
  }

  writeValue(value: number): void {
    if (value) this.form.setValue({itemInput: value}) 
  }

  _onChange: (_: any) => void;
  registerOnChange(fn: (_: any) => void): void {
    console.log('reg')
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

  
  onUpClick(): void {

    let value = Number(this.value || 0)
    if (isNaN(value)) return
    this.value = value + 1
    //this._processChange(value + 1)
    
  }

  onDownClick(): void {

    let value = Number(this.value || 0)
    if (isNaN(value)) return
    this.value = value - 1
    //this._processChange(value + 1)
  }

}
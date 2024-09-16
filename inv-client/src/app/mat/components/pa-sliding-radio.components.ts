import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'

@Component({
  selector: 'pa-sliding-radio',
  template: `
    <span class="pa-sliding-radio-rail" [ngStyle]="{ width: totalWidth + 'px' }" >
      <span class="pa-sliding-radio-transit-bg" [ngStyle]="{ width: width + 'px' , transform: 'translateX('+trans+'px)' }">&nbsp;</span>
      <span class="pa-sliding-radio-button" [ngStyle]="{ width: width + 'px' }" [ngClass]="buttonClass(btn)" (click)="onClick(btn)"
        *ngFor="let btn of buttons" 
      >
        <img *ngIf="btn.img" [src]="btn.img">
        {{btn.label}}
        <span class="pa-sliding-radio-button-subtitle" *ngIf="btn.subTitle" [innerHTML]="btn.subTitle"></span>
      </span>
    </span>
  `,
  styles: [
    '.pa-sliding-radio-rail { display: inline-block; padding: 3px; border-radius: 1.5em; position: relative; }',
    '.pa-sliding-radio-button { display: inline-block; padding: .75em 0px; border-radius: 2.5em; text-align: center; position: relative; cursor: pointer ; transition: color 500ms ease}',
    '.pa-sliding-radio-button.disabled { opacity: .7; cursor: not-allowed }',
    '.pa-sliding-radio-transit-bg { transition: transform 500ms ease; position: absolute; padding: .75em 0px; border-radius: 2.5em; color: #fff; left: 0px; border-radius: 2.5em; }',
    '.pa-sliding-radio-button-subtitle {position: absolute; top: 100%; margin-top: 7px; left: .5em; font-size: 11px; text-align: left; z-index: 100; right: .5em; display: inline-block}'
  ]
})

export class PASlidingRadioComponent implements OnInit {

  @Input() buttons: any[]
  @Input() value: any
  @Input() width: number = 60
  @Output() change = new EventEmitter()
  //@Input() class: string = 'default'

  totalWidth: number

  constructor() { }

  ngOnInit() {

    this.totalWidth = this.buttons.length * this.width + 6
    if (!this.value) this.value = this.buttons[0].value

  }

  buttonClass(btn: any): string {

    return btn.disabled ? 'disabled' : (this.value == btn.value ? 'active' : '')

  }

  onClick(btn: any): void {

    if (btn.disabled) return

    if (this.value == btn.value) return
    this.value = btn.value
    this.change.emit(btn.value)

  }

  get trans() {
    let btn = this.buttons.find(b => b.value == this.value)
    let index = this.buttons.indexOf(btn)

    return index * this.width + 3    
  }

}
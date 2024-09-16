import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'pa-dropdown-buttons',
  template: `
    <div class="pa-dropdown-buttons">
      <button mat-button *ngIf="selectedItem.event" (click)="onClick(selectedItem)">
        <img *ngIf="selectedItem.img" [src]="'assets/img/'+selectedItem.img" style="margin-right:10px" />
        <span>{{selected.label}}</span>
      </button>
      <span *ngIf="!selectedItem.event" (click)="onClick($event, selected.event)" >
        <img *ngIf="selected.img" [src]="'assets/img/'+selected.img" style="margin-right:10px" />
        <span>{{selected.label}}</span>
      </span>
      <button mat-button *ngIf="buttons.length > 0" [matMenuTriggerFor]="menu">
        <div class="block-arrow" ></div>
      </button>
      <span *ngIf="buttons.length > 0" class="separator"></span>
    </div>
    <mat-menu xPosition="before" #menu="matMenu" class="pa-dropdown-buttons-menu">
      <button mat-menu-item *ngFor="let button of buttons" (click)="onClick($event, button.event)">
        <img *ngIf="button.img" [src]="'assets/img/'+button.img" style="margin-right: 10px"/>
        <span>{{button.label}}</span>
      </button>
    </mat-menu>
    `,
})

export class PADropdownButtonsComponent {

  @Input() buttons: any[]
  @Input() selected: any
  @Output() buttonClick = new EventEmitter()

  constructor() { }

  onClick($event: any, event: any): void {

    //console.log(event)
    this.buttonClick.emit({...$event, event: event})

  }

  get selectedItem(): any {
    let item = { label: null, img: null, event: null }
    if (typeof this.selected === 'string') {
      item.label = this.selected
    } else if (typeof this.selected === 'object') {
      item = { ...item, ...this.selected }
    }
    return item
  }

}
import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'pa-overflow-menu',
  template: `
    <div class="pa-overflow-menu" [matMenuTriggerFor]="menu">
      <div></div><div></div><div></div>
    </div>     
    <mat-menu #menu="matMenu">
      <button mat-menu-item *ngFor="let button of buttons" (click)="onClick($event,button)">
        <img *ngIf="button.img" [src]="'assets/img/'+button.img" style="margin-right: 10px"/>
        {{button.label}}
      </button>
    </mat-menu>
    `,
  styles: [
    '.pa-overflow-menu { cursor: pointer; width: 10px; height: 24px }',
    '.pa-overflow-menu > div { width: 4px; height: 4px; border-radius: 4px; background: #ccc; margin: 3px; }'
  ]
})

export class PAOverflowMenuComponent {

  @Input() rowId: any
  @Input() buttons: any[]
  @Output() buttonClick = new EventEmitter()

  constructor() { }


  onClick($event: any, button: any) {

    this.buttonClick.emit({ ...$event, button: button, rowId: this.rowId })

  }

}
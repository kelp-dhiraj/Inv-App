import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'pa-slide-control',
  template: `
    <div style="display: flex; align-items: center; width: 70px">
      <img src="assets/img/Icons_Previous_Small_Previous_S_Primary.svg" 
        *ngIf="pageCount > 1 && currentPage > 0" 
        (click)="onPrevClick()" 
        style="margin-right: 30px;cursor: pointer"
        matTooltip="Previous"
      >
      <img src="assets/img/Icons_Previous_Small_Previous_S_Secondary.svg" 
        *ngIf="pageCount > 1 && currentPage == 0" 
        style="margin-right: 30px;cursor: not-allowed"
      >
      <img src="assets/img/Icons_Next_Small_Next_S_Primary.svg" 
        *ngIf="pageCount > 1 && currentPage < (this.pageCount - 1)" 
        (click)="onNextClick()" style="cursor: pointer"
        matTooltip="Next"
      >
      <img src="assets/img/Icons_Next_Small_Next_S_Secondary.svg" 
        *ngIf="pageCount > 1 && currentPage == (this.pageCount - 1)" 
        style="cursor: not-allowed"
      >
    </div>
    `,
})

export class PASlideControlComponent {

  @Input() pageCount: number
  @Input() currentPage: number = 0
  @Output() change = new EventEmitter()

  totalWidth: number = 206

  constructor() {}
  
  onNextClick(): void {

    this.currentPage++
    this.change.emit(this.currentPage)

  }

  onPrevClick(): void {

    this.currentPage--
    this.change.emit(this.currentPage)

  }

}
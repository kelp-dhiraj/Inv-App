import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { AdalService } from 'adal-angular4'


@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent {

  @Input() userInfo: any
  @Output() sidenavClose = new EventEmitter()

  constructor(
    private adalService: AdalService
  ) { }

  onSidenavCloseClick(): void {

    this.sidenavClose.emit()
    
  }

  logout(): void {

    this.adalService.logOut()

  }
  
}

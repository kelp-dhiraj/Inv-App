import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { AdalService } from 'adal-angular4'
import { GlobalDataService } from 'src/app/service/global-data.service'


@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent {
  @Input() userInfo: any
  @Output() sidenavToggle = new EventEmitter()
  
  constructor(
    private adalService: AdalService
  ) { }

  onToggleSidenavClick() {

    this.sidenavToggle.emit()

  }

  logout(): void {

    this.adalService.logOut()
    
  }

  initials() {
    if (!this.userInfo || !this.userInfo.full_name) return '--'
    let names = this.userInfo.full_name.split(' ').map(r=>r.charAt(0).toUpperCase())
    return names[0] + (names.length > 1 ? names[names.length - 1] : '')
  }
  
}

import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AdalService } from 'adal-angular4'

@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.css']
})
  
export class LogoutConfirmationComponent implements OnInit {

  constructor(
    private adalService: AdalService,
    private router: Router
  ) { }

  ngOnInit() {

    if (this.adalService.userInfo.authenticated) this.router.navigate(['/'])
    //setTimeout(()=>this.router.navigate(['/']), 1000)
    
  }

} 

import { Component, OnInit } from '@angular/core'
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router'
import { AdalService } from 'adal-angular4'
import { environment } from '../environments/environment'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
  
export class AppComponent implements OnInit{
  
  title = 'inv-client'
  loadingRouteConfig: boolean

  constructor(
    private adalService: AdalService, 
    private router: Router
  ) {
    adalService.init(environment.adalConfig)
  }

  ngOnInit() {

    this.adalService.handleWindowCallback(true)

    this.router.events.subscribe(event => {
      if (event instanceof RouteConfigLoadStart) {
        this.loadingRouteConfig = true
      } else if (event instanceof RouteConfigLoadEnd) {
        this.loadingRouteConfig = false
      }
    })

  }
  
}

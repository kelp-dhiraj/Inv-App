import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AdalService  } from 'adal-angular4'
import { GlobalDataService} from '../service/global-data.service'

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
  
export class MainComponent implements OnInit {

  constructor(
    private adalService: AdalService,
    public dataSvc: GlobalDataService,
    private router: Router
  ) { }

  ngOnInit() {

    if (this.adalService.userInfo.authenticated) this.dataSvc.getAuth()
    //else this.router.navigate(['/login'])
    //else setTimeout(() => this.adalService.login(), 1000)

  }

}

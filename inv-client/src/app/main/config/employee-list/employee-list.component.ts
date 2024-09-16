import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { GlobalDataService } from 'src/app/service/global-data.service'
import { CommonUIService } from 'src/app/mat/common-ui.service'
import { GenericList } from 'src/app/mat/generic-list.class'

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent extends GenericList implements OnInit {

  constructor(
    public router: Router, 
    public dataSvc: GlobalDataService, 
    public uiSvc: CommonUIService
  ) {
    super(router, dataSvc, uiSvc)
  }

  columns = [ 
    'full_name', 
    'email', 
    'sup',
    'hr',
    'is_admin'
  ]
  buttons: any = {
    edit: 'default'
  }

  mapper(row) {
    return {
      ...row,
      sup: row.sup ? row.sup.full_name : null,
      hr: row.hr ? row.hr.full_name : null
    }
  }
  
  ngOnInit() {

    //if (!this.dataSvc.userInfo || !this.dataSvc.userInfo.isAdmin) this.router.navigate(['/'])

    this.loadAPI = 'employees'
    this.editRoute = '/configs/employeeprofile'

    this.init()
  }

}

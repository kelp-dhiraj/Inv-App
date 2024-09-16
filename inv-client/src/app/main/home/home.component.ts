import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { GlobalDataService } from 'src/app/service/global-data.service'
import { MatDialog } from '@angular/material'
import { CommonUIService } from 'src/app/mat/common-ui.service'


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {  


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dataSvc: GlobalDataService,
    public uiSvc: CommonUIService,
    private dialog: MatDialog,
  ) { }

  toggleButtons: any[] = [{ label: 'PROSPECT', value: 'prospect' }, { label: 'INVESTOR', value: 'investor' }]
  toggleValue: string //= 'prospect'
  mode: string
  changeFlag: boolean = false

  onChange(data) {
    this.toggleValue = data
    if (this.changeFlag) this.uiSvc.confirmUnsaved().subscribe(result => {
        if (result) {
          this.changeFlag = false
          this.router.navigate(['/' + data])
        }
        else this.toggleValue = data == 'prospect' ? 'investor' : 'prospect'
      })
    else this.router.navigate(['/'+data])
  }

  ngOnInit() {

    this.route.paramMap.subscribe(result => {
      if (!result['params']['mode']) {
        this.router.navigate(['/prospect'])
        return
      } else {
        this.toggleValue = result['params']['mode']
        this.mode = result['params']['mode']
        this.changeFlag = false
      }
      //console.log(result)
    })
    
  }

  dataChanged($event) {
    this.changeFlag = $event
  }

  hasUnsaved() {
    return this.changeFlag
  }


}


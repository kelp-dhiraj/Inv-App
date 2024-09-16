import { Component, OnInit, ViewChild, Inject } from '@angular/core'
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, FormControl } from '@angular/forms'
import { MatTableDataSource, MatSort, MatPaginator, MatDialog} from '@angular/material'
import { Router } from '@angular/router'

import { CommonUIService } from 'src/app/mat/common-ui.service'
import { GlobalDataService } from 'src/app/service/global-data.service'
import { CommonListValueDialogComponent } from './common-list-value-dialog.component'

export interface Value {
  id: number,
  list_code: string
  lookup_code: string
  lookup_value: string
  lookup_description: string
  enabled: string
}

@Component({
  selector: 'app-common-list-value',
  templateUrl: './common-list-value.component.html',
  styleUrls: ['./common-list-value.component.css']
})
export class CommonListValueComponent implements OnInit {

  pDisplayedColumns: string[] = [ 'lookup_code', 'lookup_value','lookup_description']
  cDisplayedColumns: string[] = [ 'lookup_code', 'lookup_value','lookup_description', 'enabled','display_order']

  pDataSource = new MatTableDataSource<Value>()
  cDataSource = new MatTableDataSource<Value>()
  pSelectedId: number
  cSelectedId: number
  
  @ViewChild('pSort', {read: false, static:false}) pSort: MatSort
  @ViewChild('cSort', {read: false, static:false}) cSort: MatSort

  constructor(
    private router: Router, 
    private dataSvc: GlobalDataService, 
    private uiSvc: CommonUIService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getList()
  }

  ngAfterViewInit(): void {
    this.pDataSource.sort = this.pSort
    this.cDataSource.sort = this.cSort
  }

  private doFilterParent(value: string): void {
    this.pDataSource.filter = value.trim().toLocaleLowerCase()
    this.pSelectedId = null
    this.cDataSource.data = []
  }

  private doFilterChild(value: string): void {
    this.cDataSource.filter = value.trim().toLocaleLowerCase()
  }

  highlightParent(row: any): void {
    this.pSelectedId = this.pSelectedId == row.id ? null : row.id
    this.dataSvc.get('listbycode/'+row.lookup_code+'?show=all')
      .subscribe(result => {
        if (this.uiSvc.error(result)) return
        this.cDataSource.data = result.data as Value[]
      })
  }

  highlightChild(row: any): void {
    this.cSelectedId = this.cSelectedId == row.id ? null : row.id
  }

  toolbarActionParent(event: any ) {
    switch(event.action) {
      case 'filter': 
        this.doFilterParent(event.value)
        break
    }
  }

  toolbarActionChild(event) {
    switch(event.action) {
      case 'filter': 
        this.doFilterChild(event.value)
        break
      case 'create': 
        this.create()
        break
      case 'edit': 
        this.edit()
        break
    }
  }

  openDialog(data: any, callback: any): void {
    const dialogRef = this.dialog.open(CommonListValueDialogComponent, { width: '400px', data: data })

    dialogRef.afterClosed()
      .subscribe(data => {
        if(data) callback(data)
      })
  }

  private edit(): void {
    let dataArray = this.cDataSource.data
    const value = dataArray.find((d) => d.id == this.cSelectedId)
    const index = dataArray.indexOf(value)

    this.openDialog({
        action: 'edit',
        title: 'Edit Lookup Value',
        value: {...value}
      }, data => {
        this.dataSvc.update('commonlistvalues/'+data.value.id, data.value)
          .subscribe(result => {
            if (this.uiSvc.error(result)) return
            this.uiSvc.flashSuccess(result.messages.join(','))
            dataArray.splice(index,1,data.value)
            this.cDataSource.data = [...dataArray]
            if (data.value.list_code == 'LIST_CODES') this.getList()
          })
      }
    )
  }

  private create(): void {

    if (!this.pSelectedId) {
      this.uiSvc.flashError('Please select a list first')
      return
    }
    const data = this.pDataSource.data.find(d => d.id == this.pSelectedId)
    const value = { id: null, list_code: data.lookup_code, lookup_code: '', lookup_value: '', lookup_description: '', enabled: true, display_order: '' }

    this.openDialog({
        action: 'create',
        title: 'Create Lookup Value',
        value: value
      }, data => {
        this.dataSvc.create('commonlistvalues', data.value)
          .subscribe(result => {
              if (this.uiSvc.error(result)) return
              this.uiSvc.flashSuccess(result.messages.join(','))
              data.value.id = result.data.id
              this.cDataSource.data = [...this.cDataSource.data, data.value]
              if (data.value.list_code == 'LIST_CODES') this.getList()
          })
      }
    )
  }

  private getList(): void {
    
    this.dataSvc.get('listcodes?show=all')
      .subscribe(result => {
            if (this.uiSvc.error(result)) return
            this.pDataSource.data = result.data as Value[]
      })
  }
}

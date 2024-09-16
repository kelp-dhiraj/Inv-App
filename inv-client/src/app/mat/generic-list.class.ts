import { ViewChild } from '@angular/core'
import { MatTableDataSource, MatSort, MatPaginator} from '@angular/material'
import { Router } from '@angular/router'

import { GlobalDataService } from 'src/app/service/global-data.service'
import { CommonUIService } from './common-ui.service'

export class GenericList {
  
  constructor(
    public router: Router,
    public dataSvc: GlobalDataService, 
    public uiSvc: CommonUIService
  ) { }

  columns: string[] = []
  buttons: any = {
    create: 'default', 
    edit: 'default', 
    delete: 'default',
  }
  dataSource = new MatTableDataSource<any>()
  selectedId: number
  loadAPI: string
  deleteAPI: string
  createRoute: string
  editRoute: string

  @ViewChild(MatSort, {read: false, static:false}) sort: MatSort
  @ViewChild(MatPaginator, {read: false, static:false}) paginator: MatPaginator

  init(): void {

    this.getList()

  }


  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort
    this.dataSource.paginator = this.paginator
  }

  public doFilter(value: string) {
    console.log(value)
    this.dataSource.filter = value.trim().toLocaleLowerCase()
  }

  highlight(row) {
    //this.selectedId = this.selectedId == row.id ? null : row.id
    this.selectedId = row.id
  }

  toolbarAction(event) {
    switch(event.action) {
      case 'filter': 
        this.doFilter(event.value)
        break
      case 'create': 
        this.router.navigate([this.createRoute, 'create'])
        break
      case 'edit': 
        console.log([this.editRoute, this.selectedId, 'edit'])
        this.router.navigate([this.editRoute, this.selectedId, 'edit'])
        break
      case 'delete': 
        this.delete(this.selectedId)
        break
      case 'export': 
        this.export()
        break
    }
  }
  
  mapper(row: any): any {
    return row
  }

  export() {
    
  }

  getList() {
    this.dataSvc.get(this.loadAPI)
      .subscribe(result => {
        if (this.uiSvc.error(result)) return
        this.dataSource.data = result.data.map(this.mapper)
      })
  }

  delete(id) {
    this.uiSvc.confirm(
      { title: "Delete", message: "Are you sure you want to delete this record?" }, 
      (result) => {
        if (!result) return
        this.dataSvc.delete(this.deleteAPI+'/'+id)
        .subscribe(result => {
          if (this.uiSvc.error(result)) return
          this.uiSvc.flashSuccess(result.messages.join(', '))
          this.dataSource.data = this.dataSource.data.filter(i => i.id !== id)
        })
      }
    )
  }

}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router'

import { GlobalDataService } from 'src/app/service/global-data.service'
import { CommonUIService } from 'src/app/mat/common-ui.service'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { formatDate, formatNumber } from '@angular/common'

@Component({
  selector: 'app-generic-report',
  templateUrl: './generic-report.component.html',
  styleUrls: ['./generic-report.component.css']
})
export class GenericReportComponent implements OnInit {

  constructor(
    public router: Router, 
    public dataSvc: GlobalDataService, 
    public uiSvc: CommonUIService,
    public route: ActivatedRoute
  ) {
  }

  reportDetails: any = {
    title: '',
    description: '',
    dataExport: true
  }

  defaultFormats: any = {
    date: 'y/MM/dd',
    number: '1.0'
  }
  
  formatter: any = {
    date: (v, f) => formatDate(v, f, 'en_GB'),
    number: (v, f) => formatNumber(v, 'en_GB', f),
    text: (v, f) => v,
    boolean: (v, f) => v ? 'Y' : 'N'
  }

  columnDefs = {}
  columns = []
  exportColumns = []
  idCounter: number = 1


  get buttons(): any {
    return this.reportDetails.dataExport ? {
      export: { label: ' Export', event: 'export', currentRecord: false, icon: 'cloud_download' },
    } : {}
  }
  ngOnInit() {
    
    this.loadAPI = this.route.snapshot.params.name
    this.init()

  }

  dataSource = new MatTableDataSource<any>()
  selectedId: number
  loadAPI: string
  rowsPerPage: number = 10

  @ViewChild('reportTable', {static: true}) reportTable: ElementRef
  @ViewChild(MatSort, {static: true}) sort: MatSort
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator

  init(): void {

    this.getList()

    this.router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    }

  }

  ngAfterViewInit(): void {

    this.dataSource.sort = this.sort
    this.dataSource.paginator = this.paginator

    let rpp = (this.reportTable.nativeElement.offsetHeight - 56 ) / 50
    this.rowsPerPage = rpp < 15 ? 10 : (rpp < 20 ? 15 : 20)
  }

  public doFilter(value: string) {

    this.dataSource.filter = value.trim().toLocaleLowerCase()

  }

  click(row) {
    console.log(row)
    this.selectedId = row.id

  }

  highlight(row) {
    return row.id ? this.selectedId == row.id : false
  }

  toolbarAction(event) {

    switch(event.action) {
      case 'filter': 
        this.doFilter(event.value)
        break
      case 'export': 
        this.export()
        break
    }

  }

  getList() {
    
    this.dataSvc.get(this.loadAPI)
      .subscribe(result => {
        if (this.uiSvc.error(result)) return

        this.setupColumns(result.data.metaData)
        this.reportDetails = result.data.reportLevelMetaData
        setTimeout(() => {
          this.dataSource.data = result.data.reportData.map(r => r.id ? r : {...r, id: this.idCounter++})
        }, 1000)
      })
    
  }

  setupColumns(metadata) {

    metadata.forEach(m => {
      this.exportColumns.push(m.key)
      if (!(m.display == 'N')) this.columns.push(m.key)
      m.format = m.format ? m.format : this.defaultFormats[m.type]
      this.columnDefs[m.key] = m
    })
    
  }

  export() {

    let data = this.dataSource.data.map(r => this.exportColumns.map(c => this.formatter[this.columnDefs[c]['type']](r[c], this.columnDefs[c]['format'])))
    data.splice(0, 0, this.exportColumns.map(c => this.columnDefs[c]['name']))
    
    let str = data.map(row => row.map(column => '"' + column ? column : '' + '"').join(","))
      .reduce((concatString, curString) => concatString + "\n" + curString)
    
    let link = document.createElement('a')
    link.setAttribute('download','export.csv')
    link.setAttribute('href', 'data:text/plain;base64,' + this.encodeToBase64(str))
    document.body.appendChild(link)
    link.click()
    link.remove()

  }

  encodeToBase64(input) {
    let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
    let output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0
    input = this._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++)
      chr2 = input.charCodeAt(i++)
      chr3 = input.charCodeAt(i++)
      enc1 = chr1 >> 2
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
      enc4 = chr3 & 63
      if (isNaN(chr2)) enc3 = enc4 = 64
      else if (isNaN(chr3)) enc4 = 64
      output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4)
    } 
    return output
  } 
  _utf8_encode(string) {
    var utftext = ""
    string = string.replace(/\r\n/g, "\n");
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n)
      if (c < 128) utftext += String.fromCharCode(c)
      else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192)
          utftext += String.fromCharCode((c & 63) | 128)
      } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  } 

}

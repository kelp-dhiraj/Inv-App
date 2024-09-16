import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { GlobalDataService } from 'src/app/service/global-data.service'
import { MatDialog, MatTableDataSource } from '@angular/material'
import { CommonUIService } from 'src/app/mat/common-ui.service'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {  


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public dataSvc: GlobalDataService,
    public uiSvc: CommonUIService,
    private dialog: MatDialog,
  ) { }

  toggleButtons: any[] = [{ label: 'PROSPECT', value: 'prospect' }, { label: 'INVESTOR', value: 'investor' }]
  toggleValue: string //= 'prospect'
  allFlag: string = 'Y'
  today = new Date()

  onChange(data = null) {
    if (data) {
      this.toggleValue = data
      this.router.navigate(['/dashboard/'+data])
    } else this.getData()
  }



  loaded: boolean = false
  sor: any = null
  eip: any = null
  al: any = null
  cl: any = null
  pu: any = null
  iq: any = null
  qp: any = null
  ibf: any = null
  ibs: any = null

  ngOnInit() {
    this.route.paramMap.subscribe(result => {
      if (!result['params']['mode']) {
        this.router.navigate(['/dashboard/prospect'])
        return
      } else {
        this.toggleValue = result['params']['mode']
      }
      this.getData()
    })    
  }

  getData() {
    let api = this.toggleValue == 'investor' ? 'existinginvestorsdashboard' : 'prospectsdashboard'
    this.loaded = false
    this.sor = null
    this.eip = null
    this.al = null
    this.cl = null
    this.pu = null
    this.iq = null
    this.qp = null
    this.ibf = null
    this.ibs = null
    this.dataSvc.get(api + '?all_flag=' + this.allFlag).subscribe(result => {
      if (this.toggleValue == 'investor') {

        this.sor = { ...result.data.strength_of_rel, data: {}, cols: [], colLabels: {}, mergedCols: [], mergedColLabels: {}, mergedColSpans: {}, avgCols: [], avgColSpans: {} }
        let mergedColsCounter = 0
        this.sor.dataSource = new MatTableDataSource<any>()
        this.sor.data = this.sor.row_keys_array.map(r => { return { rowKey: r } })
        this.sor.avgData = {}
        this.sor.sub_table_keys.forEach((k, i) => {
          let mc = 'mc' + mergedColsCounter++
          this.sor.mergedCols.push(mc)
          this.sor.mergedCols.push(mc + '__plus')
          this.sor.mergedColLabels[mc] = this.sor.table_heading_array[i].label
          this.sor.mergedColSpans[mc] = this.sor.table_heading_array[i].headerCols.length
          this.sor.mergedColSpans[mc + '__plus'] = 1
          this.sor.mergedColLabels[mc + '__plus'] = ''
          this.sor.table_heading_array[i].headerCols.forEach(c => {
            let col = k + '__' + c.refKey
            this.sor.cols.push(col)
            this.sor.colLabels[col] = c.label
            Object.keys(this.sor.data_obj[k]).forEach(rk => {
              let data = this.sor.data.find(d => d.rowKey == rk)
              if (data) data[col] = this.sor.data_obj[k][rk][c.refKey]
            })
          })
          this.sor.cols.push(k + '__plus')
          this.sor.colLabels[k + '__plus'] = ''
          
          if (i == 0) {
            this.sor.avgCols.push(k + '__avglabel')
            this.sor.avgColSpans[k + '__avglabel'] = this.sor.table_heading_array[i].headerCols.length
            this.sor.avgData[k + '__avglabel'] = result.data.avg_rel_score.label
          } else {
            this.sor.avgCols.push(k + '__avgfill')
            this.sor.avgColSpans[k + '__avgfill'] = this.sor.table_heading_array[i].headerCols.length
            this.sor.avgData[k + '__avgfill'] = ''
            this.sor.avgCols.push(k + '__avg')
            this.sor.avgColSpans[k + '__avg'] = 1
            this.sor.avgData[k + '__avg'] = result.data.avg_rel_score[k] ? result.data.avg_rel_score[k].avg_rel_score : ''
          }
          
        })
        this.sor.dataSource.data = this.sor.data
        
        this.eip = this.prepareData(result.data.existing_inv_pipeline, 'eip')
      }
      if (this.toggleValue == 'prospect') {
        this.pu = this.prepareData(result.data.prospect_universe, 'pu')
        this.iq = this.prepareData(result.data.investor_qualification, 'pu')
        this.qp = this.prepareData(result.data.qualified_pipeline, 'qp')
        this.ibf = this.prepareData(result.data.investors_by_fund, 'ibf')
        this.ibs = this.prepareData(result.data.investors_by_stage, 'ibs')
        
      }

      this.al = this.prepareData(result.data.activity_levels, 'al')
      this.cl = this.prepareData(result.data.coverage_levels, 'cl')


      this.loaded = true
    })
  }

  prepareData(tblData, prefix) {
    let object = { ...tblData, cols: [], colLabels: {} }
    object.dataSource = new MatTableDataSource<any>()
    object.data = object.row_keys_array.map(r => { return { rowKey: r } })
    object.table_heading_array.forEach(c => {
      object.cols.push(prefix + '__' + c.position)
      object.colLabels[prefix + '__' + c.position] = c.label
      Object.keys(object.data_obj).forEach(rk => {
        let data = object.data.find(d => d.rowKey == rk)
        if (data) data[prefix + '__' + c.position] = object.data_obj[rk][c.position]
      })
    })
    object.dataSource.data = object.data
    return object
  }

  get sorDataColumns(): string {
    return this.sor.cols.filter(c => c.indexOf('__plus') < 0)
  }
  get sorPlusColumns(): string {
    return this.sor.cols.filter(c => c.indexOf('__plus') >= 0)
  }

  className(mc) {
    if (mc.indexOf('__plus') >= 0) return 'sor-plus'
    else if (mc.indexOf('__avg') >= 0) return 'sor-'+mc.split('__')[1]
  }


  total(tbl, col) {
    const tblObjMap = {
      eip: this.eip,
      al: this.al,
      cl: this.cl,
      pu: this.pu,
      iq: this.iq,
      qp: this.qp,
      ibf: this.ibf,
      ibs: this.ibs
    }
    if (tbl == 'sor') {
      if (col.split('__')[0] == 'column1') return 'Total'
      else if(col.split('__')[1] == '2') return null
      else {
        return this.sor.data.reduce((t, c) => t + (c[col] ? Number(c[col]) : null), 0)
      } 
    }
    else {
      if(col.split('__')[1] == '0') return 'Total'
      else {
        let obj = tblObjMap[tbl]
        return obj.data.reduce((t, c) => {
          let per = (c[col] ? (c[col]+'').indexOf('%')>=0 : false) || ((t+'').indexOf('%') >= 0)
          return (Number((t+'').replace('%', '')) + (c[col] ? Number((c[col] + '').replace('%', '')) : null))+(per ? '%' : '')
        }, 0)
      } 
    }
    return null
  }
}


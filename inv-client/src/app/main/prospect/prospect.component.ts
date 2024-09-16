import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalDataService } from 'src/app/service/global-data.service';
import { Observable } from 'rxjs';
import { CommonUIService } from 'src/app/mat/common-ui.service';
import { MatTableDataSource } from '@angular/material';


@Component({
  selector: 'app-prospect',
  templateUrl: './prospect.component.html',
  styleUrls: ['./prospect.component.scss']
})
export class ProspectComponent implements OnInit {

  constructor(private dataSvc: GlobalDataService, private uiSvc: CommonUIService) { }
  prospectId: number
  stageCode: string
  prospectNames: any[]
  filteredProspectNames: any[]
  stages$: Observable<any[]>
  priorityCodes$: Observable<any[]>
  categoryCodes$: Observable<any[]>
  fundRaiseStageCodes$: Observable<any[]>
  indiaAllocCodes$: Observable<any[]>
  strategicIndiaAlignCodes$: Observable<any[]>
  tnTrackRecordBiasCodes$: Observable<any[]>
  seniorAdvocateCodes$: Observable<any[]>
  positiveNegativeSurpriseCodes$: Observable<any[]>
  interactionTypeCodes$: Observable<any[]>
  interactionTypeValues: any[]
  prospect: any = null
  interactionComment: string
  interactionTypeCode: string
  fundRaiseStage: string
  fundRaiseComment: string
  interactionSummary: any 
  interactionDataSource = new MatTableDataSource<any>()
  interactionColumns = ['int_type', 'interaction_date', 'comments']
  showAllFlag: boolean = false
  prospectChangedFlag: boolean = false
  interactionChangedFlag: boolean = false
  dataChanged() {
    console.log('data changed')
    this.prospectChangedFlag = true
    this.change.emit(true)
  }
  dataChangedInteraction() {
    this.interactionChangedFlag = true
    this.change.emit(true)
  }
  @Output() change = new EventEmitter()

  ngOnInit() {
    this.dataSvc.get('prospectnames')
      .subscribe(result => {
        this.prospectNames = result.data
        this.filteredProspectNames = this.prospectNames
      })
    
    this.stages$ = this.dataSvc.getList('ASSESSMENT_STAGE_CODES')
    this.priorityCodes$ = this.dataSvc.getList('PRIORITY_CODES')
    this.categoryCodes$ = this.dataSvc.getList('CATEGORY_CODES')
    this.fundRaiseStageCodes$ = this.dataSvc.getList('FUND_RAISE_STAGE_CODES')
    this.indiaAllocCodes$ = this.dataSvc.getList('INDIA_ALLOC_CODES')
    this.strategicIndiaAlignCodes$ = this.dataSvc.getList('STRATEGIC_INDIA_ALIGN_CODES')
    this.tnTrackRecordBiasCodes$ = this.dataSvc.getList('TN_TRACK_RECORD_BIAS_CODES')
    this.seniorAdvocateCodes$ = this.dataSvc.getList('SENIOR_ADVOCATE_CODES')
    this.positiveNegativeSurpriseCodes$ = this.dataSvc.getList('POSITIVE_NEGATIVE_SURPRISE_CODES')
    this.interactionTypeCodes$ = this.dataSvc.getList('INTERACTION_TYPE_CODES')
    this.interactionTypeCodes$.subscribe(result => {
      this.interactionTypeValues = result
    })
  }

  filterProspectNames() {
    if (!this.prospectId) this.filteredProspectNames = this.prospectNames
    else this.filteredProspectNames = this.prospectNames.filter(r => r.prospect_name.toLowerCase().includes((this.prospectId+'').toLowerCase()))
  }

  prospectNameDisplayFn(value: any): string {

    if (!this.prospectNames) return ''
    let disVal = this.prospectNames.find(p => p.id == value)
    return  disVal? disVal.prospect_name: ''
  }

  prospectNameChange() {
    
  }

  get selectedNameDetails(): string {
    if (!this.prospectNames) return null
    let val = this.prospectNames.find(r => r.id == this.prospectId)
    return val ? val.primary_office_city + '-' + val.region : null
  }

  showAllClick() {
    this.showAllFlag = !this.showAllFlag
    this.interactionDataSource.data = this.prospect.interactions.slice(0, this.showAllFlag ? this.prospect.interactions.length : 3)
  }
  

  getData() {
    if (!this.selectedNameDetails) return

    if (this.prospectChangedFlag || this.interactionChangedFlag) {
      this.uiSvc.confirmUnsaved().subscribe(result => {
        if (result) 
          this.getDataFromServer()
      })
    } else this.getDataFromServer()
  }

  getDataFromServer() {
    this.dataSvc.get('prospects/' + this.prospectId)
    .subscribe(result => {
      console.log(result)
      this.prospect = result.data
      console.log(this.stageCode)
      this.interactionChangedFlag = false
      this.prospectChangedFlag = false
      this.updateInteractionData()
    })
  }

  get prospectLikelihoodScore(): number {
    if (!this.prospect) return null
    return Number(this.prospect.india_allocation_code) + Number(this.prospect.strategic_india_alignment_code) + Number(this.prospect.senior_advocate_code) +
    Number(this.prospect.positive_negative_surprise_code) + Number(this.prospect.tn_track_record_bias_code)
    
  }

  saveProspect() {

    this.dataSvc.update('prospects/' + this.prospectId, this.prospect)
      .subscribe(result => {
        if (this.uiSvc.error(result)) return
        this.uiSvc.flashSuccess(result.messages)
        this.prospectChangedFlag = false

        this.change.emit(this.prospectChangedFlag || this.interactionChangedFlag)
      })
    
  }

  saveInteraction() {
    this.dataSvc.create('prospects/' + this.prospectId + '/interactions', {
      interaction_type_code: this.interactionTypeCode, comments: this.interactionComment
    }).subscribe(result => {
      if (this.uiSvc.error(result)) return
      this.uiSvc.flashSuccess(result.messages)
      this.prospect.interactions.splice(0,0,result.data)
      console.log(this.prospect.interactions)
      this.interactionChangedFlag = false
      this.interactionTypeCode = null
      this.interactionComment = null
      this.change.emit(this.prospectChangedFlag || this.interactionChangedFlag)
      this.updateInteractionData()
    })
  }

  updateInteractionData() {
    this.interactionSummary = { IR: [], DT: [] }
    Object.keys(this.interactionSummary).map(teamCode => {
      this.interactionTypeValues
        .filter(r => r.lookup_code.substring(0, 2) == teamCode)
        .map(r => {
          this.interactionSummary[teamCode].push({
            label: r.lookup_value,
            value: this.prospect.interactions.filter(l => l.interaction_type_code == r.lookup_code).length
          })
        })
    })
    this.interactionDataSource.data = this.prospect.interactions.slice(0, this.showAllFlag ? this.prospect.interactions.length : 3)
  }

}

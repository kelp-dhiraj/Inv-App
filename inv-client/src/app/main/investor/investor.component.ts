import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GlobalDataService } from 'src/app/service/global-data.service';
import { Observable } from 'rxjs';
import { CommonUIService } from 'src/app/mat/common-ui.service';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-investor',
  templateUrl: './investor.component.html',
  styleUrls: ['./investor.component.scss']
})
export class InvestorComponent implements OnInit {

  constructor(private dataSvc: GlobalDataService, private uiSvc: CommonUIService) { }
  investorId: number
  //stageCode: string
  investorNames: any[]
  filteredInvestorNames: any[]
  fundCodes$: Observable<any[]>
  fundRaiseStageCodes$: Observable<any[]>
  shareOfWalletCodes$: Observable<any[]>
  investmentPerformanceCodes$: Observable<any[]>
  workingLevelSupportCodes$: Observable<any[]>
  seniorLevelConnectCodes$: Observable<any[]>
  //subjectiveFactorCodes$: Observable<any[]>
  interactionTypeCodes$: Observable<any[]>
  stageCodes: any = {}
  interactionTypeValues: any[]
  investor: any = null
  interactionComment: string
  interactionTypeCode: string
  interactionSummary: any 
  interactionDataSource = new MatTableDataSource<any>()
  interactionColumns = ['int_type', 'interaction_date', 'comments']
  showAllFlag: boolean = false
  investorChangedFlag: boolean = false
  interactionChangedFlag: boolean = false
  dataChanged() {
    console.log('data changed')
    this.investorChangedFlag = true
    this.change.emit(true)
  }
  dataChangedInteraction() {
    this.interactionChangedFlag = true
    this.change.emit(true)
  }
  @Output() change = new EventEmitter()

  ngOnInit() {
    this.dataSvc.get('existinginvestornames')
      .subscribe(result => {
        this.investorNames = result.data
        this.filteredInvestorNames = this.investorNames
      })
    
    this.fundCodes$ = this.dataSvc.getList('FUND_CODES')
    this.fundRaiseStageCodes$ = this.dataSvc.getList('FUND_RAISE_STAGE_CODES')
    this.shareOfWalletCodes$ = this.dataSvc.getList('SHARE_OF_WALLET_CODES')
    this.investmentPerformanceCodes$ = this.dataSvc.getList('INVESTMENT_PERFORMANCE_CODES')
    this.workingLevelSupportCodes$ = this.dataSvc.getList('WORKING_LEVEL_SUPPORT_CODES')
    this.seniorLevelConnectCodes$ = this.dataSvc.getList('SENIOR_LEVEL_CONNECT_CODES')
   // this.subjectiveFactorCodes$ = this.dataSvc.getList('SUBJECTIVE_FACTOR_CODES')
    this.interactionTypeCodes$ = this.dataSvc.getList('INTERACTION_TYPE_CODES')
    this.interactionTypeCodes$.subscribe(result => {
      this.interactionTypeValues = result
    })
    this.dataSvc.getList('STAGE_CODES').subscribe(result => result.map(r => this.stageCodes[r.lookup_code] = r.lookup_value))

  }

  filterInvestorNames() {
    if (!this.investorId) this.filteredInvestorNames = this.investorNames
    else this.filteredInvestorNames = this.investorNames.filter(r => r.investor_name.toLowerCase().includes((this.investorId+'').toLowerCase()))
  }

  investorNameDisplayFn(value: any): string {

    if (!this.investorNames) return ''
    let disVal = this.investorNames.find(p => p.id == value)
    return  disVal? disVal.investor_name: ''
  }

  investorNameChange() {
    
  }

  get selectedNameDetails(): string {
    if (!this.investorNames) return null
    let val = this.investorNames.find(r => r.id == this.investorId)
    return val ? val.primary_office_city + '-' + val.region : null
  }

  showAllClick() {
    this.showAllFlag = !this.showAllFlag
    this.interactionDataSource.data = this.investor.interactions.slice(0, this.showAllFlag ? this.investor.interactions.length : 3)
  }
  
  getData() {
    if (!this.selectedNameDetails) return

    if (this.investorChangedFlag || this.interactionChangedFlag) {
      this.uiSvc.confirmUnsaved().subscribe(result => {
        if (result) 
          this.getDataFromServer()
      })
    } else this.getDataFromServer()
  }

  getDataFromServer() {
    this.dataSvc.get('existinginvestors/' + this.investorId)
    .subscribe(result => {
      this.investor = result.data
      this.interactionChangedFlag = false
      this.investorChangedFlag = false
      this.updateInteractionData()
    })

  }

  get investorRelationshipScore(): number {
    let i = this.investor
    if (!i|| !i.share_of_wallet_code || !i.investment_performance_code || !i.working_level_support_code || !i.senior_level_connect_code /*|| !i.subjective_factor_code*/) return null
    let score = Number(i.share_of_wallet_code) + Number(i.investment_performance_code) + Number(i.working_level_support_code) + Number(i.senior_level_connect_code)/* + Number(i.subjective_factor_code)*/

    return score
  }

  get investorStageCode(): string {
    return this.investorRelationshipScore ? this.stageCodes[this.investorRelationshipScore] : null
  }

  saveInvestor() {

    this.dataSvc.update('existinginvestors/' + this.investorId, { ...this.investor, stage_code: this.investorRelationshipScore })
      .subscribe(result => {
        if (this.uiSvc.error(result)) return
        this.uiSvc.flashSuccess(result.messages)
        
        this.investorChangedFlag = false

        this.change.emit(this.investorChangedFlag || this.interactionChangedFlag)
      })
    
  }

  saveInteraction() {
    this.dataSvc.create('existinginvestors/' + this.investorId + '/interactions', {
      interaction_type_code: this.interactionTypeCode, comments: this.interactionComment
    }).subscribe(result => {
      if (this.uiSvc.error(result)) return
      this.uiSvc.flashSuccess(result.messages)
      this.investor.interactions.splice(0,0,result.data)
      console.log(this.investor.interactions)
      this.interactionChangedFlag = false
      this.interactionTypeCode = null
      this.interactionComment = null
      this.change.emit(this.investorChangedFlag || this.interactionChangedFlag)
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
            value: this.investor.interactions.filter(l => l.interaction_type_code == r.lookup_code).length
          })
        })
    })
    this.interactionDataSource.data = this.investor.interactions.slice(0, this.showAllFlag ? this.investor.interactions.length : 3)
  }

}

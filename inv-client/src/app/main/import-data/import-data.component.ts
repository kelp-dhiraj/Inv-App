import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router'

import { GlobalDataService } from 'src/app/service/global-data.service'
import { CommonUIService } from 'src/app/mat/common-ui.service'
import { GenericList } from 'src/app/mat/generic-list.class'


@Component({
  selector: 'app-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss']
})

export class ImportDataComponent extends GenericList implements OnInit {

  constructor(
    public router: Router, 
    public dataSvc: GlobalDataService, 
    public uiSvc: CommonUIService
  ) {
    super(router, dataSvc, uiSvc)
  }

  columns = [
    'id',
    'email',
    'full_name', 
  ]

  headings = {
    'id': 'Employee Id',
    'email': 'Email',
    'full_name': 'Employee Name'
  }

  buttons: any = {
    pros_upload: { label: ' Prospect Upload', event: 'pros_upload', currentRecord: false, icon: 'cloud_upload' },
    inv_upload: { label: ' Investor Upload', event: 'inv_upload', currentRecord: false, icon: 'cloud_upload' },
    pros_template: { label: ' Prospect Template', event: 'pros_template', currentRecord: false, icon: 'cloud_download' },
    inv_template: { label: ' Investor Template', event: 'inv_template', currentRecord: false, icon: 'cloud_download' },

  }

  rejectedFileId: number
  errorFileId: number
  successFileId: number
  showUploadResult: boolean = false
  
  mapper(row: any): any {
    
    return { ...row, id: row.id }
  }

  ngOnInit() {
   // this.loadAPI = this.deleteAPI = 'useremployee'
   // this.createRoute = this.editRoute = 'employees'

    //this.init()
  }

  toolbarAction(event) {
    super.toolbarAction(event)

    switch(event.action) {
      case 'pros_upload': 
        this.doUpload()
        break
      case 'inv_upload': 
        this.doUploadInv()
        break
      case 'pros_template':
        this.downloadprosTemplate()
      case 'inv_template':
        this.downloadinvTemplate()
    }
  }

  doUpload() {

    this.rejectedFileId = null
    this.errorFileId = null
    this.successFileId = null
    this.showUploadResult = false
    this.uiSvc.fileUploadDialog(this.uploadCallback.bind(this), false)
  }


  doUploadInv() {

    this.rejectedFileId = null
    this.errorFileId = null
    this.successFileId = null
    this.showUploadResult = false
    this.uiSvc.fileUploadDialog(this.uploadCallbackInv.bind(this), false)
  }

  uploadCallback(files) {
    if (!files || files.length == 0) return

    console.log(files)
    
    this.dataSvc.create('prospectfile', { file_id: files[0].dbRecordId })
      .subscribe(result => {

        if (this.uiSvc.error(result)) return
        
        this.rejectedFileId = result.data.files.rejectedDataFileId
        this.errorFileId = result.data.files.errorDataFileId
        this.successFileId = result.data.files.successDataFileId
        this.showUploadResult = true
        

      })
  }


  uploadCallbackInv(files) {
    if (!files || files.length == 0) return

    console.log(files)
    
    this.dataSvc.create('existinginvestorfile', { file_id: files[0].dbRecordId })
      .subscribe(result => {

        if (this.uiSvc.error(result)) return
        
        this.rejectedFileId = result.data.files.rejectedDataFileId
        this.errorFileId = result.data.files.errorDataFileId
        this.successFileId = result.data.files.successDataFileId
        this.showUploadResult = true
        

      })
  }

  downloadprosTemplate() {
    window.open('assets/ProspectTemplate.csv')
  }

  downloadinvTemplate() {
    window.open('assets/InvestorTemplate.csv')
  }
}
import { Component, ViewChild, Inject, ElementRef } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'
import { GlobalDataService } from '../../service/global-data.service'

export interface UploadDialogData {
  multi: boolean
}

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.css'],
})

export class UploadDialogComponent {

  @ViewChild('file', { static: false }) file: ElementRef

  public files: Set<File> = new Set()
  fileCounter: number = 0
  statusList: any
  uploadStatus: any = {}
  canBeClosed: boolean = true
  primaryButtonText = 'Start Upload'
  showCancelButton: boolean = true
  uploading: boolean = false
  uploadSuccessful: boolean = false
  labels: any = {}

  constructor(
    private dataSvc: GlobalDataService,
    public dialogRef: MatDialogRef<UploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData
  ) {

    this.labels = {
      title: this.data.multi ? 'Upload Files' : 'Upload File',
      addButton: this.data.multi ? 'Select Files' : 'Select File',
      tableHeaderFiles: this.data.multi ? 'Selected Files' : 'Selected File',
      noFilesMessage: this.data.multi ? 'No Files Selected. Select files to upload' : 'No File Selected. Select a file to upload',
    }

  }

  addFiles(): void {

    this.file.nativeElement.click()

  }

  addFilesDisabled(): boolean {

    return this.uploading || this.uploadSuccessful || (!this.data.multi && this.files.size > 0)

  }

  onFilesAdded(): void {

    const files: { [key: string]: File } = this.file.nativeElement.files
    for (let key in files) {
      if (!isNaN(parseInt(key))) {
        files[key]['index'] = this.fileCounter++
        this.files.add(files[key])
      }
    }

  }

  closeDialog(): void {

    if (this.uploadSuccessful || this.files.size == 0) {
      return this.dialogRef.close(this.uploadStatus)
    }

    this.uploading = true
    this.statusList = this.dataSvc.upload(this.files)

    for (let key in this.statusList) {
      this.statusList[key].progress$.subscribe(result => {
        this.uploadStatus[key] = result
        if (result.status == 'complete') this.statusList[key].isComplete = true
        this.processComplete()
      })
    }
    this.primaryButtonText = 'Finish'
    this.canBeClosed = false
    this.dialogRef.disableClose = true
    this.showCancelButton = false

  }

  KB(size: number): number {

    return Math.round(size / 1024)

  }

  cancelUpload(file: any): void {

    if (!this.uploading && !this.uploadSuccessful) {
      this.files.delete(file)
      return
    }
    this.statusList[file['index']].subscription.unsubscribe()
    this.statusList[file['index']].isComplete = true
    delete this.statusList[file['index']]
    delete this.uploadStatus[file['index']]
    this.files.delete(file)
    this.processComplete()

  }

  processComplete(): void {

    let isComplete = true
    for (let key in this.statusList) {
      if (!this.statusList[key].isComplete) isComplete = false
    }
    if (isComplete) {
      this.canBeClosed = true
      this.dialogRef.disableClose = false
      this.uploadSuccessful = true
      this.uploading = false
    }

  }

}
import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

export interface ConfirmDialogData {
  title: string
  message: string
  noLabel: string
  yesLabel: string
  default: string,
  feedback?: {
    required: boolean,
    label: string,
    placeholder: string,
    max: number
  }
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})

export class ConfirmDialogComponent {

  feedback: string
  
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { 
    
    data.title = data.title || 'Confirm?'
    data.message = data.message || 'Are you sure you want to perform this action'
    data.noLabel = data.noLabel || 'No'
    data.yesLabel = data.yesLabel || 'Yes'
    data.default = data.default || 'No'

  }
  
  onNoClick(): void {
    this.dialogRef.close()
  }
}

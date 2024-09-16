import { Component, Inject } from '@angular/core'
import { Router } from '@angular/router'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'

export interface SuccessDialogData {
  mode: string,
  message?: string,
  nextRoute?: string[],
  homePageRoute?: string[],
}

@Component({
  selector: 'app-success-dialog',
  templateUrl: './success-dialog.component.html',
  styleUrls: ['./success-dialog.component.css']
})

export class SuccessDialogComponent {
  
  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SuccessDialogData
  ) { 
    dialogRef.disableClose = true;
  }

  onOkClick() {

    this.dialogRef.close()

  }

  onNextClick() {

    this.router.navigate(this.data.nextRoute)
    this.dialogRef.close()

  }

  onBackClick() {

    this.router.navigate(this.data.homePageRoute)
    this.dialogRef.close()

  }
  
}

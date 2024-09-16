import { Injectable } from '@angular/core'
import { MatDialog, MatSnackBar } from '@angular/material'
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { Observable } from 'rxjs'
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component'

@Injectable({
  providedIn: 'root'
})
  
export class CommonUIService {

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) { }

  confirm(data: any, callback: any, ): void {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: data.width || '400px',
      data: data
    })

    dialogRef.afterClosed()
      .subscribe(yes => {
        if (yes) callback(yes)
        else callback(false)
      })
  }

  confirmUnsaved(): Observable<boolean> {

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { 
        title: "UNSAVED CHANGES!", 
        message: "You have unsaved changes on the page. Changes will be lost if you move back.",
        yesLabel: 'DISCARD CHANGES',
        noLabel: 'CANCEL'
      }
    })

    let afterClosed$ = dialogRef.afterClosed()
    afterClosed$.subscribe(yes => yes)

    return afterClosed$

  }

  flashSuccess(message: string): void {
    
    this.snackBar.open('Success: ' + message, 'Ok', { duration: 2500 })
    
  }

  flashError(message: string): void {
    
    this.snackBar.open('Error: ' + message, 'Ok')
    
  }

  systemError(error: any): void {
    
    //console.error(error)
    this.snackBar.open(error.name + ':' + error.statusText, 'Ok')
    
  }

  fileUploadDialog(callback: any, multi: boolean = true): void {

    let dialogRef = this.dialog.open(UploadDialogComponent, {
      width: '60%',
      height: '400px',
      data: {
        multi: multi
      }
    })

    dialogRef.afterClosed()
      .subscribe(uploadStatus => callback(uploadStatus))
    
  }

  error(result: any): boolean {
    
    if (result.status != 'success') {
      let message = result.messages? result.messages.join(',') : 'No Message'
      this.flashError(message)
      return true
    }
    return false
  }

}
import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material'


@Component({
  selector: 'app-common-list-value-dialog',
  templateUrl: './common-list-value-dialog.component.html',
  styleUrls: ['./common-list-value-dialog.component.css']
})
export class CommonListValueDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CommonListValueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { console.log(data)}
  
  onNoClick(): void {
    this.dialogRef.close()
  }

  get valid(): boolean {
    return (this.data.value.list_code != '' && this.data.value.lookup_code != '' && this.data.value.lookup_value != '')
    //return false
  }

  lookupValueUpdated(): void {
    if (this.data.value.lookup_code == '') this.data.value.lookup_code = this.data.value.lookup_value.toUpperCase().split(' ').join('_')
  }
}
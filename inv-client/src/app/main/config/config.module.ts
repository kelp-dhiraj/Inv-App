import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'
import { MatModule } from 'src/app/mat/mat.module'

import { ConfigRouting } from './config.routing'
import { CommonListValueComponent } from './common-list-value/common-list-value.component'
import { CommonListValueDialogComponent } from './common-list-value/common-list-value-dialog.component'
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component'
import { EmployeeListComponent } from './employee-list/employee-list.component'



@NgModule({
  declarations: [
    CommonListValueComponent,
    CommonListValueDialogComponent,
    EmployeeListComponent,
    EmployeeProfileComponent,
  ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    MatModule,
    ConfigRouting,
  ],
  entryComponents: [
    CommonListValueDialogComponent
  ]
})
export class ConfigModule { }

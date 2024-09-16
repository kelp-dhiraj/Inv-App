import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'
import { MatModule } from 'src/app/mat/mat.module'

import { ReportsRouting } from './reports.routing'
import { GenericReportComponent } from './generic-report/generic-report.component'



@NgModule({
  declarations: [
    GenericReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    MatModule,
    ReportsRouting,
  ],
  entryComponents: [
  ]
})
export class ReportsModule { }

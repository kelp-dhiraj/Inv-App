import { Routes, RouterModule } from '@angular/router'
import { ModuleWithProviders } from '@angular/core'
import { GenericReportComponent } from './generic-report/generic-report.component'

const routes: Routes = [
  { path: ':name', component: GenericReportComponent },
]

export const ReportsRouting: ModuleWithProviders = RouterModule.forChild(routes)

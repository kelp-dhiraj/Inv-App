import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { AuthGuard } from '../service/auth.guard'
import { MainComponent } from './main.component'
import { HomeComponent } from './home/home.component'
import { CommonDeActivateGuard } from '../mat/common-deactivate.guard'
import { EmployeeListComponent } from './employee-list/employee-list.component'
import { DashboardComponent } from './dashboard/dashboard.component'
import { ImportDataComponent } from './import-data/import-data.component'



const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [AuthGuard], canDeactivate: [CommonDeActivateGuard] },
      { path: ':mode', component: HomeComponent, canActivate: [AuthGuard], canDeactivate: [CommonDeActivateGuard] },
      { path: 'employees/list', component: EmployeeListComponent, canActivate: [AuthGuard]},
      { path: 'importdata/list', component: ImportDataComponent, canActivate: [AuthGuard]},
      { path: 'dashboard/:mode', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'configs', loadChildren: './config/config.module#ConfigModule', canActivate: [AuthGuard] },
      { path: 'reports', loadChildren: './reports/reports.module#ReportsModule', canActivate: [AuthGuard] }
    ]
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
  
export class MainRoutingModule { }

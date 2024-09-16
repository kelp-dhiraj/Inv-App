import { Routes, RouterModule } from '@angular/router'
import { ModuleWithProviders } from '@angular/core'

import { CommonDeActivateGuard } from 'src/app/mat/common-deactivate.guard'

import { CommonListValueComponent } from './common-list-value/common-list-value.component'
import { EmployeeListComponent } from './employee-list/employee-list.component'
import { EmployeeProfileComponent } from './employee-profile/employee-profile.component'


const routes: Routes = [
  { path: 'commonlistvalues', component: CommonListValueComponent,  },
  { path: 'employeelist', component: EmployeeListComponent },
  { path: 'employeeprofile/:id/edit', component: EmployeeProfileComponent, canDeactivate:[CommonDeActivateGuard] },
  { path: 'myprofile', component: EmployeeProfileComponent, canDeactivate:[CommonDeActivateGuard] },
]

export const ConfigRouting: ModuleWithProviders = RouterModule.forChild(routes)

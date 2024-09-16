import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgCircleProgressModule } from 'ng-circle-progress';

import { MatModule } from '../mat/mat.module'
import { circleProgressConfig } from './comp.config'

import { MainRoutingModule } from './main-routing.module'

import { MainComponent } from './main.component'
import { SideNavComponent } from './nav/side-nav/side-nav.component'
import { TopNavComponent } from './nav/top-nav/top-nav.component'
import { HomeComponent } from './home/home.component'

import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { InvestorComponent } from './investor/investor.component';
import { ProspectComponent } from './prospect/prospect.component';
import { EmployeeListComponent } from './employee-list/employee-list.component'
import { DashboardComponent } from './dashboard/dashboard.component';
import { ImportDataComponent } from './import-data/import-data.component';


@NgModule({
  declarations: [
    MainComponent,
    SideNavComponent,
    TopNavComponent,
    HomeComponent,
    SuccessDialogComponent,
    InvestorComponent,
    ProspectComponent,
    EmployeeListComponent,
    DashboardComponent,
    ImportDataComponent
  ],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MainRoutingModule,
    BrowserAnimationsModule,
    NgCircleProgressModule.forRoot(circleProgressConfig),
    MatModule,
  ],

  exports: [
    BrowserAnimationsModule,
  ],

  entryComponents: [
    SuccessDialogComponent,
  ],

})
  
export class MainModule { }
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatProgressSpinnerModule } from '@angular/material'

import { AuthRoutingModule } from './auth-routing.module'
import { LoginComponent } from './login/login.component'
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component'

@NgModule({
  declarations: [LoginComponent, LogoutConfirmationComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    MatProgressSpinnerModule
  ]
})
  
export class AuthModule { }

import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { LoginComponent } from './login/login.component'
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component'

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutConfirmationComponent },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
  
export class AuthRoutingModule { }

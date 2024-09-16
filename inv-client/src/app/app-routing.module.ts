import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { NotFoundComponent } from './not-found/not-found.component'
import { ErrorComponent } from './error/error.component'

const routes: Routes = [
  { path: 'error/404', component: NotFoundComponent },
  { path: 'error', component: ErrorComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
  
export class AppRoutingModule { }

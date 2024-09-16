import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule }   from '@angular/forms'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'
import { AdalService, AdalInterceptor } from 'adal-angular4'
import { MatSnackBarModule, MatProgressSpinnerModule, MatIconModule } from '@angular/material'

import { AuthModule } from './auth/auth.module'
import { MainModule } from './main/main.module'
import { AppRoutingModule } from './app-routing.module'


import { AuthGuard } from './service/auth.guard'
import { GlobalDataService } from './service/global-data.service'

import { AppComponent } from './app.component'
import { NotFoundComponent } from './not-found/not-found.component'
import { ErrorComponent } from './error/error.component'
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [ 
    AppComponent, 
    NotFoundComponent, ErrorComponent
  ],

  imports: [ 
    BrowserModule, 
    FormsModule, 
    HttpClientModule, 
    AuthModule, 
    MainModule, 
    AppRoutingModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],

  providers: [ 
    AdalService, 
    // { provide: HTTP_INTERCEPTORS, useClass: AdalInterceptor, multi: true },
    AuthGuard, 
    GlobalDataService,
    DatePipe
  ],

  bootstrap: [ AppComponent ]
})

export class AppModule { }
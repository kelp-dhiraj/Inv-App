import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { CanDeactivate } from '@angular/router'

import { CommonUIService } from './common-ui.service'

@Injectable()
export class CommonDeActivateGuard implements CanDeactivate<any> {

  constructor(
    private uiSvc: CommonUIService
  ) { }
  
  canDeactivate(target: any): Observable<boolean> | boolean {
    
    return target.hasUnsaved() ? this.uiSvc.confirmUnsaved() : true
    
  }
}
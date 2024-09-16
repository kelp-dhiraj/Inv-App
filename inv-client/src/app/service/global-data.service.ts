import { Injectable } from '@angular/core'
import { Observable, Subject, throwError } from 'rxjs'
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { retry, catchError, share, map } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material'
import { Router } from '@angular/router'
import { AdalService } from 'adal-angular4';


export interface FileUploadStatus {
  status: string
  percent: number
  dbRecordId: number
  fileName: string
}

@Injectable({
  providedIn: 'root'
})
  
export class GlobalDataService {

  userInfo: any
  elevatedCheck: [number, boolean] = null
  approverCheck: [number, number] = null
  cachedData: any = {}
  $authRequest: Observable<any>

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private adalService: AdalService
  ) { }

  handleError(error: any): any {
    this.snackBar.open(error.message, 'Ok')
    // if (!this.adalService.userInfo.authenticated) this.router.navigate(['/login'])
    // return throwError(error)

  }

  submitElevatedCheck(primaryPersonId: number, allowBO: boolean = false) {

    if (this.userInfo) {
      this.checkElevatedAccess(primaryPersonId, allowBO)
    } else {
      this.elevatedCheck = [primaryPersonId, allowBO]
    }

  }

  submitApproverCheck(approverId: number, primaryPersonId: number) {

    if (this.userInfo) {
      this.checkApproverAccess(approverId, primaryPersonId)
    } else {
      this.approverCheck = [approverId, primaryPersonId]
    }

  }

  checkApproverAccess(approverId: number, primaryPersonId: number) {

    this.approverCheck = null
    if (this.userInfo.id != approverId || this.userInfo.id == primaryPersonId) this.router.navigate(['/'])

  }

  checkElevatedAccess(primaryPersonId: number, allowBO: boolean) {

    this.elevatedCheck = null
    if (this.userInfo.id != primaryPersonId && !this.userInfo.isAdmin && (!allowBO || !this.userInfo.isBO)) this.router.navigate(['/'])

  }



  getAuth(): void {

    this.$authRequest = this.http.get<Observable<any>>(environment.apiUrl + '/authorization')
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this)),
        share()
    )
    
    this.$authRequest.subscribe(
      (result: any) => {
        if (result) {
          this.userInfo = result.data
          this.userInfo.isAdmin = this.userInfo.is_admin
          if (this.elevatedCheck) this.checkElevatedAccess(this.elevatedCheck[0], this.elevatedCheck[1])
          if (this.approverCheck) this.checkApproverAccess(this.approverCheck[0], this.approverCheck[1])
        }
      }
    )

  }

  waitForAuth(callback: any): any {

    this.$authRequest.subscribe(result => {
      //console.log('wait for auth')
      callback()
    })

  }



  auth$(): Observable<any> {

    return this.http.get<Observable<any>>(environment.apiUrl + '/authorization')
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
    )
    
  }



  get(route: string): Observable<any> {

    if (this.cachedData.hasOwnProperty(route)) {

      const cachedDataSubject = new Subject<any>()

      if (this.cachedData[route]) {

        setTimeout(() => {
          cachedDataSubject.next(this.cachedData[route])
          cachedDataSubject.complete()
        })

      } else {

        this.http.get(environment.apiUrl + '/' + this.getRouteWithClientId(route))
          .pipe(
            retry(1),
            catchError(this.handleError.bind(this))
          ).subscribe(result => {

            this.cachedData[route] = result
            cachedDataSubject.next(this.cachedData[route])
            cachedDataSubject.complete()

          })
      }

      return cachedDataSubject.asObservable()

    } else {
      return this.http.get(environment.apiUrl + '/' + this.getRouteWithClientId(route))
        .pipe(
          retry(1),
          catchError(this.handleError.bind(this))
        )

    }

  }

  getList(name: string): Observable<any[]> {

    return this.get('listbycode/' + name)
      .pipe(
        map(result => result.data)
      )
  }

  update(route: string, data: any): Observable<any> {

    return this.http.put(environment.apiUrl + '/' + this.getRouteWithClientId(route), data)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      )
  }

  create(route: string, data: any): Observable<any> {

    return this.http.post(environment.apiUrl + '/' + this.getRouteWithClientId(route), data)
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      )
    
  }

  delete(route: string): Observable<any> {

    return this.http.delete(environment.apiUrl + '/' + this.getRouteWithClientId(route))
      .pipe(
        retry(1),
        catchError(this.handleError.bind(this))
      )
    
  }


  upload(files: Set<File>): { [key: string]: { progress$: Observable<FileUploadStatus>, subscription: any, isComplete: boolean } } {

    const statusList: { [key: string]: { progress$: Observable<FileUploadStatus>, subscription: any, isComplete: boolean } } = {}

    files.forEach(file => {
      const formData: FormData = new FormData()
      formData.append('file', file, file.name)

      const req = new HttpRequest('POST', environment.apiUrl + `/${this.getRouteWithClientId('fileupload')}`, formData, {
        reportProgress: true
      })

      const progress = new Subject<FileUploadStatus>()

      let subscription = this.http.request(req)
        .pipe(
          retry(1),
          catchError(this.handleError.bind(this))
        ).subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentDone = Math.round(100 * event.loaded / event.total)
            const data = {
              status: 'progress',
              percent: percentDone,
              dbRecordId: null,
              fileName: null
            }
            progress.next(data)
          } else if (event instanceof HttpResponse) {
            //console.log(event)
            let result: any = event.body
            const data = {
              status: 'complete',
              percent: 100,
              dbRecordId: result.data[0].id,
              fileName: result.data[0].uploaded_file_name
            }
            progress.next(data)
            progress.complete()
          }
        })

      statusList[file['index']] = {
        progress$: progress.asObservable(),
        subscription: subscription,
        isComplete: false
      }
      
    })

    return statusList
  }

  downloadFile(id: number): void {

    this.http.get(environment.apiUrl + '/filetempid/' + id)
      .subscribe((result: any) => {
        if (result.status == 'success') window.open(environment.openApiUrl + '/filedownload/' + result.data.uniqueid)
      })
    
  }

  mainClass() {

    if (this.router.url == '/employees/mygoalpresentation') return 'hide-nav'
    return ''

  }

  exportCSV(data, fields) {
    data = data.map(r => {
      let r1 = {}
      let fieldNames = Object.keys(fields)
      fieldNames.forEach(f => r1[f] = r[f])
      return r1
    })
    data.splice(0, 0, fields)
    
    let str = data
      .map((row) => Object.values(row).map(column => '"' + (column || column == 0) ? (typeof column === 'boolean' ? (column ? 'Y' : 'N') : column) : '' + '"').join(','))
      .reduce((concatString, curString) => concatString + "\n" + curString)
    
    let link = document.createElement('a')
    link.setAttribute('download','export.csv')
    link.setAttribute('href', 'data:text/plain;base64,' + btoa(str))
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  getRouteWithClientId(route:string){
    if(!route.includes('?')){
      route = route+`?oid=${environment.clientId}`;
    }else{
      route = route+`&oid=${environment.clientId}`;
    }
    return route;
  }

}




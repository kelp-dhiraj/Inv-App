import { Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { Router, ActivatedRoute } from "@angular/router"
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms"
import { Observable } from 'rxjs'

import { GlobalDataService } from 'src/app/service/global-data.service'
import { CommonUIService } from 'src/app/mat/common-ui.service'
import { map } from 'rxjs/operators'


@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent implements OnInit {

  constructor(    
    private formBuilder: FormBuilder,
    private router: Router, 
    private route: ActivatedRoute,
    public dataSvc: GlobalDataService, 
    private uiSvc: CommonUIService,
  ) { }

  primaryPersonId: number = null
  primaryPersonDetails: any
  operation: string
  persons$: Observable<any[]>
  designationCode$: Observable<any[]>
  departmentCodes$: Observable<any[]>
  loadedPic: any
  picUpdated : boolean = false
  defaultPic: any = "assets/img/Icons_Users_Large_Users_L_Primary.svg"
  form: FormGroup
  profilePic: any = "assets/img/Icons_Users_Large_Users_L_Primary.svg"
  
  @ViewChild('file', { read: false, static: false }) file: ElementRef
  @ViewChild('img', {read: false, static: false}) img: ElementRef 

  ngOnInit() {
    console.log('emp profile')

    if (!this.dataSvc.userInfo) {
      this.router.navigate(['/'])
    } else {
      this.primaryPersonId = this.dataSvc.userInfo.id
    }
    
    let route = this.route.routeConfig.path.split('/')
    if (route[0] == 'employeeprofile') this.primaryPersonId = Number(this.route.snapshot.params.id)

    this.persons$ = this.dataSvc.get('employees').pipe(map(result => result.data))
    this.designationCode$ = this.dataSvc.getList('DESIGNATION')
    this.departmentCodes$ = this.dataSvc.getList('DEPARTMENT')

    this.form = this.formBuilder
      .group({
        id: null,
        full_name: [{ value: null, disabled: true },[Validators.required]],
        email: [{ value: null, disabled: true },[Validators.required, Validators.email]],
        supervisor_emp_id: [{ value: null, disabled: !this.admin }, [Validators.required]],
        hr_emp_id: [{ value: null, disabled: !this.admin }, [Validators.required]],
        is_admin: [null],
        designation_code: [{ value: null, disabled: !this.admin }, [Validators.required]],
        department_code: [{ value: null, disabled: !this.admin }, [Validators.required]]
      })
    
    if (!this.primaryPersonId) {
      this.router.navigate(['/'])
      return
    }
    
    this.dataSvc.get('employees/'+this.primaryPersonId)
      .subscribe(result => {
        if (this.uiSvc.error(result)) return
        this.form.patchValue(result.data)
        if (result.data.profile_picture) {
          this.loadedPic = result.data.profile_picture
          this.profilePic = result.data.profile_picture
        } else {
          this.profilePic = null
        }
      })

  }

  onFileSelected() {
    let types = ["image/png","image/jpeg"]
    if (this.file.nativeElement.files.length == 0) return
    console.log(this.file.nativeElement.files)

    let file = this.file.nativeElement.files[0]
    if (types.indexOf(file.type) < 0) {
      this.uiSvc.flashError(file.name + ' is not supported')
      return 
    }

    let reader = new FileReader(), _this = this;
    reader.onload = function (e) {
      console.log((e.target['result']+'0').length)
      _this.profilePic = e.target['result']
      _this.picUpdated = true
    }
    reader.readAsDataURL(file);
    
  }

  onSubmit() {

    if (this.admin) {
      if (this.form.dirty) {
        Object.values(this.form.controls)
          .forEach((control: FormControl) => {
            control.markAsTouched()
            control.updateValueAndValidity()
          })
        if (this.form.invalid) {
          this.uiSvc.flashError('Please complete the form before submitting')
          return
        }
        
        let data = this.form.getRawValue()

        this.dataSvc.update('employees/' + this.primaryPersonId, data).subscribe(result => {
          if (this.uiSvc.error(result)) return
          this.uiSvc.flashSuccess(result.messages.join(', '))
          this.form.markAsPristine()
          //this.savePic()
          this.router.navigate(['/configs','employeelist'])
        })
      } else {
        //this.savePic()
        this.router.navigate(['/'])
      }
      

    } else {
      //console.log(this.img.nativeElement.src);
      //this.savePic()
      this.router.navigate(['/'])
    }

  }

  savePic() {
    if (this.picUpdated) {
      
      let picdata
      //console.log(this.imageToDataUri(this.img.nativeElement))
      if (this.profilePic == this.defaultPic) picdata=""
      else picdata = this.imageToDataUri(this.img.nativeElement)

      this.dataSvc.update('employees/' + this.primaryPersonId + '/picture', { profile_picture: picdata }).subscribe(result => {
        if (this.uiSvc.error(result)) return
        this.uiSvc.flashSuccess(result.messages.join(', '))
        this.dataSvc.userInfo.profile_picture = this.profilePic
        this.onCancelClick()
      })

    } else {
      this.onCancelClick()
    }
  }

  openBrowser() {
    this.file.nativeElement.click()
  }

  revertPicture() {
    this.file.nativeElement.value = null
    this.profilePic = this.loadedPic || this.defaultPic
  }

  deletePicture() {
    this.file.nativeElement.value = null
    this.profilePic = this.defaultPic
    this.picUpdated = true
  }

  imageToDataUri(img) {

    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');

    // set its dimension to target size
    canvas.width = 196;
    canvas.height = 196;

    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, 196, 196);

    // encode image to data-uri with base64 version of compressed image
    return canvas.toDataURL('image/jpeg',.8);
}
  
  get admin(): boolean {
    if (this.dataSvc.userInfo && this.dataSvc.userInfo.isAdmin) return true 
    return false
  }

  onCancelClick() {
    this.router.navigate(['/configs','employeelist'])
  }

  hasUnsaved(): boolean {
    return this.form.dirty
  }

  initials() {
    if (!this.form || !this.form.get('full_name').value) return '--'
    let names = this.form.get('full_name').value.split(' ').map(r=>r.charAt(0).toUpperCase())
    return names[0] + (names.length > 1 ? names[names.length - 1] : '')
  }

}

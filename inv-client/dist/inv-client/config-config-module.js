(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["config-config-module"],{

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/common-list-value/common-list-value-dialog.component.html":
/*!*****************************************************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/common-list-value/common-list-value-dialog.component.html ***!
  \*****************************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<h1 mat-dialog-title>{{ data.title }}</h1>\n<div mat-dialog-content>\n  <mat-form-field>\n    <input matInput placeholder=\"List Code\" disabled autocomplete=\"off\"\n      [(ngModel)]=\"data.value.list_code\"\n    >\n    <mat-error>List Code is required</mat-error>\n  </mat-form-field>\n  <mat-form-field>\n    <input matInput placeholder=\"Lookup Value\" required autocomplete=\"off\"\n      [(ngModel)]=\"data.value.lookup_value\" \n      (change)=\"lookupValueUpdated()\" \n    >\n    <mat-error>Lookup Value is required</mat-error>\n  </mat-form-field>\n  <mat-form-field>\n    <input matInput placeholder=\"Lookup Code\" required autocomplete=\"off\"\n      [disabled]=\"data.action=='edit'\"\n      [ngModel]=\"data.value.lookup_code | uppercase\" \n      (ngModelChange)=\"data.value.lookup_code = $event\"\n    >\n    <mat-error>Lookup Code is required</mat-error>\n  </mat-form-field>\n\n  <mat-checkbox color=\"primary\" [(ngModel)]=\"data.value.enabled\"> Enabled </mat-checkbox>\n  <mat-form-field>\n    <input matInput placeholder=\"Description\" autocomplete=\"off\"\n      [(ngModel)]=\"data.value.lookup_description\"\n    >\n  </mat-form-field>\n  <mat-form-field>\n    <input matInput placeholder=\"Display Order\" autocomplete=\"off\"\n      [(ngModel)]=\"data.value.display_order\"\n    >\n  </mat-form-field>\n</div>\n<div mat-dialog-actions>\n  <button mat-raised-button color=\"primary\" [mat-dialog-close]=\"data\" [disabled]=\"!valid\">Ok</button>\n  <button mat-raised-button color=\"basic\" (click)=\"onNoClick()\">Cancel</button>\n</div>");

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/common-list-value/common-list-value.component.html":
/*!**********************************************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/common-list-value/common-list-value.component.html ***!
  \**********************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"tn-table-card\" >\n  <app-table-toolbar [title]=\"'Lists'\" [buttons]=\"{}\" [selectedId] = \"pSelectedId\" (toolbarAction)=\"toolbarActionParent($event)\"></app-table-toolbar>\n  <mat-card-content class=\"tn-table-card-content\" style=\"height:calc(40% - 64px)\">\n    <table mat-table [dataSource]=\"pDataSource\" matSort #pSort=\"matSort\" >\n      <ng-container matColumnDef=\"lookup_code\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> List Code </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\" > \n          {{ element.lookup_code }}\n        </td>\n      </ng-container>\n      <ng-container matColumnDef=\"lookup_value\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> List Name </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\" > \n          {{ element.lookup_value }}\n        </td>\n      </ng-container>\n      <ng-container matColumnDef=\"lookup_description\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Description </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\">\n          {{ element.lookup_description }}\n        </td>\n      </ng-container>\n      <tr mat-header-row *matHeaderRowDef=\"pDisplayedColumns; sticky: true\"></tr>\n      <tr mat-row *matRowDef=\"let row; columns: pDisplayedColumns;\"\n      [ngClass]=\"{'tn-table-row-highlight': pSelectedId == row.id}\"\n      (click)=\"highlightParent(row)\"\n      ></tr>\n    </table>\n  </mat-card-content>\n  <app-table-toolbar [title]=\"'Values'\" [buttons]=\"{create:'default',edit:'default'}\" [selectedId] = \"cSelectedId\" (toolbarAction)=\"toolbarActionChild($event)\"></app-table-toolbar>\n  <mat-card-content class=\"tn-table-card-content\" style=\"height:calc(60% - 64px)\">\n    <table mat-table [dataSource]=\"cDataSource\" matSort #cSort=\"matSort\" >\n      <ng-container matColumnDef=\"lookup_code\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Code </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\">\n          {{ element.lookup_code }}\n        </td>\n      </ng-container>\n      <ng-container matColumnDef=\"lookup_value\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Value </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\">\n          {{ element.lookup_value }}\n        </td>\n      </ng-container>\n      <ng-container matColumnDef=\"lookup_description\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Description </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\">\n          {{ element.lookup_description }}\n        </td>\n      </ng-container>\n      <ng-container matColumnDef=\"enabled\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Enabled? </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\">\n          <mat-checkbox color=\"primary\" [checked]=\"element.enabled\" disabled></mat-checkbox>\n        </td>\n      </ng-container>\n      <ng-container matColumnDef=\"display_order\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Display Order </th>\n        <td mat-cell *matCellDef=\"let element; let index = index\">\n          {{element.display_order}}\n        </td>\n      </ng-container>\n      <tr mat-header-row *matHeaderRowDef=\"cDisplayedColumns; sticky: true\"></tr>\n      <tr mat-row *matRowDef=\"let row; columns: cDisplayedColumns;\"\n      [ngClass]=\"{'tn-table-row-highlight': cSelectedId == row.id}\"\n      (click)=\"highlightChild(row)\"\n      ></tr>\n    </table>\n  </mat-card-content>\n</mat-card>\n\n  \n");

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/employee-list/employee-list.component.html":
/*!**************************************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/employee-list/employee-list.component.html ***!
  \**************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"tn-table-card\">\n  <app-table-toolbar [title]=\"'Persons'\" [buttons]=\"buttons\" [selectedId] = \"selectedId\" (toolbarAction)=\"toolbarAction($event)\"></app-table-toolbar>\n  <mat-card-content class=\"tn-table-card-content\">\n    <table mat-table [dataSource]=\"dataSource\" matSort>\n      <ng-container matColumnDef=\"full_name\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Full Name </th>\n        <td mat-cell *matCellDef=\"let element\"> {{element.full_name}} </td>\n      </ng-container>\n      <ng-container matColumnDef=\"email\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>\n        <td mat-cell *matCellDef=\"let element\"> {{element.email}} </td>\n      </ng-container>\n      <ng-container matColumnDef=\"sup\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Supervisor </th>\n        <td mat-cell *matCellDef=\"let element\"> {{element.sup}} </td>\n      </ng-container>\n      <ng-container matColumnDef=\"hr\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> HR Manager </th>\n        <td mat-cell *matCellDef=\"let element\"> {{element.hr}} </td>\n      </ng-container>\n      <ng-container matColumnDef=\"is_admin\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header> Admin? </th>\n        <td mat-cell *matCellDef=\"let element\" ><mat-checkbox color=\"primary\" [checked]=\"element.is_admin\" disabled></mat-checkbox></td>\n      </ng-container>\n\n      <tr mat-header-row *matHeaderRowDef=\"columns; sticky: true\"></tr>\n      <tr mat-row \n          *matRowDef=\"let row; columns: columns;\"\n          [ngClass]=\"{'tn-table-row-highlight': selectedId == row.id}\"\n          (click)=\"highlight(row)\"\n      ></tr>\n    </table>\n  </mat-card-content>\n  <mat-paginator [pageSize]=\"10\" [pageSizeOptions]=\"[10, 20, 50]\"></mat-paginator>\n</mat-card>\n");

/***/ }),

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/employee-profile/employee-profile.component.html":
/*!********************************************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/employee-profile/employee-profile.component.html ***!
  \********************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"tn-form-card\" style=\"height: 100%\">\n  <mat-toolbar class=\"tn-form-toolbar\">\n    <span class=\"tn-form-title\">Employee Details</span>    \n  </mat-toolbar>\n  <mat-card-content class=\"tn-form-card-content\">\n    <form [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" class=\"tn-form-main\" >\n      <div>\n        <div fxLayout=\"row wrap\" fxLayout.lt-sm=\"column\" fxLayoutGap=\"20px\" fxLayoutAlign=\"flex-start\">\n          <div fxFlex=\"0 1 calc(50% - 10px)\" fxFlex.lt-md=\"0 1 100%\">\n            <mat-form-field style=\"width: 100%\">\n                <input matInput formControlName=\"full_name\" placeholder=\"Full Name\" autocomplete=\"off\">\n                <mat-error>Full Name is Required</mat-error>\n            </mat-form-field>\n            <mat-form-field style=\"width: 100%\">\n              <input matInput formControlName=\"email\" placeholder=\"Email\" autocomplete=\"off\">\n              <mat-error>A valid Email is Required</mat-error>\n            </mat-form-field>\n            <mat-form-field style=\"width: 100%\">\n                <mat-select formControlName=\"supervisor_emp_id\" placeholder=\"Supervisor\">\n                  <mat-option *ngFor=\"let item of persons$ | async\" [value]=\"item.id\">{{item.full_name}}</mat-option>\n                </mat-select>\n                <mat-error>Supervisor is required</mat-error>\n              </mat-form-field>\n              <mat-form-field style=\"width: 100%\">\n                <mat-select formControlName=\"hr_emp_id\" placeholder=\"HR\">\n                  <mat-option *ngFor=\"let item of persons$ | async\" [value]=\"item.id\">{{item.full_name}}</mat-option>\n                </mat-select>\n                <mat-error>HR Manager is required</mat-error>\n              </mat-form-field>\n              <mat-form-field style=\"width: 100%\">\n                <mat-select formControlName=\"designation_code\" placeholder=\"Designation Code\">\n                  <mat-option *ngFor=\"let item of designationCode$ | async\" [value]=\"item.lookup_code\">{{item.lookup_value}}</mat-option>\n                </mat-select>\n                <mat-error>Designation Code is Required</mat-error>\n              </mat-form-field>\n              <mat-form-field style=\"width: 100%\">\n                <mat-select formControlName=\"department_code\" placeholder=\"Department Code\">\n                  <mat-option *ngFor=\"let item of departmentCodes$ | async\" [value]=\"item.lookup_code\">{{item.lookup_value}}</mat-option>\n                </mat-select>\n                <mat-error>Department Code is Required</mat-error>\n              </mat-form-field>\n          </div>\n          <div fxFlex=\"0 1 calc(50% - 10px)\" fxFlex.lt-md=\"0 1 100%\">\n            <div style=\"width: 100%;display: flex; align-items: center; justify-content: center\">\n              <div style=\"align-items: center; display: flex; justify-content: center; width: 200px; height: 200px; border-radius: 100px; margin: auto; background-color: #ccc; position: relative; overflow: hidden; \">\n                <img *ngIf=\"profilePic\" #img [src]=\"profilePic\" style=\"max-width: 196px; max-height: 196px\" [ngStyle]=\"{width: defaultPic ? '196px' : ''}\">\n                <div *ngIf=\"!profilePic\" class=\"text-black\" style=\"font-size: 100px\">{{initials()}}</div>\n              </div>\n            </div>\n            <!--div style=\"width: 100%; text-align: center; padding: 20px;\">\n              <button mat-stroked-button color=\"basic\" *ngIf=\"picUpdated\" style=\"margin-right: 10px;\" type=\"button\" matTooltip=\"Revert to old picture\" (click)=\"revertPicture()\">\n                <mat-icon>undo</mat-icon>\n              </button>\n              <button mat-stroked-button color=\"basic\" style=\"margin-right: 10px;\" type=\"button\"  matTooltip=\"Upload New Profile Picture\" (click)=\"openBrowser()\">\n                <mat-icon>arrow_upward</mat-icon>\n              </button>\n              <button mat-stroked-button color=\"basic\" type=\"button\" matTooltip=\"Delete Profile Picture\" (click)=\"deletePicture()\">\n                <mat-icon>cancel</mat-icon>\n              </button>\n              <input #file type=\"file\" style=\"opacity: 0; width: 0px; height: 0px;\" (change)=\"onFileSelected()\">\n            </div-->\n          </div>\n\n        </div>\n        <div fxLayout=\"row wrap\" fxLayout.lt-sm=\"column\" fxLayoutGap=\"20px\" fxLayoutAlign=\"flex-start\" style=\"padding: 20px 0px\">        \n          <div fxFlex=\"0 1 100%\" fxFlex.lt-md=\"0 1 100%\" *ngIf=\"admin\">\n              <span class=\"tn-inline-checkbox-heading\">Role</span>  \n              <mat-checkbox color=\"primary\" class=\"tn-inline-checkbox\" formControlName=\"is_admin\">Administrator</mat-checkbox>\n          </div>\n        </div>\n      </div>\n      <div *ngIf=\"admin\">          \n        <button mat-raised-button color=\"primary\" style=\"margin-right: 20px\">Save</button>\n        <button mat-raised-button color=\"basic\" type=\"button\" (click)=\"onCancelClick()\">Cancel</button>\n      </div>\n    </form>\n  </mat-card-content>\n</mat-card>");

/***/ }),

/***/ "./src/app/main/config/common-list-value/common-list-value-dialog.component.css":
/*!**************************************************************************************!*\
  !*** ./src/app/main/config/common-list-value/common-list-value-dialog.component.css ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("mat-form-field {\n  width: 100%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbWFpbi9jb25maWcvY29tbW9uLWxpc3QtdmFsdWUvY29tbW9uLWxpc3QtdmFsdWUtZGlhbG9nLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxXQUFXO0FBQ2IiLCJmaWxlIjoic3JjL2FwcC9tYWluL2NvbmZpZy9jb21tb24tbGlzdC12YWx1ZS9jb21tb24tbGlzdC12YWx1ZS1kaWFsb2cuY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIm1hdC1mb3JtLWZpZWxkIHtcbiAgd2lkdGg6IDEwMCU7XG59Il19 */");

/***/ }),

/***/ "./src/app/main/config/common-list-value/common-list-value-dialog.component.ts":
/*!*************************************************************************************!*\
  !*** ./src/app/main/config/common-list-value/common-list-value-dialog.component.ts ***!
  \*************************************************************************************/
/*! exports provided: CommonListValueDialogComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommonListValueDialogComponent", function() { return CommonListValueDialogComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");



var CommonListValueDialogComponent = /** @class */ (function () {
    function CommonListValueDialogComponent(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
        console.log(data);
    }
    CommonListValueDialogComponent.prototype.onNoClick = function () {
        this.dialogRef.close();
    };
    Object.defineProperty(CommonListValueDialogComponent.prototype, "valid", {
        get: function () {
            return (this.data.value.list_code != '' && this.data.value.lookup_code != '' && this.data.value.lookup_value != '');
            //return false
        },
        enumerable: true,
        configurable: true
    });
    CommonListValueDialogComponent.prototype.lookupValueUpdated = function () {
        if (this.data.value.lookup_code == '')
            this.data.value.lookup_code = this.data.value.lookup_value.toUpperCase().split(' ').join('_');
    };
    CommonListValueDialogComponent.ctorParameters = function () { return [
        { type: _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"] },
        { type: undefined, decorators: [{ type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"], args: [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"],] }] }
    ]; };
    CommonListValueDialogComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-common-list-value-dialog',
            template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./common-list-value-dialog.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/common-list-value/common-list-value-dialog.component.html")).default,
            styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./common-list-value-dialog.component.css */ "./src/app/main/config/common-list-value/common-list-value-dialog.component.css")).default]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__param"](1, Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Inject"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MAT_DIALOG_DATA"])),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialogRef"], Object])
    ], CommonListValueDialogComponent);
    return CommonListValueDialogComponent;
}());



/***/ }),

/***/ "./src/app/main/config/common-list-value/common-list-value.component.css":
/*!*******************************************************************************!*\
  !*** ./src/app/main/config/common-list-value/common-list-value.component.css ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (".mat-column-list_code, \n.mat-column-lookup_code {\n  width:30%;\n}\n\n.mat-column-list_name,\n.mat-column-lookup_value,\n.mat-column-description {\n  width:30%;\n}\n\n.mat-column-enabled{\n  width: 10%;\n}\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbWFpbi9jb25maWcvY29tbW9uLWxpc3QtdmFsdWUvY29tbW9uLWxpc3QtdmFsdWUuY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7RUFFRSxTQUFTO0FBQ1g7O0FBRUE7OztFQUdFLFNBQVM7QUFDWDs7QUFFQTtFQUNFLFVBQVU7QUFDWiIsImZpbGUiOiJzcmMvYXBwL21haW4vY29uZmlnL2NvbW1vbi1saXN0LXZhbHVlL2NvbW1vbi1saXN0LXZhbHVlLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubWF0LWNvbHVtbi1saXN0X2NvZGUsIFxuLm1hdC1jb2x1bW4tbG9va3VwX2NvZGUge1xuICB3aWR0aDozMCU7XG59XG5cbi5tYXQtY29sdW1uLWxpc3RfbmFtZSxcbi5tYXQtY29sdW1uLWxvb2t1cF92YWx1ZSxcbi5tYXQtY29sdW1uLWRlc2NyaXB0aW9uIHtcbiAgd2lkdGg6MzAlO1xufVxuXG4ubWF0LWNvbHVtbi1lbmFibGVke1xuICB3aWR0aDogMTAlO1xufVxuIl19 */");

/***/ }),

/***/ "./src/app/main/config/common-list-value/common-list-value.component.ts":
/*!******************************************************************************!*\
  !*** ./src/app/main/config/common-list-value/common-list-value.component.ts ***!
  \******************************************************************************/
/*! exports provided: CommonListValueComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CommonListValueComponent", function() { return CommonListValueComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/mat/common-ui.service */ "./src/app/mat/common-ui.service.ts");
/* harmony import */ var src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/service/global-data.service */ "./src/app/service/global-data.service.ts");
/* harmony import */ var _common_list_value_dialog_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./common-list-value-dialog.component */ "./src/app/main/config/common-list-value/common-list-value-dialog.component.ts");







var CommonListValueComponent = /** @class */ (function () {
    function CommonListValueComponent(router, dataSvc, uiSvc, dialog) {
        this.router = router;
        this.dataSvc = dataSvc;
        this.uiSvc = uiSvc;
        this.dialog = dialog;
        this.pDisplayedColumns = ['lookup_code', 'lookup_value', 'lookup_description'];
        this.cDisplayedColumns = ['lookup_code', 'lookup_value', 'lookup_description', 'enabled', 'display_order'];
        this.pDataSource = new _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatTableDataSource"]();
        this.cDataSource = new _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatTableDataSource"]();
    }
    CommonListValueComponent.prototype.ngOnInit = function () {
        this.getList();
    };
    CommonListValueComponent.prototype.ngAfterViewInit = function () {
        this.pDataSource.sort = this.pSort;
        this.cDataSource.sort = this.cSort;
    };
    CommonListValueComponent.prototype.doFilterParent = function (value) {
        this.pDataSource.filter = value.trim().toLocaleLowerCase();
        this.pSelectedId = null;
        this.cDataSource.data = [];
    };
    CommonListValueComponent.prototype.doFilterChild = function (value) {
        this.cDataSource.filter = value.trim().toLocaleLowerCase();
    };
    CommonListValueComponent.prototype.highlightParent = function (row) {
        var _this = this;
        this.pSelectedId = this.pSelectedId == row.id ? null : row.id;
        this.dataSvc.get('listbycode/' + row.lookup_code + '?show=all')
            .subscribe(function (result) {
            if (_this.uiSvc.error(result))
                return;
            _this.cDataSource.data = result.data;
        });
    };
    CommonListValueComponent.prototype.highlightChild = function (row) {
        this.cSelectedId = this.cSelectedId == row.id ? null : row.id;
    };
    CommonListValueComponent.prototype.toolbarActionParent = function (event) {
        switch (event.action) {
            case 'filter':
                this.doFilterParent(event.value);
                break;
        }
    };
    CommonListValueComponent.prototype.toolbarActionChild = function (event) {
        switch (event.action) {
            case 'filter':
                this.doFilterChild(event.value);
                break;
            case 'create':
                this.create();
                break;
            case 'edit':
                this.edit();
                break;
        }
    };
    CommonListValueComponent.prototype.openDialog = function (data, callback) {
        var dialogRef = this.dialog.open(_common_list_value_dialog_component__WEBPACK_IMPORTED_MODULE_6__["CommonListValueDialogComponent"], { width: '400px', data: data });
        dialogRef.afterClosed()
            .subscribe(function (data) {
            if (data)
                callback(data);
        });
    };
    CommonListValueComponent.prototype.edit = function () {
        var _this = this;
        var dataArray = this.cDataSource.data;
        var value = dataArray.find(function (d) { return d.id == _this.cSelectedId; });
        var index = dataArray.indexOf(value);
        this.openDialog({
            action: 'edit',
            title: 'Edit Lookup Value',
            value: tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, value)
        }, function (data) {
            _this.dataSvc.update('commonlistvalues/' + data.value.id, data.value)
                .subscribe(function (result) {
                if (_this.uiSvc.error(result))
                    return;
                _this.uiSvc.flashSuccess(result.messages.join(','));
                dataArray.splice(index, 1, data.value);
                _this.cDataSource.data = dataArray.slice();
                if (data.value.list_code == 'LIST_CODES')
                    _this.getList();
            });
        });
    };
    CommonListValueComponent.prototype.create = function () {
        var _this = this;
        if (!this.pSelectedId) {
            this.uiSvc.flashError('Please select a list first');
            return;
        }
        var data = this.pDataSource.data.find(function (d) { return d.id == _this.pSelectedId; });
        var value = { id: null, list_code: data.lookup_code, lookup_code: '', lookup_value: '', lookup_description: '', enabled: true, display_order: '' };
        this.openDialog({
            action: 'create',
            title: 'Create Lookup Value',
            value: value
        }, function (data) {
            _this.dataSvc.create('commonlistvalues', data.value)
                .subscribe(function (result) {
                if (_this.uiSvc.error(result))
                    return;
                _this.uiSvc.flashSuccess(result.messages.join(','));
                data.value.id = result.data.id;
                _this.cDataSource.data = _this.cDataSource.data.concat([data.value]);
                if (data.value.list_code == 'LIST_CODES')
                    _this.getList();
            });
        });
    };
    CommonListValueComponent.prototype.getList = function () {
        var _this = this;
        this.dataSvc.get('listcodes?show=all')
            .subscribe(function (result) {
            if (_this.uiSvc.error(result))
                return;
            _this.pDataSource.data = result.data;
        });
    };
    CommonListValueComponent.ctorParameters = function () { return [
        { type: _angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"] },
        { type: src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_5__["GlobalDataService"] },
        { type: src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__["CommonUIService"] },
        { type: _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialog"] }
    ]; };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('pSort', { read: false, static: false }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatSort"])
    ], CommonListValueComponent.prototype, "pSort", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('cSort', { read: false, static: false }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatSort"])
    ], CommonListValueComponent.prototype, "cSort", void 0);
    CommonListValueComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-common-list-value',
            template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./common-list-value.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/common-list-value/common-list-value.component.html")).default,
            styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./common-list-value.component.css */ "./src/app/main/config/common-list-value/common-list-value.component.css")).default]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_3__["Router"],
            src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_5__["GlobalDataService"],
            src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__["CommonUIService"],
            _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatDialog"]])
    ], CommonListValueComponent);
    return CommonListValueComponent;
}());



/***/ }),

/***/ "./src/app/main/config/config.module.ts":
/*!**********************************************!*\
  !*** ./src/app/main/config/config.module.ts ***!
  \**********************************************/
/*! exports provided: ConfigModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigModule", function() { return ConfigModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var src_app_mat_mat_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/mat/mat.module */ "./src/app/mat/mat.module.ts");
/* harmony import */ var _config_routing__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./config.routing */ "./src/app/main/config/config.routing.ts");
/* harmony import */ var _common_list_value_common_list_value_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./common-list-value/common-list-value.component */ "./src/app/main/config/common-list-value/common-list-value.component.ts");
/* harmony import */ var _common_list_value_common_list_value_dialog_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./common-list-value/common-list-value-dialog.component */ "./src/app/main/config/common-list-value/common-list-value-dialog.component.ts");
/* harmony import */ var _employee_profile_employee_profile_component__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./employee-profile/employee-profile.component */ "./src/app/main/config/employee-profile/employee-profile.component.ts");
/* harmony import */ var _employee_list_employee_list_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./employee-list/employee-list.component */ "./src/app/main/config/employee-list/employee-list.component.ts");










var ConfigModule = /** @class */ (function () {
    function ConfigModule() {
    }
    ConfigModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _common_list_value_common_list_value_component__WEBPACK_IMPORTED_MODULE_6__["CommonListValueComponent"],
                _common_list_value_common_list_value_dialog_component__WEBPACK_IMPORTED_MODULE_7__["CommonListValueDialogComponent"],
                _employee_list_employee_list_component__WEBPACK_IMPORTED_MODULE_9__["EmployeeListComponent"],
                _employee_profile_employee_profile_component__WEBPACK_IMPORTED_MODULE_8__["EmployeeProfileComponent"],
            ],
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ReactiveFormsModule"],
                src_app_mat_mat_module__WEBPACK_IMPORTED_MODULE_4__["MatModule"],
                _config_routing__WEBPACK_IMPORTED_MODULE_5__["ConfigRouting"],
            ],
            entryComponents: [
                _common_list_value_common_list_value_dialog_component__WEBPACK_IMPORTED_MODULE_7__["CommonListValueDialogComponent"]
            ]
        })
    ], ConfigModule);
    return ConfigModule;
}());



/***/ }),

/***/ "./src/app/main/config/config.routing.ts":
/*!***********************************************!*\
  !*** ./src/app/main/config/config.routing.ts ***!
  \***********************************************/
/*! exports provided: ConfigRouting */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigRouting", function() { return ConfigRouting; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var src_app_mat_common_deactivate_guard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/app/mat/common-deactivate.guard */ "./src/app/mat/common-deactivate.guard.ts");
/* harmony import */ var _common_list_value_common_list_value_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common-list-value/common-list-value.component */ "./src/app/main/config/common-list-value/common-list-value.component.ts");
/* harmony import */ var _employee_list_employee_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./employee-list/employee-list.component */ "./src/app/main/config/employee-list/employee-list.component.ts");
/* harmony import */ var _employee_profile_employee_profile_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./employee-profile/employee-profile.component */ "./src/app/main/config/employee-profile/employee-profile.component.ts");






var routes = [
    { path: 'commonlistvalues', component: _common_list_value_common_list_value_component__WEBPACK_IMPORTED_MODULE_3__["CommonListValueComponent"], },
    { path: 'employeelist', component: _employee_list_employee_list_component__WEBPACK_IMPORTED_MODULE_4__["EmployeeListComponent"] },
    { path: 'employeeprofile/:id/edit', component: _employee_profile_employee_profile_component__WEBPACK_IMPORTED_MODULE_5__["EmployeeProfileComponent"], canDeactivate: [src_app_mat_common_deactivate_guard__WEBPACK_IMPORTED_MODULE_2__["CommonDeActivateGuard"]] },
    { path: 'myprofile', component: _employee_profile_employee_profile_component__WEBPACK_IMPORTED_MODULE_5__["EmployeeProfileComponent"], canDeactivate: [src_app_mat_common_deactivate_guard__WEBPACK_IMPORTED_MODULE_2__["CommonDeActivateGuard"]] },
];
var ConfigRouting = _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes);


/***/ }),

/***/ "./src/app/main/config/employee-list/employee-list.component.css":
/*!***********************************************************************!*\
  !*** ./src/app/main/config/employee-list/employee-list.component.css ***!
  \***********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (".mat-column-full_name,\n.mat-column-email,\n.mat-column-sup,\n.mat-column-hr,\n.mat-column-is_admin {\n  width: 25%;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbWFpbi9jb25maWcvZW1wbG95ZWUtbGlzdC9lbXBsb3llZS1saXN0LmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0VBS0UsVUFBVTtBQUNaIiwiZmlsZSI6InNyYy9hcHAvbWFpbi9jb25maWcvZW1wbG95ZWUtbGlzdC9lbXBsb3llZS1saXN0LmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyIubWF0LWNvbHVtbi1mdWxsX25hbWUsXG4ubWF0LWNvbHVtbi1lbWFpbCxcbi5tYXQtY29sdW1uLXN1cCxcbi5tYXQtY29sdW1uLWhyLFxuLm1hdC1jb2x1bW4taXNfYWRtaW4ge1xuICB3aWR0aDogMjUlO1xufSJdfQ== */");

/***/ }),

/***/ "./src/app/main/config/employee-list/employee-list.component.ts":
/*!**********************************************************************!*\
  !*** ./src/app/main/config/employee-list/employee-list.component.ts ***!
  \**********************************************************************/
/*! exports provided: EmployeeListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EmployeeListComponent", function() { return EmployeeListComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/service/global-data.service */ "./src/app/service/global-data.service.ts");
/* harmony import */ var src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/mat/common-ui.service */ "./src/app/mat/common-ui.service.ts");
/* harmony import */ var src_app_mat_generic_list_class__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/mat/generic-list.class */ "./src/app/mat/generic-list.class.ts");






var EmployeeListComponent = /** @class */ (function (_super) {
    tslib__WEBPACK_IMPORTED_MODULE_0__["__extends"](EmployeeListComponent, _super);
    function EmployeeListComponent(router, dataSvc, uiSvc) {
        var _this = _super.call(this, router, dataSvc, uiSvc) || this;
        _this.router = router;
        _this.dataSvc = dataSvc;
        _this.uiSvc = uiSvc;
        _this.columns = [
            'full_name',
            'email',
            'sup',
            'hr',
            'is_admin'
        ];
        _this.buttons = {
            edit: 'default'
        };
        return _this;
    }
    EmployeeListComponent.prototype.mapper = function (row) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, row, { sup: row.sup ? row.sup.full_name : null, hr: row.hr ? row.hr.full_name : null });
    };
    EmployeeListComponent.prototype.ngOnInit = function () {
        //if (!this.dataSvc.userInfo || !this.dataSvc.userInfo.isAdmin) this.router.navigate(['/'])
        this.loadAPI = 'employees';
        this.editRoute = '/configs/employeeprofile';
        this.init();
    };
    EmployeeListComponent.ctorParameters = function () { return [
        { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
        { type: src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_3__["GlobalDataService"] },
        { type: src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__["CommonUIService"] }
    ]; };
    EmployeeListComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-employee-list',
            template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./employee-list.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/employee-list/employee-list.component.html")).default,
            styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./employee-list.component.css */ "./src/app/main/config/employee-list/employee-list.component.css")).default]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_3__["GlobalDataService"],
            src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__["CommonUIService"]])
    ], EmployeeListComponent);
    return EmployeeListComponent;
}(src_app_mat_generic_list_class__WEBPACK_IMPORTED_MODULE_5__["GenericList"]));



/***/ }),

/***/ "./src/app/main/config/employee-profile/employee-profile.component.css":
/*!*****************************************************************************!*\
  !*** ./src/app/main/config/employee-profile/employee-profile.component.css ***!
  \*****************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL21haW4vY29uZmlnL2VtcGxveWVlLXByb2ZpbGUvZW1wbG95ZWUtcHJvZmlsZS5jb21wb25lbnQuY3NzIn0= */");

/***/ }),

/***/ "./src/app/main/config/employee-profile/employee-profile.component.ts":
/*!****************************************************************************!*\
  !*** ./src/app/main/config/employee-profile/employee-profile.component.ts ***!
  \****************************************************************************/
/*! exports provided: EmployeeProfileComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EmployeeProfileComponent", function() { return EmployeeProfileComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/service/global-data.service */ "./src/app/service/global-data.service.ts");
/* harmony import */ var src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/app/mat/common-ui.service */ "./src/app/mat/common-ui.service.ts");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");







var EmployeeProfileComponent = /** @class */ (function () {
    function EmployeeProfileComponent(formBuilder, router, route, dataSvc, uiSvc) {
        this.formBuilder = formBuilder;
        this.router = router;
        this.route = route;
        this.dataSvc = dataSvc;
        this.uiSvc = uiSvc;
        this.primaryPersonId = null;
        this.picUpdated = false;
        this.defaultPic = "assets/img/Icons_Users_Large_Users_L_Primary.svg";
        this.profilePic = "assets/img/Icons_Users_Large_Users_L_Primary.svg";
    }
    EmployeeProfileComponent.prototype.ngOnInit = function () {
        var _this_1 = this;
        console.log('emp profile');
        if (!this.dataSvc.userInfo) {
            this.router.navigate(['/']);
        }
        else {
            this.primaryPersonId = this.dataSvc.userInfo.id;
        }
        var route = this.route.routeConfig.path.split('/');
        if (route[0] == 'employeeprofile')
            this.primaryPersonId = Number(this.route.snapshot.params.id);
        this.persons$ = this.dataSvc.get('employees').pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_6__["map"])(function (result) { return result.data; }));
        this.designationCode$ = this.dataSvc.getList('DESIGNATION');
        this.departmentCodes$ = this.dataSvc.getList('DEPARTMENT');
        this.form = this.formBuilder
            .group({
            id: null,
            full_name: [{ value: null, disabled: true }, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required]],
            email: [{ value: null, disabled: true }, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].email]],
            supervisor_emp_id: [{ value: null, disabled: !this.admin }, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required]],
            hr_emp_id: [{ value: null, disabled: !this.admin }, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required]],
            is_admin: [null],
            designation_code: [{ value: null, disabled: !this.admin }, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required]],
            department_code: [{ value: null, disabled: !this.admin }, [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["Validators"].required]]
        });
        if (!this.primaryPersonId) {
            this.router.navigate(['/']);
            return;
        }
        this.dataSvc.get('employees/' + this.primaryPersonId)
            .subscribe(function (result) {
            if (_this_1.uiSvc.error(result))
                return;
            _this_1.form.patchValue(result.data);
            if (result.data.profile_picture) {
                _this_1.loadedPic = result.data.profile_picture;
                _this_1.profilePic = result.data.profile_picture;
            }
            else {
                _this_1.profilePic = null;
            }
        });
    };
    EmployeeProfileComponent.prototype.onFileSelected = function () {
        var types = ["image/png", "image/jpeg"];
        if (this.file.nativeElement.files.length == 0)
            return;
        console.log(this.file.nativeElement.files);
        var file = this.file.nativeElement.files[0];
        if (types.indexOf(file.type) < 0) {
            this.uiSvc.flashError(file.name + ' is not supported');
            return;
        }
        var reader = new FileReader(), _this = this;
        reader.onload = function (e) {
            console.log((e.target['result'] + '0').length);
            _this.profilePic = e.target['result'];
            _this.picUpdated = true;
        };
        reader.readAsDataURL(file);
    };
    EmployeeProfileComponent.prototype.onSubmit = function () {
        var _this_1 = this;
        if (this.admin) {
            if (this.form.dirty) {
                Object.values(this.form.controls)
                    .forEach(function (control) {
                    control.markAsTouched();
                    control.updateValueAndValidity();
                });
                if (this.form.invalid) {
                    this.uiSvc.flashError('Please complete the form before submitting');
                    return;
                }
                var data = this.form.getRawValue();
                this.dataSvc.update('employees/' + this.primaryPersonId, data).subscribe(function (result) {
                    if (_this_1.uiSvc.error(result))
                        return;
                    _this_1.uiSvc.flashSuccess(result.messages.join(', '));
                    _this_1.form.markAsPristine();
                    //this.savePic()
                    _this_1.router.navigate(['/configs', 'employeelist']);
                });
            }
            else {
                //this.savePic()
                this.router.navigate(['/']);
            }
        }
        else {
            //console.log(this.img.nativeElement.src);
            //this.savePic()
            this.router.navigate(['/']);
        }
    };
    EmployeeProfileComponent.prototype.savePic = function () {
        var _this_1 = this;
        if (this.picUpdated) {
            var picdata 
            //console.log(this.imageToDataUri(this.img.nativeElement))
            = void 0;
            //console.log(this.imageToDataUri(this.img.nativeElement))
            if (this.profilePic == this.defaultPic)
                picdata = "";
            else
                picdata = this.imageToDataUri(this.img.nativeElement);
            this.dataSvc.update('employees/' + this.primaryPersonId + '/picture', { profile_picture: picdata }).subscribe(function (result) {
                if (_this_1.uiSvc.error(result))
                    return;
                _this_1.uiSvc.flashSuccess(result.messages.join(', '));
                _this_1.dataSvc.userInfo.profile_picture = _this_1.profilePic;
                _this_1.onCancelClick();
            });
        }
        else {
            this.onCancelClick();
        }
    };
    EmployeeProfileComponent.prototype.openBrowser = function () {
        this.file.nativeElement.click();
    };
    EmployeeProfileComponent.prototype.revertPicture = function () {
        this.file.nativeElement.value = null;
        this.profilePic = this.loadedPic || this.defaultPic;
    };
    EmployeeProfileComponent.prototype.deletePicture = function () {
        this.file.nativeElement.value = null;
        this.profilePic = this.defaultPic;
        this.picUpdated = true;
    };
    EmployeeProfileComponent.prototype.imageToDataUri = function (img) {
        // create an off-screen canvas
        var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        // set its dimension to target size
        canvas.width = 196;
        canvas.height = 196;
        // draw source image into the off-screen canvas:
        ctx.drawImage(img, 0, 0, 196, 196);
        // encode image to data-uri with base64 version of compressed image
        return canvas.toDataURL('image/jpeg', .8);
    };
    Object.defineProperty(EmployeeProfileComponent.prototype, "admin", {
        get: function () {
            if (this.dataSvc.userInfo && this.dataSvc.userInfo.isAdmin)
                return true;
            return false;
        },
        enumerable: true,
        configurable: true
    });
    EmployeeProfileComponent.prototype.onCancelClick = function () {
        this.router.navigate(['/configs', 'employeelist']);
    };
    EmployeeProfileComponent.prototype.hasUnsaved = function () {
        return this.form.dirty;
    };
    EmployeeProfileComponent.prototype.initials = function () {
        if (!this.form || !this.form.get('full_name').value)
            return '--';
        var names = this.form.get('full_name').value.split(' ').map(function (r) { return r.charAt(0).toUpperCase(); });
        return names[0] + (names.length > 1 ? names[names.length - 1] : '');
    };
    EmployeeProfileComponent.ctorParameters = function () { return [
        { type: _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"] },
        { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
        { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"] },
        { type: src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_4__["GlobalDataService"] },
        { type: src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_5__["CommonUIService"] }
    ]; };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('file', { read: false, static: false }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ElementRef"])
    ], EmployeeProfileComponent.prototype, "file", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('img', { read: false, static: false }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ElementRef"])
    ], EmployeeProfileComponent.prototype, "img", void 0);
    EmployeeProfileComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-employee-profile',
            template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./employee-profile.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/config/employee-profile/employee-profile.component.html")).default,
            styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./employee-profile.component.css */ "./src/app/main/config/employee-profile/employee-profile.component.css")).default]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormBuilder"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"],
            src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_4__["GlobalDataService"],
            src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_5__["CommonUIService"]])
    ], EmployeeProfileComponent);
    return EmployeeProfileComponent;
}());



/***/ })

}]);
//# sourceMappingURL=config-config-module.js.map
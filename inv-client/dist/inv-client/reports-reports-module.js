(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["reports-reports-module"],{

/***/ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/reports/generic-report/generic-report.component.html":
/*!*****************************************************************************************************************!*\
  !*** ./node_modules/raw-loader/dist/cjs.js!./src/app/main/reports/generic-report/generic-report.component.html ***!
  \*****************************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("<mat-card class=\"tn-table-card\">\n  <app-table-toolbar [title]=\"reportDetails.title\" [buttons]=\"buttons\" [selectedId] = \"selectedId\" (toolbarAction)=\"toolbarAction($event)\"></app-table-toolbar>\n  <mat-card-content class=\"tn-table-card-content\" #reportTable>\n    <table mat-table [dataSource]=\"dataSource\" matSort >\n      <ng-container [matColumnDef]=\"c\" *ngFor=\"let c of columns\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header [ngClass]=\"'report-col-'+columnDefs[c].type\"> {{columnDefs[c].name}} </th>\n        <td mat-cell *matCellDef=\"let element\" [ngStyle]=\"{ 'text-align': (columnDefs[c].type == 'number' ? 'center' : null) }\"> \n          <span *ngIf=\"columnDefs[c].type == 'text'\">{{ element[c] }} </span>\n          <span *ngIf=\"columnDefs[c].type == 'date'\">{{ element[c] | date: columnDefs[c].format }} </span>\n          <span *ngIf=\"columnDefs[c].type == 'number'\">{{ element[c] | number: columnDefs[c].format }} </span>\n        </td>\n      </ng-container>\n      <tr mat-header-row *matHeaderRowDef=\"columns; sticky: true\"></tr>\n      <tr mat-row \n          *matRowDef=\"let row; columns: columns;\"\n          [ngClass]=\"{'tn-table-row-highlight': highlight(row)}\"\n          (click)=\"click(row)\"\n      ></tr>\n    </table>\n  </mat-card-content>\n  <mat-paginator [pageSize]=\"rowsPerPage\" [pageSizeOptions]=\"[10, 15, 20, 50]\"></mat-paginator>\n</mat-card>\n");

/***/ }),

/***/ "./src/app/main/reports/generic-report/generic-report.component.css":
/*!**************************************************************************!*\
  !*** ./src/app/main/reports/generic-report/generic-report.component.css ***!
  \**************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL21haW4vcmVwb3J0cy9nZW5lcmljLXJlcG9ydC9nZW5lcmljLXJlcG9ydC5jb21wb25lbnQuY3NzIn0= */");

/***/ }),

/***/ "./src/app/main/reports/generic-report/generic-report.component.ts":
/*!*************************************************************************!*\
  !*** ./src/app/main/reports/generic-report/generic-report.component.ts ***!
  \*************************************************************************/
/*! exports provided: GenericReportComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GenericReportComponent", function() { return GenericReportComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/service/global-data.service */ "./src/app/service/global-data.service.ts");
/* harmony import */ var src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/mat/common-ui.service */ "./src/app/mat/common-ui.service.ts");
/* harmony import */ var _angular_material_table__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/material/table */ "./node_modules/@angular/material/esm5/table.es5.js");
/* harmony import */ var _angular_material_paginator__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/material/paginator */ "./node_modules/@angular/material/esm5/paginator.es5.js");
/* harmony import */ var _angular_material_sort__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/material/sort */ "./node_modules/@angular/material/esm5/sort.es5.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");









var GenericReportComponent = /** @class */ (function () {
    function GenericReportComponent(router, dataSvc, uiSvc, route) {
        this.router = router;
        this.dataSvc = dataSvc;
        this.uiSvc = uiSvc;
        this.route = route;
        this.reportDetails = {
            title: '',
            description: '',
            dataExport: true
        };
        this.defaultFormats = {
            date: 'y/MM/dd',
            number: '1.0'
        };
        this.formatter = {
            date: function (v, f) { return Object(_angular_common__WEBPACK_IMPORTED_MODULE_8__["formatDate"])(v, f, 'en_GB'); },
            number: function (v, f) { return Object(_angular_common__WEBPACK_IMPORTED_MODULE_8__["formatNumber"])(v, 'en_GB', f); },
            text: function (v, f) { return v; },
            boolean: function (v, f) { return v ? 'Y' : 'N'; }
        };
        this.columnDefs = {};
        this.columns = [];
        this.exportColumns = [];
        this.idCounter = 1;
        this.dataSource = new _angular_material_table__WEBPACK_IMPORTED_MODULE_5__["MatTableDataSource"]();
        this.rowsPerPage = 10;
    }
    Object.defineProperty(GenericReportComponent.prototype, "buttons", {
        get: function () {
            return this.reportDetails.dataExport ? {
                export: { label: ' Export', event: 'export', currentRecord: false, icon: 'cloud_download' },
            } : {};
        },
        enumerable: true,
        configurable: true
    });
    GenericReportComponent.prototype.ngOnInit = function () {
        this.loadAPI = this.route.snapshot.params.name;
        this.init();
    };
    GenericReportComponent.prototype.init = function () {
        this.getList();
        this.router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };
    };
    GenericReportComponent.prototype.ngAfterViewInit = function () {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        var rpp = (this.reportTable.nativeElement.offsetHeight - 56) / 50;
        this.rowsPerPage = rpp < 15 ? 10 : (rpp < 20 ? 15 : 20);
    };
    GenericReportComponent.prototype.doFilter = function (value) {
        this.dataSource.filter = value.trim().toLocaleLowerCase();
    };
    GenericReportComponent.prototype.click = function (row) {
        console.log(row);
        this.selectedId = row.id;
    };
    GenericReportComponent.prototype.highlight = function (row) {
        return row.id ? this.selectedId == row.id : false;
    };
    GenericReportComponent.prototype.toolbarAction = function (event) {
        switch (event.action) {
            case 'filter':
                this.doFilter(event.value);
                break;
            case 'export':
                this.export();
                break;
        }
    };
    GenericReportComponent.prototype.getList = function () {
        var _this = this;
        this.dataSvc.get(this.loadAPI)
            .subscribe(function (result) {
            if (_this.uiSvc.error(result))
                return;
            _this.setupColumns(result.data.metaData);
            _this.reportDetails = result.data.reportLevelMetaData;
            setTimeout(function () {
                _this.dataSource.data = result.data.reportData.map(function (r) { return r.id ? r : tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, r, { id: _this.idCounter++ }); });
            }, 1000);
        });
    };
    GenericReportComponent.prototype.setupColumns = function (metadata) {
        var _this = this;
        metadata.forEach(function (m) {
            _this.exportColumns.push(m.key);
            if (!(m.display == 'N'))
                _this.columns.push(m.key);
            m.format = m.format ? m.format : _this.defaultFormats[m.type];
            _this.columnDefs[m.key] = m;
        });
    };
    GenericReportComponent.prototype.export = function () {
        var _this = this;
        var data = this.dataSource.data.map(function (r) { return _this.exportColumns.map(function (c) { return _this.formatter[_this.columnDefs[c]['type']](r[c], _this.columnDefs[c]['format']); }); });
        data.splice(0, 0, this.exportColumns.map(function (c) { return _this.columnDefs[c]['name']; }));
        var str = data.map(function (row) { return row.map(function (column) { return  true ? column : undefined; }).join(","); })
            .reduce(function (concatString, curString) { return concatString + "\n" + curString; });
        var link = document.createElement('a');
        link.setAttribute('download', 'export.csv');
        link.setAttribute('href', 'data:text/plain;base64,' + this.encodeToBase64(str));
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
    GenericReportComponent.prototype.encodeToBase64 = function (input) {
        var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
        input = this._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2))
                enc3 = enc4 = 64;
            else if (isNaN(chr3))
                enc4 = 64;
            output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    };
    GenericReportComponent.prototype._utf8_encode = function (string) {
        var utftext = "";
        string = string.replace(/\r\n/g, "\n");
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128)
                utftext += String.fromCharCode(c);
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    GenericReportComponent.ctorParameters = function () { return [
        { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] },
        { type: src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_3__["GlobalDataService"] },
        { type: src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__["CommonUIService"] },
        { type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"] }
    ]; };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])('reportTable', { static: true }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_1__["ElementRef"])
    ], GenericReportComponent.prototype, "reportTable", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_angular_material_sort__WEBPACK_IMPORTED_MODULE_7__["MatSort"], { static: true }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_material_sort__WEBPACK_IMPORTED_MODULE_7__["MatSort"])
    ], GenericReportComponent.prototype, "sort", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_angular_material_paginator__WEBPACK_IMPORTED_MODULE_6__["MatPaginator"], { static: true }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_material_paginator__WEBPACK_IMPORTED_MODULE_6__["MatPaginator"])
    ], GenericReportComponent.prototype, "paginator", void 0);
    GenericReportComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-generic-report',
            template: tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! raw-loader!./generic-report.component.html */ "./node_modules/raw-loader/dist/cjs.js!./src/app/main/reports/generic-report/generic-report.component.html")).default,
            styles: [tslib__WEBPACK_IMPORTED_MODULE_0__["__importDefault"](__webpack_require__(/*! ./generic-report.component.css */ "./src/app/main/reports/generic-report/generic-report.component.css")).default]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"],
            src_app_service_global_data_service__WEBPACK_IMPORTED_MODULE_3__["GlobalDataService"],
            src_app_mat_common_ui_service__WEBPACK_IMPORTED_MODULE_4__["CommonUIService"],
            _angular_router__WEBPACK_IMPORTED_MODULE_2__["ActivatedRoute"]])
    ], GenericReportComponent);
    return GenericReportComponent;
}());



/***/ }),

/***/ "./src/app/main/reports/reports.module.ts":
/*!************************************************!*\
  !*** ./src/app/main/reports/reports.module.ts ***!
  \************************************************/
/*! exports provided: ReportsModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReportsModule", function() { return ReportsModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var src_app_mat_mat_module__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/app/mat/mat.module */ "./src/app/mat/mat.module.ts");
/* harmony import */ var _reports_routing__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./reports.routing */ "./src/app/main/reports/reports.routing.ts");
/* harmony import */ var _generic_report_generic_report_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./generic-report/generic-report.component */ "./src/app/main/reports/generic-report/generic-report.component.ts");







var ReportsModule = /** @class */ (function () {
    function ReportsModule() {
    }
    ReportsModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _generic_report_generic_report_component__WEBPACK_IMPORTED_MODULE_6__["GenericReportComponent"]
            ],
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["ReactiveFormsModule"],
                src_app_mat_mat_module__WEBPACK_IMPORTED_MODULE_4__["MatModule"],
                _reports_routing__WEBPACK_IMPORTED_MODULE_5__["ReportsRouting"],
            ],
            entryComponents: []
        })
    ], ReportsModule);
    return ReportsModule;
}());



/***/ }),

/***/ "./src/app/main/reports/reports.routing.ts":
/*!*************************************************!*\
  !*** ./src/app/main/reports/reports.routing.ts ***!
  \*************************************************/
/*! exports provided: ReportsRouting */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ReportsRouting", function() { return ReportsRouting; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _generic_report_generic_report_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./generic-report/generic-report.component */ "./src/app/main/reports/generic-report/generic-report.component.ts");



var routes = [
    { path: ':name', component: _generic_report_generic_report_component__WEBPACK_IMPORTED_MODULE_2__["GenericReportComponent"] },
];
var ReportsRouting = _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forChild(routes);


/***/ })

}]);
//# sourceMappingURL=reports-reports-module.js.map
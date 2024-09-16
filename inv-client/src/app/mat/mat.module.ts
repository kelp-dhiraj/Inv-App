import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FlexLayoutModule } from '@angular/flex-layout'
import { FormsModule, ReactiveFormsModule }   from '@angular/forms'

import { 
  MatButtonModule, 
  MatInputModule, 
  MatDatepickerModule,
  MatIconModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatDialogModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule,
  MatExpansionModule,
  MatTabsModule,
  MatSelectModule,
  MatCheckboxModule,
  MatAutocompleteModule,
  MatProgressBarModule,
  MatChipsModule,
  MatBadgeModule,
  MatTooltipModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MAT_DATE_LOCALE,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatCardModule, 

} from '@angular/material'
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter'

import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component'
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component'

import { CommonUIService } from './common-ui.service'
import { CommonDeActivateGuard } from './common-deactivate.guard'

import { PASlideControlComponent } from './components/pa-slide-control.component'
import { PAOverflowMenuComponent } from './components/pa-overflow-menu.component'
import { PACharCountComponent } from './components/pa-char-count.component'
import { TableToolbarComponent } from './table-toolbar/table-toolbar.component'
import { PASlidingRadioComponent } from './components/pa-sliding-radio.components'

import { PAChipListControl } from './custom-controls/pa-chip-list.component'
import { PAPercentageInputControl } from './custom-controls/pa-percentage-input.component'
import { PADropdownButtonsComponent } from './components/pa-dropdown-buttons.component'


@NgModule({
  declarations: [
    ConfirmDialogComponent,
    TableToolbarComponent,
    UploadDialogComponent,
    PASlideControlComponent,
    PAOverflowMenuComponent,
    PACharCountComponent,
    PAChipListControl,
    PAPercentageInputControl,
    PASlidingRadioComponent,
    PADropdownButtonsComponent
  ],
  
  imports: [
    FlexLayoutModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule, 
    MatInputModule, 
    MatMomentDateModule,
    MatDatepickerModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
  ],

  exports: [
    FlexLayoutModule,
    MatButtonModule, 
    MatInputModule,  
    MatMomentDateModule,
    MatDatepickerModule,
    MatIconModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatExpansionModule,
    MatTabsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    PASlideControlComponent,
    PAOverflowMenuComponent,
    PACharCountComponent,
    TableToolbarComponent,
    PAChipListControl,
    PAPercentageInputControl,
    PASlidingRadioComponent,
    PADropdownButtonsComponent
  ],

  entryComponents: [
    ConfirmDialogComponent,
    UploadDialogComponent
  ],

  providers:[
    CommonUIService,
    CommonDeActivateGuard,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
  ]
})
  
export class MatModule { }

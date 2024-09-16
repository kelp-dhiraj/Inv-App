import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core'
import { Observable } from 'rxjs'
import { MatInput } from '@angular/material'

@Component({
  selector: 'app-table-toolbar',
  templateUrl: './table-toolbar.component.html',
  styleUrls: ['./table-toolbar.component.css']
})

export class TableToolbarComponent implements OnInit{
  
  @Input() title: string
  @Input() buttons: any | Observable<any>
  @Input() selectedId: number


  @Output() toolbarAction = new EventEmitter()

  buttonsArray: any=[]

  defaultButtons = {
    create: { label: 'Create', event: 'create', currentRecord: false, icon: 'add_box' },
    edit: { label: 'Edit', event: 'edit', currentRecord: true, icon: 'edit' },
    delete: { label: 'Delete', event: 'delete', currentRecord: true, icon: 'delete' }
  }

  @ViewChild(MatInput, {read: false, static: false}) filter: MatInput

  constructor( ) { }

  ngOnInit() {
    if (this.buttons instanceof Observable) {
      this.buttons
        .subscribe(
          buttons => this.setupButtons(buttons)
        )
    } else {
      this.setupButtons(this.buttons)
    }
  }

  setupButtons(buttons) {
    if (!buttons) buttons = this.defaultButtons

    Object.keys(buttons).forEach((k) => {
      let button
      if (buttons[k] === 'default') button = this.defaultButtons[k]
      else button = buttons[k]
      if (button) this.buttonsArray.push(button)
    })
  }
  
  onClick(action) {
    this.toolbarAction.emit({action: action})
  }

  onKeyUp(value) {
    this.toolbarAction.emit({action: "filter", value: value})
  }

  isDisabled(name) {
    let b = this.buttonsArray.find((b) => b.event == name)
    if (b.currentRecord && !this.selectedId) return true
    return false
  }

  setFilter(val) {
    this.filter.value = val
    this.onKeyUp(val)
  }

}

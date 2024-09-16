import { Component, Input } from '@angular/core'

@Component({
  selector: 'pa-char-count',
  template: `
        <span>{{value? value.length : 0}} / {{max}}</span>
    `,
})

export class PACharCountComponent {

  @Input() max: number
  @Input() value: string
  
  constructor() { }

}
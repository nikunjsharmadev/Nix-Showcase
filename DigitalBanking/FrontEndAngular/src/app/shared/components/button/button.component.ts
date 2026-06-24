import { Component, Input } from '@angular/core';

@Component({
    selector: 'bnk-button',
    imports: [],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() buttonClass = '';
  @Input() active = false;
  @Input() type = '';
  @Input() isDisabled = false;
}

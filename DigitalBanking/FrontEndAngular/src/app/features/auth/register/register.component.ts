import { Component, Input } from '@angular/core';
import { FormControlComponent } from '../../../shared/components/form-control/form-control.component';

@Component({
    selector: 'bnk-register',
    imports: [FormControlComponent],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
  @Input() registerTab: boolean = false;
}

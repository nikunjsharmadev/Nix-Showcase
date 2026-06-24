import { Component, Input } from '@angular/core';
import { FormControlComponent } from '../../../shared/components/form-control/form-control.component';

@Component({
    selector: 'bnk-login',
    imports: [FormControlComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  @Input() loginTab: boolean = false;
}

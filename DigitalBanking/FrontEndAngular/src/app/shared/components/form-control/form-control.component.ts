import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { FormErrorMsgComponent } from '../form-error-msg/form-error-msg.component';
@Component({
    selector: 'bnk-form-control',
    imports: [ButtonComponent, ReactiveFormsModule, FormErrorMsgComponent],
    templateUrl: './form-control.component.html',
    styleUrl: './form-control.component.scss'
})
export class FormControlComponent {
  @Input() useType: string = '';
  formControls = {
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  };
  loginForm = new FormGroup({
    ...this.formControls,
    saveDevice: new FormControl('', [Validators.required]),
  });

  registerForm = new FormGroup({
    ...this.formControls,
    fullName: new FormControl('', [Validators.required]),
    acceptTerms: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    console.log(this.loginForm.value);
  }

  checkElementValidation(controlName: string): boolean {
    const control: AbstractControl | null = this.loginForm.get(controlName);
    return (control?.invalid && (control?.dirty || control?.touched)) ?? false;
  }
}

import { Component, inject, Input } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import {
  APP_STRING_LITERALS,
  VALIDATION_ERRORS,
} from '../../../core/data/const';
import { AuthService } from '../../../core/services/service';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest } from '../../../core/data/type';
@Component({
  selector: 'bnk-form-control',
  imports: [ReactiveFormsModule],
  templateUrl: './form-control.component.html',
  styleUrl: './form-control.component.scss',
})
export class FormControlComponent {
  @Input() useType: string = 'login';
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
  private authervice = inject(AuthService);
  private router = inject(Router);
  isApiCalling = false;
  formControls = {
    email: new FormControl('nikunj.patel@example.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('MySecurePassword123!', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  };
  loginForm = new FormGroup({
    ...this.formControls,
    saveDevice: new FormControl(true, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });
  registerForm = new FormGroup({
    ...this.formControls,
    firstName: new FormControl('nikunj', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('sha', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl('9082343562', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    retypePassword: new FormControl('MySecurePassword123!', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    acceptTerms: new FormControl(true, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  async onSubmit(formType: string) {
    switch (formType) {
      case 'login':
        {
          if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
          }
          const formValues: LoginRequest = this.loginForm.getRawValue();
          this.isApiCalling = true;
          await new Promise((resolve) => {
            setTimeout(resolve, 5000);
          });
          this.authervice.loginUser(formValues).subscribe({
            next: () => {
              this.isApiCalling = false;
              this.router.navigate(['/']);
            },
            error: () => {
              this.isApiCalling = false;
            },
          });
        }
        break;
      case 'register':
        {
          if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
          }
          const formValues: RegisterRequest = this.registerForm.getRawValue();
          this.isApiCalling = true;
          this.authervice.registerUser(formValues).subscribe({
            next: () => {
              this.isApiCalling = false;
            },
            error: () => {
              this.isApiCalling = false;
            },
          });
        }
        break;
    }
  }
  checkElementValidation(controlName: string, formType: string): boolean {
    const control: AbstractControl | null =
      formType === 'login'
        ? this.loginForm.get(controlName)
        : this.registerForm.get(controlName);
    return (control?.invalid && (control?.dirty || control?.touched)) ?? false;
  }
  getValidationMessage(controlName: string, formType: string): string {
    const control: AbstractControl | null =
      formType === 'login'
        ? this.loginForm.get(controlName)
        : this.registerForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';
    const firstError = Object.keys(control.errors)[0];
    return VALIDATION_ERRORS[firstError] ?? '';
  }
}

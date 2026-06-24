import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
const VALIDATION_ERRORS: Record<string, string> = {
  required: 'This field is required',
  email: 'Invalid email address',
  minlength: 'Too short',
};
@Component({
    selector: 'bnk-form-error-msg',
    imports: [],
    templateUrl: './form-error-msg.component.html',
    styleUrl: './form-error-msg.component.scss'
})
export class FormErrorMsgComponent {
  @Input() control!: AbstractControl | null;

  get errorMessage(): string {
    if (!this.control || !this.control.errors || !this.control.touched)
      return '';
    const firstError = Object.keys(this.control.errors)[0];
    return VALIDATION_ERRORS[firstError] ?? '';
  }
}

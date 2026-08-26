import { Component, effect, inject, Input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { serviceFactory } from '../../core/services/service';
import { constantFactory } from '../../core/constants/const';
import { AuthTab, LoginRequest, RegisterRequest } from '../../core/data/type';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
const { APP_STRING_LITERALS, VALIDATION_ERRORS } = constantFactory;
const { AuthService, AuthContextService } = serviceFactory;
//AUTH LAYOUT
@Component({
  selector: `bnk-auth-layout`,
  template: `<!--  -->
    <section class="auth-viewport">
      <section class="auth-sidebar-brand" aria-hidden="true">
        <section class="brand-info">
          <section class="mini-badge">{{ STRING_LITERALS[0] }}</section>
          <h2>{{ STRING_LITERALS[1] }}</h2>
        </section>
      </section>
      <section class="auth-form-space">
        <section class="auth-card-box">
          <ng-content select="bnk-tab" />
          <section class="auth-container">
            <ng-content select="bnk-login" />
            <ng-content select="bnk-register" />
          </section>
          <ng-content select=".verify-container" />
        </section>
      </section>
    </section>`,
})
class AuthLayoutComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
}
// FORM CONTROL
@Component({
  selector: `bnk-form`,
  imports: [ReactiveFormsModule],
  template: ` <!--  -->
    @switch (useType) {
      @case ('login') {
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit('login')" autocomplete="on">
          <div class="form-field" [class.error-state]="checkElementValidation('email', 'login')">
            <label for="login-user">Username / Email</label>
            <input type="email" required placeholder="client@banking.ca" autocomplete="username" formControlName="email" id="login-user" />
            @if (getValidationMessage('email', 'login')) {
              <span class="error-text">{{ getValidationMessage('email', 'login') }}</span>
            }
          </div>
          <div class="form-field" [class.error-state]="checkElementValidation('password', 'login')">
            <div class="field-label-split">
              <label for="login-pass">Password</label>
              <a href="#" class="inline-link">Forgot Password?</a>
            </div>
            <input type="text" required placeholder="••••••••" autocomplete="current-password" formControlName="password" id="login-pass" />
            @if (getValidationMessage('password', 'login')) {
              <span class="error-text">{{ getValidationMessage('password', 'login') }}</span>
            }
          </div>
          <div class="form-utils" [class.error-state]="checkElementValidation('saveDevice', 'login')">
            <label class="custom-checkbox">
              <input type="checkbox" id="remember-device" formControlName="saveDevice" required />
              <span class="checkmark"></span>
              save this device for future authentication
            </label>
          </div>
          <button [disabled]="isApiCalling" type="submit" class="btn-primary-action">
            {{ isApiCalling ? 'Loading...' : 'Authorize & Enter' }}
          </button>
        </form>
      }
      @case ('register') {
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit('register')" autocomplete="on">
          <section class="two-control">
            <div class="form-field" [class.error-state]="checkElementValidation('firstName', 'register')">
              <label for="reg-firstName">First Name</label>
              <input type="text" id="reg-firstName" required placeholder="first name" autocomplete="true" formControlName="firstName" />
              @if (getValidationMessage('firstName', 'register')) {
                <span class="error-text">{{ getValidationMessage('firstName', 'register') }}</span>
              }
            </div>
            <div class="form-field" [class.error-state]="checkElementValidation('lastName', 'register')">
              <label for="reg-lastName">Last Name</label>
              <input type="text" id="reg-lastName" required placeholder="last name" autocomplete="true" formControlName="lastName" />
              @if (getValidationMessage('lastName', 'register')) {
                <span class="error-text">{{ getValidationMessage('lastName', 'register') }}</span>
              }
            </div>
          </section>

          <div class="form-field" [class.error-state]="checkElementValidation('email', 'register')">
            <label for="reg-email">Email</label>
            <input type="email" id="reg-email" required placeholder="customer@bank.ca" autocomplete="email" formControlName="email" />
            @if (getValidationMessage('email', 'register')) {
              <span class="error-text">{{ getValidationMessage('email', 'register') }}</span>
            }
          </div>
          <div class="form-field" [class.error-state]="checkElementValidation('password', 'register')">
            <label for="reg-password">Password</label>
            <input type="password" id="reg-password" required placeholder="••••••••" aria-describedby="reg-pass-error" autocomplete="new-password" formControlName="password" />
            @if (getValidationMessage('password', 'register')) {
              <span class="error-text">{{ getValidationMessage('password', 'register') }}</span>
            }
          </div>
          <div class="form-field" [class.error-state]="checkElementValidation('retypePassword', 'register')">
            <label for="reg-retypepassword">Retype Password</label>
            <input type="password" id="reg-retypepassword" required placeholder="••••••••" aria-describedby="reg-re-pass-error" autocomplete="true" formControlName="retypePassword" />
            @if (getValidationMessage('retypePassword', 'register')) {
              <span class="error-text">{{ getValidationMessage('retypePassword', 'register') }}</span>
            }
          </div>
          <div class="form-utils" [class.error-state]="checkElementValidation('acceptTerms', 'register')">
            <label class="custom-checkbox">
              <input type="checkbox" id="terms-agree" required formControlName="acceptTerms" />
              <span class="checkmark"></span>
              I accept all terms and conditions
            </label>
          </div>
          <button type="submit" class="btn-primary-action">Register Identity</button>
        </form>
      }
    }`,
})
class FormControlComponent {
  @Input() useType: string = 'login';
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
  private authervice = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  isApiCalling = false;
  formControls = {
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  };
  loginForm = new FormGroup({
    ...this.formControls,
    saveDevice: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });
  registerForm = new FormGroup({
    ...this.formControls,
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    retypePassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    acceptTerms: new FormControl(false, {
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
            setTimeout(resolve, 1000);
          });
          this.authervice.loginUser(formValues).subscribe({
            next: () => {
              this.isApiCalling = false;
              const returnUrl = this.route.snapshot.queryParamMap.get(`returnUrl`) ?? `/dashboard`;
              this.router.navigateByUrl(returnUrl);
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
    const control: AbstractControl | null = formType === 'login' ? this.loginForm.get(controlName) : this.registerForm.get(controlName);
    return (control?.invalid && (control?.dirty || control?.touched)) ?? false;
  }
  getValidationMessage(controlName: string, formType: string): string {
    const control: AbstractControl | null = formType === 'login' ? this.loginForm.get(controlName) : this.registerForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';
    const firstError = Object.keys(control.errors)[0];
    return VALIDATION_ERRORS[firstError] ?? '';
  }
}
// REGISTER
@Component({
  selector: `bnk-register`,
  imports: [FormControlComponent],
  template: `<section [class.active]="registerTab" id="section-register" class="auth-panel" role="tabpanel" aria-labelledby="toggle-register">
    <div class="panel-intro">
      <h3>{{ STRING_LITERALS[0] }}</h3>
      <p>{{ STRING_LITERALS[1] }}</p>
    </div>
    <bnk-form useType="register" />
  </section>`,
})
class RegisterComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-register'];
  private ctx = inject(AuthContextService);
  registerTab: boolean = this.ctx.activeTab() === AuthTab.Register;
  constructor() {
    effect(() => {
      this.registerTab = this.ctx.activeTab() === AuthTab.Register;
    });
  }
}
// LOGIN
@Component({
  selector: `bnk-login`,
  imports: [FormControlComponent],
  template: `<!--  -->
    <section [class.active]="fullyRendered() && loginTab" id="section-login" class="auth-panel" role="tabpanel" aria-labelledby="toggle-login">
      <section class="panel-intro">
        <h3>{{ STRING_LITERALS[0] }}</h3>
        <p>{{ STRING_LITERALS[1] }}</p>
      </section>
      <bnk-form useType="login" />
    </section>`,
})
class LoginComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-login'];
  private ctx = inject(AuthContextService);
  loginTab: boolean = false;
  fullyRendered = signal(false);
  constructor() {
    effect(() => {
      this.loginTab = this.ctx.activeTab() === AuthTab.Login;
    });
  }
  ngAfterViewInit() {
    requestAnimationFrame(() => {
      this.fullyRendered.set(true);
    });
  }
}
// TAB CONTROL
@Component({
  selector: `bnk-tab`,
  imports: [],
  template: `<!--  -->
    <section class="auth-tab-row" role="tablist" aria-label="Account Authorization">
      <button (click)="onTabChange(authTab.Login)" [class.active]="activeTab === authTab.Login" role="tab" class="tab-btn" aria-controls="section-login">
        {{ STRING_LITERALS[2] }}
      </button>
      <button (click)="onTabChange(authTab.Register)" [class.active]="activeTab === authTab.Register" role="tab" class="tab-btn" aria-controls="section-register">
        {{ STRING_LITERALS[3] }}
      </button>
    </section>`,
})
class TabComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
  private ctx = inject(AuthContextService);
  authTab = AuthTab;
  activeTab: AuthTab = this.ctx.activeTab();
  onTabChange(tab: AuthTab) {
    this.activeTab = tab;
    this.ctx.activeTab.set(tab);
  }
}

// EMAIL VARIFICATION
@Component({
  selector: 'bnk-verify-email',
  imports: [RouterLink, AuthLayoutComponent],
  template: `<!--  -->
    <bnk-auth-layout>
      <div class="verify-container">
        @switch (status) {
          @case ('loading') {
            <div class="icon loading"><div class="spinner"></div></div>
          }
          @case ('success') {
            <div class="icon success">✅</div>
          }
          @case ('error') {
            <div class="icon error">❌</div>
          }
        }
        <h1>
          @switch (status) {
            @case ('loading') {
              Verifing email
            }
            @case ('success') {
              Email verified
            }
            @case ('error') {
              Verification Failed
            }
          }
        </h1>
        <p>
          @switch (status) {
            @case ('loading') {
              please wait while we are verify email address
            }
            @case ('success') {
              your email has been verified successfully, you can login to your account
            }
            @case ('error') {
              this verification link is invalid or has expired
            }
          }
        </p>
        @if (status === 'success') {
          <button routerLink="/auth">Go to Login</button>
        }
        @if (status === 'error') {
          <button routerLink="/auth/resend-verification">Resend Varification Email</button>788
        }
      </div>
    </bnk-auth-layout>`,
})
export class EmailVerificationComponent {
  status: 'loading' | 'success' | 'error' = 'loading';
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  async ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token === null) {
      this.router.navigate(['/page-not-found']);
      return;
    }
    this.authService.verifyEmail(token).subscribe({
      next: (result: { data: { isVerified: boolean }; success: boolean }) => {
        if (result.data.isVerified) {
          this.status = 'success';
        }
      },
      error: () => {
        this.status = 'error';
      },
    });
  }
}
// AUTH
@Component({
  selector: `bnk-auth`,
  imports: [AuthLayoutComponent, TabComponent, LoginComponent, RegisterComponent],
  template: `<!--  -->
    <bnk-auth-layout>
      <bnk-tab />
      <bnk-login />
      <bnk-register />
    </bnk-auth-layout>`,
})
export class AuthComponent {}

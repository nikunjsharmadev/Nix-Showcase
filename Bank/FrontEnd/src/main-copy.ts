import { bootstrapApplication } from '@angular/platform-browser';
import {
  Component,
  EnvironmentProviders,
  provideZoneChangeDetection,
  Input,
  Injectable,
  inject,
  provideAppInitializer,
  signal,
  effect,
} from '@angular/core';
import {
  ActivatedRoute,
  CanActivateFn,
  provideRouter,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { ROUTES } from './routes-copy';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  catchError,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  tap,
} from 'rxjs';
import { ENVIRONMENT } from './environments/environment';
//-------------------------------------------------------
// CONSTS
export const APP_PROVIDERS: EnvironmentProviders[] = [
  provideAppInitializer(async () => {
    const health = inject(HealthService);
    const state = inject(AppStateService);
    try {
      await firstValueFrom(health.check());
      state.serverOnline.set(true);
    } catch {
      state.serverOnline.set(false);
    }
  }),
  provideRouter(ROUTES),
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideHttpClient(),
] as const;
export const APP_STRING_LITERALS = {
  'bnk-auth': [
    'System Secure🔒',
    'Digital Banking Platform',
    'Sign In🔑',
    'Register🏷️',
  ],
  'bnk-login': [
    'Welcome Back',
    'Input your credentials to initialize your secure banking session.',
  ],
  'bnk-register': [
    'Register Banking Profile',
    'Setup digital credentials to connect your bank accounts.',
  ],
};
export const VALIDATION_ERRORS: { [key: string]: string } = {
  required: 'This field is required*',
  email: 'Invalid email address*',
  minlength: 'Too short*',
} as const;
export const BACKEND_URLS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    verifyEmail: '/auth/verify-email',
    me: '/me',
  },
};
//--------------------------------------------------------
// TYPES
export type httpMethods = 'get' | 'post';
export enum AuthTab {
  Login = 'login',
  Register = 'register',
}
export type LoginRequest = {
  email: string;
  password: string;
};
export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  acceptTerms: boolean;
};
export type LoginResponse = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
};
//----------------------------------------------------------------------------
// GUARDS
export function Guards() {
  const auth: CanActivateFn = () => {
    const authService = inject(AuthService);
    const appStateService = inject(AppStateService);
    const router = inject(Router);
    if (appStateService.initialized()) {
      const user_ = appStateService.loggedUser();
      return Object.keys(user_).length > 0;
    }
    return authService.checkMe().pipe(
      map(() => true),
      catchError((err) => {
        if (err.status === 401) {
          return of(router.createUrlTree(['/auth']));
        }
        return of(router.createUrlTree(['/page-not-found']));
      }),
      finalize(() => {
        appStateService.initialized.set(true);
      }),
    );
  };
  return {
    auth,
  };
}
//--------------------------------------------------------------------------------
// SERVICES
// AUTH CONTEXT
@Injectable({ providedIn: 'root' })
export class AuthContextService {
  activeTab = signal<AuthTab>(AuthTab.Login);
}
// APP STATE SERVICE
@Injectable({ providedIn: 'root' })
export class AppStateService {
  readonly serverOnline = signal(false);
  readonly loggedUser = signal<LoginResponse>({});
  readonly initialized = signal(false);
}
// SERVER HEALTH CHECK
@Injectable({ providedIn: 'root' })
export class HealthService {
  private http = inject(HttpClient);
  check() {
    return this.http.get(`${ENVIRONMENT.apiUrl}`);
  }
}
// AUTH SERVICE
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiService = inject(ApiService);
  private appStateService = inject(AppStateService);
  checkMe(): Observable<boolean> {
    return this.apiService.api<LoginResponse>(BACKEND_URLS.auth.me, 'get').pipe(
      tap((user) => {
        this.appStateService.loggedUser.set(user);
      }),
      map(() => true),
    );
  }
  loginUser(payload: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .api<LoginResponse>(BACKEND_URLS.auth.login, 'post', payload)
      .pipe(
        tap((user: LoginResponse) => {
          this.appStateService.loggedUser.set(user);
        }),
      );
  }
  registerUser(payload: RegisterRequest): Observable<LoginResponse> {
    return this.apiService.api<LoginResponse>(
      BACKEND_URLS.auth.register,
      'post',
      payload,
    );
  }
  verifyEmail(
    token: string,
  ): Observable<{ data: { isVerified: boolean }; success: boolean }> {
    return this.apiService.api<{
      data: { isVerified: boolean };
      success: boolean;
    }>(BACKEND_URLS.auth.verifyEmail + '?token=' + token, 'get');
  }
}
// API SERVICE
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  api<T>(url: string, method: httpMethods, payload?: any): Observable<T> {
    switch (method) {
      case 'get': {
        return this.http[method]<T>(`${ENVIRONMENT.apiUrl + url}`, {
          withCredentials: true,
        });
      }
      case 'post': {
        return this.http[method]<T>(`${ENVIRONMENT.apiUrl + url}`, payload, {
          withCredentials: true,
        });
      }
    }
  }
}
//----------------------------------------------------------------------------
// COMPONENTS
// AUTH LAYOUT
@Component({
  selector: 'bnk-auth-layout',
  imports: [],
  template: `
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
    </section>
  `,
})
export class AuthLayoutComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
}
// EMAIL VARIFICATION
@Component({
  selector: 'bnk-verify-email',
  standalone: true,
  imports: [RouterLink, AuthLayoutComponent],
  template: `
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
              your email has been verified successfully, you can login to your
              account
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
          <button routerLink="/auth/resend-verification">
            Resend Varification Email</button
          >788
        }
      </div>
    </bnk-auth-layout>
  `,
})
export class VefifyEmailComponent {
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
// FORM CONTROL
@Component({
  selector: 'bnk-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `@switch (useType) {
    @case ('login') {
      <form
        [formGroup]="loginForm"
        (ngSubmit)="onSubmit('login')"
        autocomplete="on"
      >
        <div
          class="form-field"
          [class.error-state]="checkElementValidation('email', 'login')"
        >
          <label for="login-user">Username / Email</label>
          <input
            type="email"
            required
            placeholder="client@banking.ca"
            autocomplete="username"
            formControlName="email"
            id="login-user"
          />
          @if (getValidationMessage('email', 'login')) {
            <span class="error-text">{{
              getValidationMessage('email', 'login')
            }}</span>
          }
        </div>
        <div
          class="form-field"
          [class.error-state]="checkElementValidation('password', 'login')"
        >
          <div class="field-label-split">
            <label for="login-pass">Password</label>
            <a href="#" class="inline-link">Forgot Access?</a>
          </div>
          <input
            type="text"
            required
            placeholder="••••••••"
            autocomplete="current-password"
            formControlName="password"
            id="login-pass"
          />
          @if (getValidationMessage('password', 'login')) {
            <span class="error-text">{{
              getValidationMessage('password', 'login')
            }}</span>
          }
        </div>
        <div
          class="form-utils"
          [class.error-state]="checkElementValidation('saveDevice', 'login')"
        >
          <label class="custom-checkbox">
            <input
              type="checkbox"
              id="remember-device"
              formControlName="saveDevice"
              required
            />
            <span class="checkmark"></span>
            save this device for future authentication
          </label>
        </div>
        <button
          [disabled]="isApiCalling"
          type="submit"
          class="btn-primary-action"
        >
          {{ isApiCalling ? 'Loading...' : 'Authorize & Enter' }}
        </button>
      </form>
    }
    @case ('register') {
      <form
        [formGroup]="registerForm"
        (ngSubmit)="onSubmit('register')"
        autocomplete="on"
      >
        <section class="two-control">
          <div
            class="form-field"
            [class.error-state]="
              checkElementValidation('firstName', 'register')
            "
          >
            <label for="reg-firstName">First Name</label>
            <input
              type="text"
              id="reg-firstName"
              required
              placeholder="first name"
              autocomplete="true"
              formControlName="firstName"
            />
            @if (getValidationMessage('firstName', 'register')) {
              <span class="error-text">{{
                getValidationMessage('firstName', 'register')
              }}</span>
            }
          </div>
          <div
            class="form-field"
            [class.error-state]="checkElementValidation('lastName', 'register')"
          >
            <label for="reg-lastName">Last Name</label>
            <input
              type="text"
              id="reg-lastName"
              required
              placeholder="last name"
              autocomplete="true"
              formControlName="lastName"
            />
            @if (getValidationMessage('lastName', 'register')) {
              <span class="error-text">{{
                getValidationMessage('lastName', 'register')
              }}</span>
            }
          </div>
        </section>

        <div
          class="form-field"
          [class.error-state]="checkElementValidation('email', 'register')"
        >
          <label for="reg-email">Email</label>
          <input
            type="email"
            id="reg-email"
            required
            placeholder="customer@bank.ca"
            autocomplete="email"
            formControlName="email"
          />
          @if (getValidationMessage('email', 'register')) {
            <span class="error-text">{{
              getValidationMessage('email', 'register')
            }}</span>
          }
        </div>
        <div
          class="form-field"
          [class.error-state]="checkElementValidation('password', 'register')"
        >
          <label for="reg-password">Password</label>
          <input
            type="password"
            id="reg-password"
            required
            placeholder="••••••••"
            aria-describedby="reg-pass-error"
            autocomplete="new-password"
            formControlName="password"
          />
          @if (getValidationMessage('password', 'register')) {
            <span class="error-text">{{
              getValidationMessage('password', 'register')
            }}</span>
          }
        </div>
        <div
          class="form-field"
          [class.error-state]="
            checkElementValidation('retypePassword', 'register')
          "
        >
          <label for="reg-retypepassword">Retype Password</label>
          <input
            type="password"
            id="reg-retypepassword"
            required
            placeholder="••••••••"
            aria-describedby="reg-re-pass-error"
            autocomplete="true"
            formControlName="retypePassword"
          />
          @if (getValidationMessage('retypePassword', 'register')) {
            <span class="error-text">{{
              getValidationMessage('retypePassword', 'register')
            }}</span>
          }
        </div>
        <div
          class="form-utils"
          [class.error-state]="
            checkElementValidation('acceptTerms', 'register')
          "
        >
          <label class="custom-checkbox">
            <input
              type="checkbox"
              id="terms-agree"
              required
              formControlName="acceptTerms"
            />
            <span class="checkmark"></span>
            I accept all terms and conditions
          </label>
        </div>
        <button type="submit" class="btn-primary-action">
          Register Identity
        </button>
      </form>
    }
  }`,
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
// REGISTER
@Component({
  selector: 'bnk-register',
  standalone: true,
  imports: [FormControlComponent],
  template: `<section
    [class.active]="registerTab"
    id="section-register"
    class="auth-panel"
    role="tabpanel"
    aria-labelledby="toggle-register"
  >
    <div class="panel-intro">
      <h3>{{ STRING_LITERALS[0] }}</h3>
      <p>{{ STRING_LITERALS[1] }}</p>
    </div>
    <bnk-form useType="register" />
  </section>`,
})
export class RegisterComponent {
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
  selector: 'bnk-login',
  standalone: true,
  imports: [FormControlComponent],
  template: `
    <section
      [class.active]="fullyRendered() && loginTab"
      id="section-login"
      class="auth-panel"
      role="tabpanel"
      aria-labelledby="toggle-login"
    >
      <section class="panel-intro">
        <h3>{{ STRING_LITERALS[0] }}</h3>
        <p>{{ STRING_LITERALS[1] }}</p>
      </section>
      <bnk-form useType="login" />
    </section>
  `,
})
export class LoginComponent {
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
  standalone: true,
  imports: [],
  template: `<section
    class="auth-tab-row"
    role="tablist"
    aria-label="Account Authorization"
  >
    <button
      (click)="onTabChange(authTab.Login)"
      [class.active]="activeTab === authTab.Login"
      role="tab"
      class="tab-btn"
      aria-controls="section-login"
    >
      {{ STRING_LITERALS[2] }}
    </button>
    <button
      (click)="onTabChange(authTab.Register)"
      [class.active]="activeTab === authTab.Register"
      role="tab"
      class="tab-btn"
      aria-controls="section-register"
    >
      {{ STRING_LITERALS[3] }}
    </button>
  </section>`,
})
export class TabComponent {
  STRING_LITERALS = APP_STRING_LITERALS['bnk-auth'];
  private ctx = inject(AuthContextService);
  authTab = AuthTab;
  activeTab: AuthTab = this.ctx.activeTab();
  onTabChange(tab: AuthTab) {
    this.activeTab = tab;
    this.ctx.activeTab.set(tab);
  }
}
// AUTH
@Component({
  selector: 'bnk-auth',
  standalone: true,
  imports: [
    AuthLayoutComponent,
    TabComponent,
    LoginComponent,
    RegisterComponent,
  ],
  template: `<bnk-auth-layout>
    <bnk-tab />
    <bnk-login />
    <bnk-register />
  </bnk-auth-layout>`,
})
export class AuthComponent {}
// SERVER DOWN
@Component({
  selector: 'bnk-server-down',
  standalone: true,
  template: `<section class="main-container">
    <section class="container">
      <section class="icon">⚠️</section>
      <h1>Server Temporarily Unavailable</h1>
      <p>
        We're sorry! Our server is currently down for maintenance or
        experiencing technical issues.
      </p>
      <p class="small">Please try again in a few minutes.</p>
      <button onclick="location.reload()">Retry</button>
    </section>
  </section>`,
})
export class ServerDown {}
// PAGE NOT FOUND
@Component({
  selector: 'bnk-page-not-found',
  standalone: true,
  template: `<section class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or may have been moved.</p>
      <button type="button" routerLink="/">Go to Home</button>
    </div>
  </section>`,
})
export class PageNotFoundComponent {}
// MAIN
@Component({
  selector: 'bnk-main',
  standalone: true,
  template: `Main:`,
})
export class MainComponent {}
// APP
@Component({
  selector: 'bnk-app',
  standalone: true,
  template: `@if (state.serverOnline()) {
      <router-outlet />
    } @else {
      <bnk-server-down />
    }`,
  imports: [RouterOutlet, ServerDown],
})
export class AppComponent {
  protected state = inject(AppStateService);
}
//-----------------------------------------------------------
// APP BOOTSTRAP(KICK START)
bootstrapApplication(AppComponent, { providers: APP_PROVIDERS });

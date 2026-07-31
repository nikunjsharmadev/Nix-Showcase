import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap, timeout } from 'rxjs';
import { ENVIRONMENT } from '../../../environments/environment';
import { BACKEND_URLS } from '../data/const';
import {
  httpMethods,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
} from '../data/type';
import { AuthTab } from '../data/enum';
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
    return this.http.get(`${ENVIRONMENT.apiUrl}`).pipe(timeout(10000));
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

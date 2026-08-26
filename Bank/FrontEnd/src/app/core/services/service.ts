import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map, Observable, tap, timeout } from 'rxjs';
import { ENVIRONMENT } from '../../../environments/environment';
import { constantFactory } from '../constants/const';
import { AuthTab, httpMethods, RegisterRequest, LoginRequest, LoginResponse, ApiPayload } from '../data/type';
// SERVICES
const createServices = () => {
  const { BACKEND_URLS } = constantFactory;
  @Injectable({ providedIn: 'root' })
  class BackendStatusService {
    private readonly healthService = inject(HealthService);
    private readonly appStateService = inject(AppStateService);
    readonly isDown = signal(false);
    private checking = false;
    setDown(): void {
      this.isDown.set(true);
      this.startHealthCheck();
    }
    setUp(): void {
      this.appStateService.serverOnline.set(true);
      this.isDown.set(false);
    }
    private async startHealthCheck(): Promise<void> {
      if (this.checking) return;
      this.checking = true;
      let retry = 0;
      try {
        while (this.isDown() && retry < 5) {
          try {
            await firstValueFrom(this.healthService.check());
            this.setUp();
            break;
          } catch {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            retry += 1;
          }
        }
      } finally {
        this.checking = false;
      }
    }
  }
  @Injectable({ providedIn: 'root' })
  class AuthContextService {
    activeTab = signal<AuthTab>(AuthTab.Login);
  }
  // APP STATE SERVICE
  @Injectable({ providedIn: 'root' })
  class AppStateService {
    readonly serverOnline = signal(false);
    readonly loggedUser = signal<LoginResponse>({});
    readonly initialized = signal(false);
  }
  // SERVER HEALTH CHECK
  @Injectable({ providedIn: 'root' })
  class HealthService {
    private apiService = inject(ApiService);
    check(): Observable<void> {
      return this.apiService.api<void>(`${BACKEND_URLS.health}`, `get`);
    }
  }
  // AUTH SERVICE
  @Injectable({ providedIn: 'root' })
  class AuthService {
    private apiService = inject(ApiService);
    private appStateService = inject(AppStateService);
    refreshToken(): Observable<LoginResponse> {
      return this.apiService.api<LoginResponse>(`${BACKEND_URLS.auth.refresh}`, `get`);
    }
    checkMe(): Observable<boolean> {
      return this.apiService.api<LoginResponse>(`${BACKEND_URLS.auth.me}`, `get`).pipe(
        tap((user: LoginResponse) => {
          this.appStateService.loggedUser.set(user);
        }),
        map(() => true),
      );
    }
    loginUser(payload: LoginRequest): Observable<LoginResponse> {
      return this.apiService.api<LoginResponse>(`${BACKEND_URLS.auth.login}`, `post`, payload).pipe(
        tap((user: LoginResponse) => {
          this.appStateService.loggedUser.set(user);
        }),
      );
    }
    registerUser(payload: RegisterRequest): Observable<LoginResponse> {
      return this.apiService.api<LoginResponse>(`${BACKEND_URLS.auth.register}`, `post`, payload);
    }
    verifyEmail(token: string): Observable<{ data: { isVerified: boolean }; success: boolean }> {
      return this.apiService.api<{
        data: { isVerified: boolean };
        success: boolean;
      }>(BACKEND_URLS.auth.verifyEmail + '?token=' + token, 'get');
    }
  }
  // API SERVICE
  @Injectable({ providedIn: 'root' })
  class ApiService {
    private http = inject(HttpClient);
    api<T>(url: string, method: httpMethods, payload?: ApiPayload): Observable<T> {
      switch (method) {
        case 'get': {
          return this.http[method]<T>(`${ENVIRONMENT.apiUrl + url}`, {
            withCredentials: true,
          }).pipe(timeout(2000));
        }
        case 'post': {
          return this.http[method]<T>(`${ENVIRONMENT.apiUrl + url}`, payload, {
            withCredentials: true,
          });
        }
      }
    }
  }
  @Injectable({ providedIn: 'root' })
  class ServerHealthService {
    private healthService = inject(HealthService);
    private appStateService = inject(AppStateService);
    check = async (): Promise<boolean> => {
      try {
        await firstValueFrom(this.healthService.check());
        this.appStateService.serverOnline.set(true);
        return true;
      } catch {
        this.appStateService.serverOnline.set(false);
        return false;
      }
    };
  }
  return {
    BackendStatusService,
    AuthContextService,
    AppStateService,
    HealthService,
    AuthService,
    ApiService,
    ServerHealthService,
  };
};
export const serviceFactory = createServices();

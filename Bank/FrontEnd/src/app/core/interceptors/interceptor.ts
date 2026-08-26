import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { serviceFactory } from '../services/service';
import { constantFactory } from '../constants/const';
import { LoginResponse } from '../data/type';
// INTERCEPTORS
const createInterceptor = () => {
  const auth: HttpInterceptorFn = (req, next) => {
    const { AuthService, AppStateService, BackendStatusService } = serviceFactory;
    const { BACKEND_URLS } = constantFactory;
    const authService = inject(AuthService);
    const appStateService = inject(AppStateService);
    const backendStatusService = inject(BackendStatusService);
    if (req.url.includes(`${BACKEND_URLS.health}`)) return next(req);
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            {
              if (error.error?.message === 'Access token expired') {
                return authService.refreshToken().pipe(
                  switchMap((user: LoginResponse) => {
                    appStateService.loggedUser.set(user);
                    return next(req);
                  }),
                );
              }
            }
            break;
          case 0:
          case 503:
            {
              backendStatusService.setDown();
            }
            break;
        }
        return throwError(() => error);
      }),
    );
  };
  return { auth };
};
export const interceptorFactory = createInterceptor();

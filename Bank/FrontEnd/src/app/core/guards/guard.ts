import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { catchError, finalize, map, of } from 'rxjs';
import { serviceFactory } from '../services/service';
// GUARDS
const createGuards = () => {
  const authGuard: CanActivateFn = (route, state) => {
    const { AuthService, AppStateService } = serviceFactory;
    const authService = inject(AuthService);
    const appStateService = inject(AppStateService);
    const router = inject(Router);
    const user_ = appStateService.loggedUser();
    if (appStateService.initialized() || Object.keys(user_ ?? {}).length > 0) {
      return true;
    }
    return authService.checkMe().pipe(
      map(() => true),
      catchError(() => {
        return of(router.createUrlTree(['/auth'], { queryParams: { returnUrl: state.url } }));
      }),
      finalize(() => {
        appStateService.initialized.set(true);
      }),
    );
  };
  const serverHealthGuard: CanActivateFn = () => {
    const { AppStateService } = serviceFactory;
    const appStateService = inject(AppStateService);
    const router = inject(Router);
    if (appStateService.serverOnline()) return true;
    return router.createUrlTree(['/server-down']);
  };
  const serverDownGuard: CanActivateFn = () => {
    const { AppStateService } = serviceFactory;
    const appStateService = inject(AppStateService);
    const router = inject(Router);
    if (!appStateService.serverOnline()) return true;
    return router.createUrlTree(['/dashboard']);
  };
  return {
    authGuard,
    serverHealthGuard,
    serverDownGuard,
  };
};
export const guardFactory = createGuards();

import { CanActivateFn, Router } from '@angular/router';
import { AppStateService, AuthService } from '../services/service';
import { inject } from '@angular/core';
import { catchError, finalize, map, of } from 'rxjs';

// GUARDS
export function Guards() {
  const auth: CanActivateFn = () => {
    const appStateService = inject(AppStateService);
    if (!appStateService.serverOnline()) return of(false);
    const authService = inject(AuthService);
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

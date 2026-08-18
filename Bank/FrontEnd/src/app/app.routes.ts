import { Routes } from '@angular/router';
import { Guards } from './core/guards/guard';
export const ROUTES: Routes = [
  {
    path: ``,
    canActivate: [Guards().auth],
    loadComponent: () => import(`./app.component`).then((c) => c.AppComponent),
  },
  {
    path: `auth`,
    loadComponent: () =>
      import(`./features/auth/auth.component`).then((c) => c.AuthComponent),
  },
  {
    path: `verify-email`,
    loadComponent: () =>
      import('./features/auth/verify-email/verify-email.component').then(
        (c) => c.VerifyEmailComponent,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/page-not-found/page-not-found.component').then(
        (c) => c.PageNotFoundComponent,
      ),
  },
] as const;

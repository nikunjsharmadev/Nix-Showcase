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
    path: `login`,
    loadComponent: () =>
      import(`./features/auth/login/login.component`).then(
        (c) => c.LoginComponent,
      ),
  },
  {
    path: `register`,
    loadComponent: () =>
      import(`./features/auth/register/register.component`).then(
        (c) => c.RegisterComponent,
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

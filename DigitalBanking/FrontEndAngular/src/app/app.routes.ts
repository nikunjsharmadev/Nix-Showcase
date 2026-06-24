import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
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
    path: ``,
    // canActivate: [authGuard],
    loadComponent: () =>
      import(`./layouts/dashboard-layout/dashboard-layout.component`).then(
        (c) => c.DashboardLayoutComponent,
      ),
  },
];

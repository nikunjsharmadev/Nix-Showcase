import { Routes } from '@angular/router';
import { Guards } from './main-copy';
export const ROUTES: Routes = [
  {
    path: ``,
    canActivate: [Guards().auth],
    loadComponent: () => import('./main-copy').then((c) => c.MainComponent),
  },
  {
    path: `auth`,
    loadComponent: () => import('./main-copy').then((c) => c.AuthComponent),
  },
  {
    path: `verify-email`,
    loadComponent: () =>
      import('./main-copy').then((c) => c.VefifyEmailComponent),
  },
  {
    path: `**`,
    loadComponent: () =>
      import('./main-copy').then((c) => c.PageNotFoundComponent),
  },
] as const;

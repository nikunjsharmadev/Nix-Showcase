import { Routes } from '@angular/router';
export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./main-copy').then((m) => m.DynamicFormControlsComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./main-copy').then((m) => m.PageNotFoundComponent),
  },
];

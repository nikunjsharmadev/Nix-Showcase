import { Routes } from '@angular/router';
export const ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components').then((m) => m.DynamicFormControlsComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./components').then((m) => m.PageNotFoundComponent),
  },
];

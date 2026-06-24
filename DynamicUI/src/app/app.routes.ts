import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dynamic-ui',
    loadComponent: () =>
      import('./dynamic-controls/dynamic-controls.component').then(
        (m) => m.DynamicControlsComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'dynamic-ui',
    pathMatch: 'full',
  },
];

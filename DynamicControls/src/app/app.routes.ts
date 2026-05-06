import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: 'dynamic-controls',
    loadChildren: () => import('./dynamic-controls/dynamic-controls.module').then(m => m.DynamicControlsModule)
}, {
    path: '',
    redirectTo: 'dynamic-controls',
    pathMatch: 'full'
}];

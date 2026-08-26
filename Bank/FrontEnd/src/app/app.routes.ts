import { Routes } from '@angular/router';
import { guardFactory } from './core/guards/guard';
const createRoutes = () => {
  const getRoutes = () => {
    const { authGuard, serverHealthGuard, serverDownGuard } = guardFactory;
    return [
      {
        path: ``,
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: `dashboard`,
        canActivate: [serverHealthGuard, authGuard],
        runGuardsAndResolvers: 'always',
        loadComponent: () => import('./features/dashboard/dashboard.component').then((c) => c.DashboardComponent),
      },
      {
        path: `fund-transfer`,
        canActivate: [serverHealthGuard, authGuard],
        runGuardsAndResolvers: 'always',
        loadComponent: () => import('./features/fund-transfer/fund-transfer.component').then((c) => c.FundTransferComponent),
      },
      {
        path: `auth`,
        canActivate: [serverHealthGuard],
        loadComponent: () => import('./features/auth/auth.component').then((c) => c.AuthComponent),
        children: [],
      },
      // {
      //   path: `verify-email`,
      //   canActivate: [serverHealthGuard],
      //   loadComponent: () => import('').then((c) => c.VerifyEmailComponent),
      // },
      {
        path: `server-down`,
        canActivate: [serverDownGuard],
        runGuardsAndResolvers: 'always',
        loadComponent: () => import('./features/server-down/server-down.component').then((c) => c.ServerDownComponent),
      },
      {
        path: `**`,
        loadComponent: () => import('./features/page-not-found/page-not-found.component').then((c) => c.PageNotFoundComponent),
      },
    ] as Routes;
  };
  return {
    getRoutes,
  };
};
export const routesFactory = createRoutes();

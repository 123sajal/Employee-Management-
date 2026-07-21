import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect root → dashboard
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },

  // Auth routes (no layout shell)
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.authRoutes),
  },

  // Protected application shell
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'employees',
        loadChildren: () =>
          import('./features/employees/employees.routes').then((m) => m.employeesRoutes),
      },
      {
        path: 'departments',
        loadChildren: () =>
          import('./features/departments/departments.routes').then((m) => m.departmentsRoutes),
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.routes').then((m) => m.rolesRoutes),
      },
    ],
  },

  // Wildcard
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

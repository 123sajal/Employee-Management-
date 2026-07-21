import { Routes } from '@angular/router';

export const departmentsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./department-list/department-list.component').then(
        (m) => m.DepartmentListComponent,
      ),
  },
];

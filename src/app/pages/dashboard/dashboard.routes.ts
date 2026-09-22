import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard').then((component) => component.Dashboard),
    title: 'Visão geral | Música da Glória',
  },
];

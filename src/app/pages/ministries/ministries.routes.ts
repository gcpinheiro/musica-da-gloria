import { Routes } from '@angular/router';

export const MINISTRIES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/ministry-list/ministry-list').then((c) => c.MinistryList), title: 'Ministérios | Música da Glória' },
  { path: 'novo', loadComponent: () => import('./pages/ministry-form/ministry-form').then((c) => c.MinistryForm), title: 'Novo ministério | Música da Glória' },
  { path: ':id/editar', loadComponent: () => import('./pages/ministry-form/ministry-form').then((c) => c.MinistryForm), title: 'Editar ministério | Música da Glória' },
  { path: ':id', loadComponent: () => import('./pages/ministry-detail/ministry-detail').then((c) => c.MinistryDetail), title: 'Ministério | Música da Glória' },
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((component) => component.Login),
    title: 'Entrar | Música da Glória',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/app-shell').then((component) => component.AppShell),
    children: [
      { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.routes').then((routes) => routes.DASHBOARD_ROUTES) },
      { path: 'escalas', loadChildren: () => import('./pages/schedules/schedules.routes').then((routes) => routes.SCHEDULES_ROUTES) },
      { path: 'membros', loadChildren: () => import('./pages/members/members.routes').then((routes) => routes.MEMBERS_ROUTES) },
      { path: 'repertorio', loadChildren: () => import('./pages/songs/songs.routes').then((routes) => routes.SONGS_ROUTES) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];

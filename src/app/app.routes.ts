import { Routes } from '@angular/router';
import { authGuard, managementGuard, superAdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((component) => component.Login),
    title: 'Entrar | Música da Glória',
  },
  { path: 'convites/:token', loadComponent: () => import('./pages/auth/invitation-accept/invitation-accept').then((component) => component.InvitationAccept), title: 'Aceitar convite | Música da Glória' },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/app-shell').then((component) => component.AppShell),
    children: [
      { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.routes').then((routes) => routes.DASHBOARD_ROUTES) },
      { path: 'escalas', loadChildren: () => import('./pages/schedules/schedules.routes').then((routes) => routes.SCHEDULES_ROUTES) },
      { path: 'membros', canActivate: [managementGuard], loadChildren: () => import('./pages/members/members.routes').then((routes) => routes.MEMBERS_ROUTES) },
      { path: 'ministerios', canActivate: [managementGuard], loadChildren: () => import('./pages/ministries/ministries.routes').then((routes) => routes.MINISTRIES_ROUTES) },
      { path: 'repertorio', loadChildren: () => import('./pages/songs/songs.routes').then((routes) => routes.SONGS_ROUTES) },
      { path: 'perfil', loadComponent: () => import('./pages/profile/profile').then((component) => component.ProfilePage), title: 'Meu perfil | Música da Glória' },
      { path: 'administracao', canActivate: [superAdminGuard], loadComponent: () => import('./pages/administration/pages/administration').then((component) => component.Administration) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];

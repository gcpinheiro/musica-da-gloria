import { Routes } from '@angular/router';

export const MEMBERS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/member-list/member-list').then((c) => c.MemberList), title: 'Membros | Música da Glória' },
  { path: 'novo', loadComponent: () => import('./pages/member-form/member-form').then((c) => c.MemberForm), title: 'Novo membro | Música da Glória' },
  { path: ':id/editar', loadComponent: () => import('./pages/member-form/member-form').then((c) => c.MemberForm), title: 'Editar membro | Música da Glória' },
  { path: ':id', loadComponent: () => import('./pages/member-detail/member-detail').then((c) => c.MemberDetail), title: 'Perfil do membro | Música da Glória' },
];

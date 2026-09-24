import { Routes } from '@angular/router';
import { managementGuard } from '../../core/guards/auth.guard';

export const SCHEDULES_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/schedule-list/schedule-list').then((c) => c.ScheduleList), title: 'Escalas | Música da Glória' },
  { path: 'nova', canActivate: [managementGuard], loadComponent: () => import('./pages/schedule-form/schedule-form').then((c) => c.ScheduleForm), title: 'Nova escala | Música da Glória' },
  { path: ':id', loadComponent: () => import('./pages/schedule-detail/schedule-detail').then((c) => c.ScheduleDetail), title: 'Detalhes da escala | Música da Glória' },
];

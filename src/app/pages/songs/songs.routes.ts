import { Routes } from '@angular/router';
export const SONGS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/song-list/song-list').then((c) => c.SongList), title: 'Repertório | Música da Glória' },
  { path: 'nova', loadComponent: () => import('./pages/song-form/song-form').then((c) => c.SongForm), title: 'Nova música | Música da Glória' },
  { path: ':id/editar', loadComponent: () => import('./pages/song-form/song-form').then((c) => c.SongForm), title: 'Editar música | Música da Glória' },
  { path: ':id', loadComponent: () => import('./pages/song-detail/song-detail').then((c) => c.SongDetail), title: 'Música | Música da Glória' },
];

import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Song, SongInput } from '../models/song.model';
import { SONGS_MOCK } from './songs.mock';

interface ApiSong extends SongInput { readonly id: string; readonly status: 'ACTIVE' | 'ARCHIVED'; }

@Injectable({ providedIn: 'root' })
export class SongsService {
  private songs: Song[] = SONGS_MOCK.map((song) => ({ ...song }));
  constructor(@Optional() private readonly http: HttpClient | null = null) {}
  list(): Observable<readonly Song[]> {
    if (this.usesApi()) return this.http!.get<readonly ApiSong[]>(`${environment.apiBaseUrl}/songs`, this.options()).pipe(map((songs) => songs.map((song) => this.fromApi(song))));
    return of(this.songs.map((song) => ({ ...song }))).pipe(delay(250));
  }
  getById(id: string): Observable<Song> {
    if (this.usesApi()) return this.http!.get<ApiSong>(`${environment.apiBaseUrl}/songs/${id}`, this.options()).pipe(map((song) => this.fromApi(song)));
    const song = this.songs.find((item) => item.id === id);
    return song ? of({ ...song }).pipe(delay(180)) : throwError(() => new Error('SONG_NOT_FOUND'));
  }
  create(input: SongInput): Observable<Song> {
    if (this.usesApi()) return this.http!.post<ApiSong>(`${environment.apiBaseUrl}/songs`, input, this.options()).pipe(map((song) => this.fromApi(song)));
    const song: Song = { ...input, id: `song-${Date.now()}`, active: true };
    this.songs = [song, ...this.songs]; return of(song).pipe(delay(350));
  }
  update(id: string, input: SongInput): Observable<Song> {
    if (this.usesApi()) return this.http!.patch<ApiSong>(`${environment.apiBaseUrl}/songs/${id}`, input, this.options()).pipe(map((song) => this.fromApi(song)));
    const current = this.songs.find((song) => song.id === id); if (!current) return throwError(() => new Error('SONG_NOT_FOUND'));
    const song = { ...current, ...input }; this.songs = this.songs.map((item) => item.id === id ? song : item); return of(song).pipe(delay(350));
  }
  private usesApi(): boolean { return Boolean(this.http) && !environment.useMocks; }
  private options() { return { withCredentials: true } as const; }
  private fromApi(song: ApiSong): Song { return { ...song, active: song.status === 'ACTIVE' }; }
}

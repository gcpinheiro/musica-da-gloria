import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Song, SongInput } from '../models/song.model';
import { SONGS_MOCK } from './songs.mock';

@Injectable({ providedIn: 'root' })
export class SongsService {
  private songs: Song[] = SONGS_MOCK.map((song) => ({ ...song }));
  list(): Observable<readonly Song[]> { return of(this.songs.map((song) => ({ ...song }))).pipe(delay(250)); }
  getById(id: string): Observable<Song> { const song = this.songs.find((item) => item.id === id); return song ? of({ ...song }).pipe(delay(180)) : throwError(() => new Error('SONG_NOT_FOUND')); }
  create(input: SongInput): Observable<Song> { const song: Song = { ...input, id: `song-${Date.now()}`, active: true }; this.songs = [song, ...this.songs]; return of(song).pipe(delay(350)); }
  update(id: string, input: SongInput): Observable<Song> { const current = this.songs.find((song) => song.id === id); if (!current) return throwError(() => new Error('SONG_NOT_FOUND')); const song = { ...current, ...input }; this.songs = this.songs.map((item) => item.id === id ? song : item); return of(song).pipe(delay(350)); }
}

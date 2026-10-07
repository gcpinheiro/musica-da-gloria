import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, forkJoin, of } from 'rxjs';
import { Schedule, ScheduleSetlistItemUpdate } from '../../schedules/models/schedule.model';
import { SchedulesService } from '../../schedules/data-access/schedules.service';
import { Song, SongInput } from '../models/song.model';
import { SongsService } from './songs.service';
import { LyricsDocument } from '../../../shared/models/lyrics-document.model';

@Injectable({ providedIn: 'root' })
export class SongsFacade {
  private readonly service = inject(SongsService); private readonly schedulesService = inject(SchedulesService); private readonly router = inject(Router);
  private readonly songsState = signal<readonly Song[]>([]); private readonly selectedState = signal<Song | null>(null);
  private readonly contextScheduleState = signal<Schedule | null>(null);
  private readonly queryState = signal(''); private readonly loadingState = signal(false); private readonly savingState = signal(false); private readonly errorState = signal<string | null>(null);
  readonly songs = this.songsState.asReadonly(); readonly selected = this.selectedState.asReadonly();
  readonly contextSchedule = this.contextScheduleState.asReadonly();
  readonly query = this.queryState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly saving = this.savingState.asReadonly(); readonly error = this.errorState.asReadonly();
  readonly filtered = computed(() => { const query = this.queryState().toLocaleLowerCase('pt-BR'); return this.songsState().filter((song) => !query || [song.title, song.author, ...song.liturgicalMoments].some((value) => value.toLocaleLowerCase('pt-BR').includes(query))); });
  private readonly navigationSongs = computed(() => {
    const schedule = this.contextScheduleState();
    if (!schedule) return this.songsState();
    return schedule.songs.map((item) => this.songsState().find((song) => song.id === item.songId)).filter((song): song is Song => Boolean(song));
  });
  readonly previousSong = computed(() => { const index = this.navigationSongs().findIndex((song) => song.id === this.selectedState()?.id); return index > 0 ? this.navigationSongs()[index - 1] : null; });
  readonly nextSong = computed(() => { const index = this.navigationSongs().findIndex((song) => song.id === this.selectedState()?.id); return index >= 0 && index < this.navigationSongs().length - 1 ? this.navigationSongs()[index + 1] : null; });
  readonly navigationPosition = computed(() => { const songs = this.navigationSongs(); const index = songs.findIndex((song) => song.id === this.selectedState()?.id); return index < 0 ? null : { current: index + 1, total: songs.length }; });
  setQuery(query: string): void { this.queryState.set(query); }
  load(): void { this.loadingState.set(true); this.service.list().pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (songs) => this.songsState.set(songs), error: () => this.errorState.set('Não foi possível carregar o repertório.') }); }
  loadOne(id: string, scheduleId?: string): void {
    this.loadingState.set(true); this.selectedState.set(null); this.contextScheduleState.set(null); this.errorState.set(null);
    forkJoin({ song: this.service.getById(id), songs: this.service.list(), schedule: scheduleId ? this.schedulesService.getById(scheduleId) : of(null) })
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({ next: ({ song, songs, schedule }) => { this.songsState.set(songs); this.selectedState.set(song); this.contextScheduleState.set(schedule); }, error: () => this.errorState.set('Música não encontrada.') });
  }
  save(input: SongInput, id?: string): void { this.savingState.set(true); const request = id ? this.service.update(id, input) : this.service.create(input); request.pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (song) => void this.router.navigate(['/repertorio', 'musicas', song.id]), error: () => this.errorState.set('Não foi possível salvar a música.') }); }
  saveSetlistLyrics(itemId: string, content: LyricsDocument): void {
    const schedule = this.contextScheduleState();
    if (!schedule) return;
    this.savingState.set(true);
    this.errorState.set(null);
    this.schedulesService.updateSetlistLyrics(schedule.id, itemId, content)
      .pipe(finalize(() => this.savingState.set(false)))
      .subscribe({
        next: (updated) => this.contextScheduleState.set(updated),
        error: () => this.errorState.set('Não foi possível salvar a formatação da letra.'),
      });
  }
  saveSetlistItem(itemId: string, input: ScheduleSetlistItemUpdate): void {
    const schedule = this.contextScheduleState();
    if (!schedule) return;
    this.contextScheduleState.set({
      ...schedule,
      songs: schedule.songs.map((song) => song.id === itemId ? { ...song, ...input } : song),
    });
    this.savingState.set(true);
    this.errorState.set(null);
    this.schedulesService.updateSetlistItem(schedule.id, itemId, input)
      .pipe(finalize(() => this.savingState.set(false)))
      .subscribe({
        next: (updated) => this.contextScheduleState.set(updated),
        error: () => {
          this.contextScheduleState.set(schedule);
          this.errorState.set('Não foi possível salvar os dados da música nesta escala.');
        },
      });
  }
}

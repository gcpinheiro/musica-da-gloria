import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SongInput } from '../models/song.model';
import { SongsService } from './songs.service';

@Injectable({ providedIn: 'root' })
export class SongsFacade {
  private readonly service = inject(SongsService); private readonly router = inject(Router);
  private readonly songsState = signal<readonly import('../models/song.model').Song[]>([]); private readonly selectedState = signal<import('../models/song.model').Song | null>(null); private readonly queryState = signal(''); private readonly loadingState = signal(false); private readonly savingState = signal(false); private readonly errorState = signal<string | null>(null);
  readonly songs = this.songsState.asReadonly(); readonly selected = this.selectedState.asReadonly(); readonly query = this.queryState.asReadonly(); readonly loading = this.loadingState.asReadonly(); readonly saving = this.savingState.asReadonly(); readonly error = this.errorState.asReadonly();
  readonly filtered = computed(() => { const query = this.queryState().toLocaleLowerCase('pt-BR'); return this.songsState().filter((song) => !query || [song.title, song.author, ...song.liturgicalMoments].some((value) => value.toLocaleLowerCase('pt-BR').includes(query))); });
  setQuery(query: string): void { this.queryState.set(query); }
  load(): void { this.loadingState.set(true); this.service.list().pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (songs) => this.songsState.set(songs), error: () => this.errorState.set('Não foi possível carregar o repertório.') }); }
  loadOne(id: string): void { this.loadingState.set(true); this.selectedState.set(null); this.service.getById(id).pipe(finalize(() => this.loadingState.set(false))).subscribe({ next: (song) => this.selectedState.set(song), error: () => this.errorState.set('Música não encontrada.') }); }
  save(input: SongInput, id?: string): void { this.savingState.set(true); const request = id ? this.service.update(id, input) : this.service.create(input); request.pipe(finalize(() => this.savingState.set(false))).subscribe({ next: (song) => void this.router.navigate(['/repertorio', song.id]), error: () => this.errorState.set('Não foi possível salvar a música.') }); }
}

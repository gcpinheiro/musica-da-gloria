import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SongsService } from './songs.service';

describe('SongsService', () => {
  let service: SongsService;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }); service = TestBed.inject(SongsService); });
  it('provides lyrics and chords for a repertoire song', async () => {
    const song = await firstValueFrom(service.getById('song-001'));
    expect(song.lyrics.length).toBeGreaterThan(0);
    expect(song.chords).toContain('G');
  });
  it('creates a song in the library', async () => {
    const song = await firstValueFrom(service.create({ title: 'Canto de teste', author: 'Pastoral', defaultKey: 'C', liturgicalMoments: ['Entrada'], lyrics: 'Letra', chords: 'C Letra' }));
    expect((await firstValueFrom(service.list())).some((item) => item.id === song.id)).toBeTrue();
  });

  it('provides a complete demonstration with plain lyrics and aligned chords', async () => {
    const song = await firstValueFrom(service.getById('song-008'));
    expect(song.lyrics).toContain('[Refrão]');
    expect(song.chords).toContain('Vem, Senhor, caminhar ao nosso lado');
    expect(song.chords).toContain('C9               D');
  });
});

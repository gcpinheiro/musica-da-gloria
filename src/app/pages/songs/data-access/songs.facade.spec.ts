import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SongsFacade } from './songs.facade';

describe('SongsFacade', () => {
  it('uses the schedule repertoire order for previous and next navigation', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([])] });
    const facade = TestBed.inject(SongsFacade);

    facade.loadOne('song-002', 'occ-001');
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(facade.previousSong()?.id).toBe('song-001');
    expect(facade.nextSong()?.id).toBe('song-003');
    expect(facade.navigationPosition()).toEqual({ current: 2, total: 4 });
  });
});

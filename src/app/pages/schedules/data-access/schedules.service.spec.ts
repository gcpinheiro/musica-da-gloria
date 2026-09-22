import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SchedulesService } from './schedules.service';

describe('SchedulesService', () => {
  let service: SchedulesService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(SchedulesService);
  });

  it('loads a schedule by id', async () => {
    const schedule = await firstValueFrom(service.getById('occ-001'));
    expect(schedule.title).toBe('Santa Missa');
  });

  it('creates a draft schedule', async () => {
    const schedule = await firstValueFrom(service.create({
      title: 'Celebração de teste',
      date: '2026-10-10',
      time: '18:00',
      location: 'Igreja Matriz',
      ministry: 'Magnificat',
      liturgicalTime: 'Tempo Comum',
      notes: '',
      people: [],
      songs: [],
    }));
    expect(schedule.status).toBe('DRAFT');
  });

  it('changes only the concrete occurrence formation and repertoire', async () => {
    const original = await firstValueFrom(service.getById('occ-001'));
    const member = (await firstValueFrom(service.listMemberOptions())).find((item) => item.id === 'mem-004')!;
    const withMember = await firstValueFrom(service.addMember('occ-001', member));
    expect(withMember.people.length).toBe(original.people.length + 1);

    const song = (await firstValueFrom(service.listSongOptions())).find((item) => item.songId === 'song-005')!;
    const withSong = await firstValueFrom(service.addSong('occ-001', { ...song, id: 'item-test' }));
    expect(withSong.songs.some((item) => item.songId === 'song-005')).toBeTrue();

    const cleaned = await firstValueFrom(service.removeMember('occ-001', member.id));
    expect(cleaned.people.some((item) => item.id === member.id)).toBeFalse();
  });
});

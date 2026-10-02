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
      ministry: 'Santa Cecília',
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

    const song = (await firstValueFrom(service.listSongOptions('', 1, 100))).items.find((item) => item.songId === 'song-005')!;
    const withSong = await firstValueFrom(service.addSong('occ-001', { ...song, id: 'item-test' }));
    expect(withSong.songs.some((item) => item.songId === 'song-005')).toBeTrue();

    const cleaned = await firstValueFrom(service.removeMember('occ-001', member.id));
    expect(cleaned.people.some((item) => item.id === member.id)).toBeFalse();
  });

  it('publishes a draft and records the member response', async () => {
    const draft = await firstValueFrom(service.create({
      title: 'Celebração para confirmação',
      date: '2026-10-11',
      time: '18:00',
      location: 'Igreja Matriz',
      ministry: 'Santa Cecília',
      liturgicalTime: 'Tempo Comum',
      notes: '',
      people: [{ id: 'member-test', name: 'Membro Teste', initials: 'MT', whatsapp: '+5585999999999', role: 'Voz', confirmation: 'PENDING' }],
      songs: [],
    }));

    const published = await firstValueFrom(service.publish(draft.id));
    expect(published.status).toBe('PUBLISHED');

    const confirmed = await firstValueFrom(service.updateConfirmation(draft.id, 'member-test', 'CONFIRMED'));
    expect(confirmed.myConfirmation).toBe('CONFIRMED');
    expect(confirmed.people[0].confirmation).toBe('CONFIRMED');
  });

  it('archives a schedule so it no longer appears in the list', async () => {
    const schedule = await firstValueFrom(service.create({
      title: 'Escala para excluir',
      date: '2026-10-12',
      time: '18:00',
      location: 'Igreja Matriz',
      ministry: 'Santa Cecília',
      liturgicalTime: 'Tempo Comum',
      notes: '',
      people: [],
      songs: [],
    }));

    await firstValueFrom(service.archive(schedule.id));

    expect((await firstValueFrom(service.list())).some((item) => item.id === schedule.id)).toBeFalse();
  });

  it('paginates and filters song options', async () => {
    const page = await firstValueFrom(service.listSongOptions('Eis', 1, 2));
    expect(page.items.length).toBeLessThanOrEqual(2);
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.every((item) => item.title.toLocaleLowerCase('pt-BR').includes('eis'))).toBeTrue();
  });

  it('archives multiple selected schedules', async () => {
    const before = await firstValueFrom(service.list());
    const ids = before.slice(0, 2).map((schedule) => schedule.id);
    await firstValueFrom(service.archiveMany(ids));
    const after = await firstValueFrom(service.list());
    expect(after.some((schedule) => ids.includes(schedule.id))).toBeFalse();
  });

  it('keeps the explicit repertoire order', async () => {
    const schedule = await firstValueFrom(service.getById('occ-001'));
    const reordered = [...schedule.songs].reverse();
    const updated = await firstValueFrom(service.reorderSongs(schedule.id, reordered));
    expect(updated.songs.map((song) => song.id)).toEqual(reordered.map((song) => song.id));
  });

  it('stores a formatted lyrics arrangement only on the selected schedule item', async () => {
    const original = await firstValueFrom(service.getById('occ-001'));
    const item = original.songs[0];
    const content = { version: 1 as const, segments: [{ text: 'Mulheres', bold: true as const, voice: 'WOMEN' as const }] };

    const updated = await firstValueFrom(service.updateSetlistLyrics(original.id, item.id, content));

    expect(updated.songs[0].formattedLyrics).toEqual(content);
    expect((await firstValueFrom(service.getById('occ-002'))).songs[0].formattedLyrics).toBeUndefined();
  });
});

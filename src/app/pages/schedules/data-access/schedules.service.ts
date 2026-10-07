import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConfirmationStatus, GeneratedScheduleInput, Schedule, ScheduleBatchInput, ScheduleBatchResult, ScheduleInput, ScheduledPerson, ScheduledSong, ScheduleMemberOption, ScheduleMemberPage, ScheduleSetlistItemUpdate, ScheduleSongOption, ScheduleSongPage } from '../models/schedule.model';
import { SCHEDULE_MEMBER_OPTIONS, SCHEDULE_SONG_OPTIONS, SCHEDULES_MOCK } from './schedules.mock';
import { LyricsDocument } from '../../../shared/models/lyrics-document.model';
import { memberPhotoUrl } from '../../../shared/utils/member-photo-url';

interface ApiOccurrenceMember { readonly memberId: string; readonly name: string; readonly initials: string; readonly photoUrl?: string | null; readonly hasPhoto?: boolean; readonly whatsapp?: string; readonly role: string; readonly confirmation: ScheduledPerson['confirmation']; }
interface ApiSetlistItem { readonly id: string; readonly songId: string; readonly title: string; readonly key: string; readonly liturgicalMoment: string; readonly notes?: string | null; readonly lyricsSnapshot?: string; readonly formattedLyrics?: LyricsDocument | null; }
interface ApiOccurrence { readonly id: string; readonly title: string; readonly startsAt: string; readonly timezone: string; readonly location: string; readonly ministryId: string; readonly ministry?: string; readonly status: Schedule['status']; readonly version: number; readonly canEdit?: boolean; readonly liturgicalTime?: string | null; readonly notes?: string | null; readonly memberCount?: number; readonly repertoireCount?: number; readonly myConfirmation?: ConfirmationStatus; readonly members?: readonly ApiOccurrenceMember[]; readonly setlist?: { readonly items: readonly ApiSetlistItem[] }; }
interface ApiMemberPage { readonly items: readonly { readonly id: string; readonly name: string; readonly initials: string; readonly photoUrl?: string | null; readonly hasPhoto?: boolean; readonly phone: string; readonly talentIds?: readonly string[]; readonly status: string }[]; readonly page: number; readonly pageSize: number; readonly total: number; }
interface ApiSongOptionPage { readonly items: readonly ScheduleSongOption[]; readonly page: number; readonly pageSize: number; readonly total: number; }

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private schedules: Schedule[] = SCHEDULES_MOCK.map((schedule) => ({ ...schedule }));
  private readonly createdBatches = new Map<string, ScheduleBatchResult>();
  constructor(@Optional() private readonly http: HttpClient | null = null) {}
  list(): Observable<readonly Schedule[]> { if (this.usesApi()) return this.http!.get<readonly ApiOccurrence[]>(`${environment.apiBaseUrl}/occurrences`, this.options()).pipe(map((items) => items.map((item) => this.fromApi(item)))); return of(this.schedules.map((item) => ({ ...item }))).pipe(delay(280)); }
  getById(id: string): Observable<Schedule> { if (this.usesApi()) return this.http!.get<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}`, this.options()).pipe(map((item) => this.fromApi(item))); const schedule = this.schedules.find((item) => item.id === id); return schedule ? of({ ...schedule }).pipe(delay(220)) : throwError(() => new Error('SCHEDULE_NOT_FOUND')); }
  create(input: ScheduleInput, ministryId?: string): Observable<Schedule> {
    if (this.usesApi()) {
      if (!ministryId) return throwError(() => new Error('MINISTRY_REQUIRED'));
      const body = { title: input.title, startsAt: `${input.date.slice(0, 10)}T${input.time}:00-03:00`, timezone: 'America/Fortaleza', location: input.location, ministryId, liturgicalTime: input.liturgicalTime, notes: input.notes };
      return this.http!.post<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences`, body, this.options()).pipe(
        switchMap((created) => this.replaceMembers(created.id, input.people).pipe(
          switchMap(() => this.replaceSongs(created.id, input.songs)),
        )),
      );
    }
    const schedule: Schedule = { ...input, id: `occ-${Date.now()}`, status: 'DRAFT' }; this.schedules = [schedule, ...this.schedules]; return of(schedule).pipe(delay(400));
  }
  createBatch(input: ScheduleBatchInput, habitualMembers: readonly ScheduledPerson[], idempotencyKey: string): Observable<ScheduleBatchResult> {
    if (this.usesApi()) {
      const habitualById = new Map(habitualMembers.map((member) => [member.id, member]));
      const body = {
        timezone: 'America/Fortaleza',
        ministryId: input.ministryId,
        slots: input.slots.map((slot) => {
          const selectedIds = new Set(slot.people.map((member) => member.id));
          return {
            startsAt: `${slot.date.slice(0, 10)}T${slot.time}:00-03:00`,
            title: slot.title,
            location: slot.location,
            liturgicalTime: slot.liturgicalTime,
            notes: slot.notes,
            excludedMemberIds: habitualMembers.filter((member) => !selectedIds.has(member.id)).map((member) => member.id),
            additionalMembers: slot.people
              .filter((member) => !habitualById.has(member.id) || habitualById.get(member.id)?.role !== member.role)
              .map((member) => ({ memberId: member.id, role: member.role })),
            setlist: {
              items: slot.songs.map((song, index) => ({
                songId: song.songId,
                position: index + 1,
                key: song.key,
                liturgicalMoment: song.liturgicalMoment,
              })),
            },
          };
        }),
      };
      return this.http!.post<ScheduleBatchResult>(`${environment.apiBaseUrl}/occurrences/batch`, body, {
        ...this.options(),
        headers: { 'Idempotency-Key': idempotencyKey },
      });
    }
    const replay = this.createdBatches.get(idempotencyKey);
    if (replay) return of({ ...replay, replayed: true }).pipe(delay(200));
    const now = Date.now();
    const created = input.slots.map((slot, index): Schedule => ({
      id: `occ-${now}-${index}`,
      title: slot.title,
      date: `${slot.date.slice(0, 10)}T${slot.time}:00-03:00`,
      time: slot.time,
      location: slot.location,
      ministry: input.ministryId,
      ministryId: input.ministryId,
      timezone: 'America/Fortaleza',
      status: 'DRAFT',
      liturgicalTime: slot.liturgicalTime,
      notes: slot.notes,
      people: slot.people.map((member) => ({ ...member })),
      songs: slot.songs.map((song, songIndex) => ({ ...song, id: `item-${now}-${index}-${songIndex}` })),
    }));
    this.schedules = [...created, ...this.schedules];
    const result: ScheduleBatchResult = { batchId: `batch-${now}`, createdCount: created.length, replayed: false, occurrenceIds: created.map((schedule) => schedule.id) };
    this.createdBatches.set(idempotencyKey, result);
    return of(result).pipe(delay(400));
  }
  updateOccurrence(id: string, input: ScheduleInput, ministryId: string, version: number): Observable<Schedule> {
    if (this.usesApi()) {
      const body = { title: input.title, startsAt: `${input.date.slice(0, 10)}T${input.time}:00-03:00`, timezone: 'America/Fortaleza', location: input.location, ministryId, liturgicalTime: input.liturgicalTime, notes: input.notes, version };
      return this.http!.patch<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}`, body, this.options()).pipe(
        switchMap(() => this.replaceMembers(id, input.people)),
        switchMap(() => this.replaceSongs(id, input.songs)),
      );
    }
    return this.update(id, (schedule) => ({ ...schedule, ...input, ministryId, version: version + 1 }));
  }
  generate(inputs: readonly GeneratedScheduleInput[]): Observable<readonly Schedule[]> { const existingIds = new Set(this.schedules.map((schedule) => schedule.id)); const existingSlots = new Set(this.schedules.map((schedule) => this.scheduleSlot(schedule.date, schedule.time, schedule.ministry))); const generated = inputs.filter((input) => !existingIds.has(input.id) && !existingSlots.has(this.scheduleSlot(input.date, input.time, input.ministry))).map(({ sourceMinistryId: _sourceMinistryId, ...input }) => ({ ...input, status: 'DRAFT' as const })); this.schedules = [...generated, ...this.schedules]; return of(generated.map((item) => ({ ...item }))).pipe(delay(400)); }
  listMemberOptions(query = '', page = 1, pageSize = 8): Observable<ScheduleMemberPage> {
    if (this.usesApi()) return this.http!.get<ApiMemberPage>(`${environment.apiBaseUrl}/members`, { ...this.options(), params: { query, page, pageSize, status: 'ACTIVE' } }).pipe(map(({ items, total }) => ({ items: items.map((item) => ({ id: item.id, name: item.name, initials: item.initials, photoUrl: memberPhotoUrl(item.id, item.hasPhoto, item.photoUrl), whatsapp: item.phone, role: 'Integrante', confirmation: 'PENDING' as const, available: item.status === 'ACTIVE' })), page, pageSize, total })));
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    const filtered = SCHEDULE_MEMBER_OPTIONS.filter((item) => !normalized || `${item.name} ${item.role}`.toLocaleLowerCase('pt-BR').includes(normalized));
    const start = (page - 1) * pageSize;
    return of({ items: filtered.slice(start, start + pageSize).map((item) => ({ ...item })), page, pageSize, total: filtered.length }).pipe(delay(180));
  }
  listSongOptions(query = '', page = 1, pageSize = 8): Observable<ScheduleSongPage> {
    if (this.usesApi()) return this.http!.get<ApiSongOptionPage>(`${environment.apiBaseUrl}/songs/options`, { ...this.options(), params: { query, page, pageSize } }).pipe(map((result) => ({ ...result, items: result.items.map((item) => ({ ...item })) })));
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    const filtered = SCHEDULE_SONG_OPTIONS.filter((item) => !normalized || `${item.title} ${item.liturgicalMoment}`.toLocaleLowerCase('pt-BR').includes(normalized));
    const start = (page - 1) * pageSize;
    return of({ items: filtered.slice(start, start + pageSize).map((item) => ({ ...item })), page, pageSize, total: filtered.length }).pipe(delay(180));
  }
  addMember(id: string, member: ScheduledPerson): Observable<Schedule> { if (this.usesApi()) return this.getById(id).pipe(switchMap((schedule) => this.replaceMembers(id, schedule.people.some((item) => item.id === member.id) ? schedule.people : [...schedule.people, member]))); return this.update(id, (schedule) => ({ ...schedule, people: schedule.people.some((item) => item.id === member.id) ? schedule.people : [...schedule.people, member] })); }
  removeMember(id: string, memberId: string): Observable<Schedule> { if (this.usesApi()) return this.getById(id).pipe(switchMap((schedule) => this.replaceMembers(id, schedule.people.filter((item) => item.id !== memberId)))); return this.update(id, (schedule) => ({ ...schedule, people: schedule.people.filter((item) => item.id !== memberId) })); }
  addSong(id: string, song: ScheduledSong): Observable<Schedule> { if (this.usesApi()) return this.getById(id).pipe(switchMap((schedule) => this.replaceSongs(id, schedule.songs.some((item) => item.songId === song.songId) ? schedule.songs : [...schedule.songs, song]))); return this.update(id, (schedule) => ({ ...schedule, songs: schedule.songs.some((item) => item.songId === song.songId) ? schedule.songs : [...schedule.songs, song] })); }
  removeSong(id: string, itemId: string): Observable<Schedule> { if (this.usesApi()) return this.getById(id).pipe(switchMap((schedule) => this.replaceSongs(id, schedule.songs.filter((item) => item.id !== itemId)))); return this.update(id, (schedule) => ({ ...schedule, songs: schedule.songs.filter((item) => item.id !== itemId) })); }
  reorderSongs(id: string, songs: readonly ScheduledSong[]): Observable<Schedule> { if (this.usesApi()) return this.replaceSongs(id, songs); return this.update(id, (schedule) => ({ ...schedule, songs: [...songs] })); }
  publish(id: string): Observable<Schedule> { if (this.usesApi()) return this.http!.post<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}/publish`, {}, this.options()).pipe(map((item) => this.fromApi(item))); return this.update(id, (schedule) => ({ ...schedule, status: 'PUBLISHED' })); }
  archive(id: string): Observable<void> { if (this.usesApi()) return this.http!.delete<void>(`${environment.apiBaseUrl}/occurrences/${id}`, this.options()); const exists = this.schedules.some((schedule) => schedule.id === id); if (!exists) return throwError(() => new Error('SCHEDULE_NOT_FOUND')); this.schedules = this.schedules.filter((schedule) => schedule.id !== id); return of(undefined).pipe(delay(220)); }
  archiveMany(ids: readonly string[]): Observable<void> { if (this.usesApi()) return this.http!.post<void>(`${environment.apiBaseUrl}/occurrences/archive`, { ids }, this.options()); const selected = new Set(ids); this.schedules = this.schedules.filter((schedule) => !selected.has(schedule.id)); return of(undefined).pipe(delay(260)); }
  updateConfirmation(id: string, memberId: string, confirmation: Exclude<ConfirmationStatus, 'PENDING'>): Observable<Schedule> { if (this.usesApi()) return this.http!.patch<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}/members/${memberId}/confirmation`, { confirmation }, this.options()).pipe(map((item) => this.fromApi(item))); return this.update(id, (schedule) => ({ ...schedule, myConfirmation: confirmation, people: schedule.people.map((person) => person.id === memberId ? { ...person, confirmation } : person) })); }
  updateSetlistLyrics(id: string, itemId: string, content: LyricsDocument): Observable<Schedule> { if (this.usesApi()) return this.http!.patch<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}/setlist/items/${itemId}/lyrics`, { content }, this.options()).pipe(map((item) => this.fromApi(item))); return this.update(id, (schedule) => ({ ...schedule, songs: schedule.songs.map((song) => song.id === itemId ? { ...song, formattedLyrics: content } : song) })); }
  updateSetlistItem(id: string, itemId: string, input: ScheduleSetlistItemUpdate): Observable<Schedule> { if (this.usesApi()) return this.http!.patch<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}/setlist/items/${itemId}`, input, this.options()).pipe(map((item) => this.fromApi(item))); return this.update(id, (schedule) => ({ ...schedule, songs: schedule.songs.map((song) => song.id === itemId ? { ...song, ...input } : song) })); }
  private replaceMembers(id: string, people: readonly ScheduledPerson[]): Observable<Schedule> { return this.http!.put<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}/members`, { members: people.map((person) => ({ memberId: person.id, role: person.role })) }, this.options()).pipe(map((item) => this.fromApi(item))); }
  private replaceSongs(id: string, songs: readonly ScheduledSong[]): Observable<Schedule> { return this.http!.put<ApiOccurrence>(`${environment.apiBaseUrl}/occurrences/${id}/setlist`, { items: songs.map((song, index) => ({ songId: song.songId, position: index + 1, key: song.key, liturgicalMoment: song.liturgicalMoment, notes: song.notes })) }, this.options()).pipe(map((item) => this.fromApi(item))); }
  private update(id: string, mutation: (schedule: Schedule) => Schedule): Observable<Schedule> { const current = this.schedules.find((schedule) => schedule.id === id); if (!current) return throwError(() => new Error('SCHEDULE_NOT_FOUND')); const updated = mutation(current); this.schedules = this.schedules.map((schedule) => schedule.id === id ? updated : schedule); return of({ ...updated }).pipe(delay(220)); }
  private fromApi(item: ApiOccurrence): Schedule { const startsAt = new Date(item.startsAt); return { id: item.id, title: item.title, date: item.startsAt, time: new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: item.timezone || 'America/Fortaleza' }).format(startsAt), location: item.location, ministryId: item.ministryId, ministry: item.ministry ?? item.ministryId, timezone: item.timezone, version: item.version, canEdit: item.canEdit, status: item.status, liturgicalTime: item.liturgicalTime ?? '', notes: item.notes ?? '', myConfirmation: item.myConfirmation, memberCount: item.memberCount, repertoireCount: item.repertoireCount, people: (item.members ?? []).map((member) => ({ id: member.memberId, name: member.name, initials: member.initials, photoUrl: memberPhotoUrl(member.memberId, member.hasPhoto, member.photoUrl), whatsapp: member.whatsapp ?? '', role: member.role, confirmation: member.confirmation })), songs: (item.setlist?.items ?? []).map((song) => ({ id: song.id, songId: song.songId, title: song.title, key: song.key, liturgicalMoment: song.liturgicalMoment, notes: song.notes ?? undefined, lyricsSnapshot: song.lyricsSnapshot, formattedLyrics: song.formattedLyrics })) }; }
  private usesApi(): boolean { return Boolean(this.http) && !environment.useMocks; }
  private options() { return { withCredentials: true } as const; }
  private scheduleSlot(date: string, time: string, ministry: string): string { return `${date.slice(0, 10)}|${time}|${ministry.toLocaleLowerCase('pt-BR').replace(/^ministério\s+/, '')}`; }
}

import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Schedule, ScheduleInput, ScheduledPerson, ScheduledSong, ScheduleMemberOption, ScheduleSongOption } from '../models/schedule.model';
import { SCHEDULE_MEMBER_OPTIONS, SCHEDULE_SONG_OPTIONS, SCHEDULES_MOCK } from './schedules.mock';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private schedules: Schedule[] = SCHEDULES_MOCK.map((schedule) => ({ ...schedule }));
  list(): Observable<readonly Schedule[]> { return of(this.schedules.map((item) => ({ ...item }))).pipe(delay(280)); }
  getById(id: string): Observable<Schedule> {
    const schedule = this.schedules.find((item) => item.id === id);
    return schedule ? of({ ...schedule }).pipe(delay(220)) : throwError(() => new Error('SCHEDULE_NOT_FOUND'));
  }
  create(input: ScheduleInput): Observable<Schedule> {
    const schedule: Schedule = { ...input, id: `occ-${Date.now()}`, status: 'DRAFT' };
    this.schedules = [schedule, ...this.schedules];
    return of(schedule).pipe(delay(400));
  }
  listMemberOptions(): Observable<readonly ScheduleMemberOption[]> { return of(SCHEDULE_MEMBER_OPTIONS.map((item) => ({ ...item }))).pipe(delay(180)); }
  listSongOptions(): Observable<readonly ScheduleSongOption[]> { return of(SCHEDULE_SONG_OPTIONS.map((item) => ({ ...item }))).pipe(delay(180)); }
  addMember(id: string, member: ScheduledPerson): Observable<Schedule> { return this.update(id, (schedule) => ({ ...schedule, people: schedule.people.some((item) => item.id === member.id) ? schedule.people : [...schedule.people, member] })); }
  removeMember(id: string, memberId: string): Observable<Schedule> { return this.update(id, (schedule) => ({ ...schedule, people: schedule.people.filter((item) => item.id !== memberId) })); }
  addSong(id: string, song: ScheduledSong): Observable<Schedule> { return this.update(id, (schedule) => ({ ...schedule, songs: schedule.songs.some((item) => item.songId === song.songId) ? schedule.songs : [...schedule.songs, song] })); }
  removeSong(id: string, itemId: string): Observable<Schedule> { return this.update(id, (schedule) => ({ ...schedule, songs: schedule.songs.filter((item) => item.id !== itemId) })); }
  private update(id: string, mutation: (schedule: Schedule) => Schedule): Observable<Schedule> {
    const current = this.schedules.find((schedule) => schedule.id === id);
    if (!current) return throwError(() => new Error('SCHEDULE_NOT_FOUND'));
    const updated = mutation(current);
    this.schedules = this.schedules.map((schedule) => schedule.id === id ? updated : schedule);
    return of({ ...updated }).pipe(delay(220));
  }
}

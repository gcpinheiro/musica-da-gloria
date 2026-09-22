import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Schedule, ScheduleInput } from '../models/schedule.model';
import { SCHEDULES_MOCK } from './schedules.mock';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private schedules: Schedule[] = SCHEDULES_MOCK.map((schedule) => ({ ...schedule }));

  list(): Observable<readonly Schedule[]> { return of(this.schedules.map((item) => ({ ...item }))).pipe(delay(280)); }

  getById(id: string): Observable<Schedule> {
    const schedule = this.schedules.find((item) => item.id === id);
    return schedule ? of({ ...schedule }).pipe(delay(220)) : throwError(() => new Error('SCHEDULE_NOT_FOUND'));
  }

  create(input: ScheduleInput): Observable<Schedule> {
    const schedule: Schedule = { ...input, id: `occ-${Date.now()}`, status: 'DRAFT', people: [], songs: [] };
    this.schedules = [schedule, ...this.schedules];
    return of(schedule).pipe(delay(400));
  }
}

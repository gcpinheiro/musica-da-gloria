import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Ministry, MinistryInput } from '../models/ministry.model';
import { MINISTRIES_MOCK } from './ministries.mock';

@Injectable({ providedIn: 'root' })
export class MinistriesService {
  private ministries: Ministry[] = MINISTRIES_MOCK.map((item) => ({ ...item, participants: [...item.participants] }));

  list(): Observable<readonly Ministry[]> { return of(this.ministries.map((item) => ({ ...item }))).pipe(delay(250)); }
  getById(id: string): Observable<Ministry> {
    const ministry = this.ministries.find((item) => item.id === id);
    return ministry ? of({ ...ministry }).pipe(delay(200)) : throwError(() => new Error('MINISTRY_NOT_FOUND'));
  }
  create(input: MinistryInput): Observable<Ministry> {
    const ministry: Ministry = { ...input, id: `min-${Date.now()}`, active: true };
    this.ministries = [ministry, ...this.ministries];
    return of({ ...ministry }).pipe(delay(350));
  }
  update(id: string, input: MinistryInput): Observable<Ministry> {
    const current = this.ministries.find((item) => item.id === id);
    if (!current) return throwError(() => new Error('MINISTRY_NOT_FOUND'));
    const ministry = { ...current, ...input };
    this.ministries = this.ministries.map((item) => item.id === id ? ministry : item);
    return of({ ...ministry }).pipe(delay(350));
  }
  markGenerated(id: string, generatedThrough: string): Observable<Ministry> {
    const current = this.ministries.find((item) => item.id === id);
    if (!current) return throwError(() => new Error('MINISTRY_NOT_FOUND'));
    const ministry = { ...current, generatedThrough };
    this.ministries = this.ministries.map((item) => item.id === id ? ministry : item);
    return of({ ...ministry }).pipe(delay(200));
  }
  archive(id: string): Observable<void> {
    this.ministries = this.ministries.map((item) => item.id === id ? { ...item, active: false } : item);
    return of(undefined).pipe(delay(250));
  }
}

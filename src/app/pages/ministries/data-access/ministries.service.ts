import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Ministry, MinistryInput, MinistryParticipant, MinistryWeekday } from '../models/ministry.model';
import { MINISTRIES_MOCK } from './ministries.mock';
import { memberPhotoUrl } from '../../../shared/utils/member-photo-url';

interface ApiMinistryMember { readonly memberId: string; readonly name: string; readonly initials: string; readonly photoUrl?: string | null; readonly hasPhoto?: boolean; readonly whatsapp?: string | null; readonly role: string; }
interface ApiSeries { readonly id: string; readonly title: string; readonly location: string; readonly weekday: MinistryWeekday; readonly localTime: string; }
interface ApiMinistry { readonly id: string; readonly name: string; readonly status: 'ACTIVE' | 'ARCHIVED'; readonly members: readonly ApiMinistryMember[]; readonly series: readonly ApiSeries[]; }
export interface GenerationResult { readonly createdCount: number; readonly skippedCount: number; readonly generatedThrough: string; }

@Injectable({ providedIn: 'root' })
export class MinistriesService {
  private ministries: Ministry[] = MINISTRIES_MOCK.map((item) => ({ ...item, participants: [...item.participants] }));
  constructor(@Optional() private readonly http: HttpClient | null = null) {}
  list(): Observable<readonly Ministry[]> { if (this.usesApi()) return this.http!.get<readonly ApiMinistry[]>(`${environment.apiBaseUrl}/ministries`, this.options()).pipe(map((items) => items.map((item) => this.fromApi(item)))); return of(this.ministries.map((item) => ({ ...item }))).pipe(delay(250)); }
  getById(id: string): Observable<Ministry> { if (this.usesApi()) return this.http!.get<ApiMinistry>(`${environment.apiBaseUrl}/ministries/${id}`, this.options()).pipe(map((item) => this.fromApi(item))); const ministry = this.ministries.find((item) => item.id === id); return ministry ? of({ ...ministry }).pipe(delay(200)) : throwError(() => new Error('MINISTRY_NOT_FOUND')); }
  create(input: MinistryInput): Observable<Ministry> { if (this.usesApi()) return this.http!.post<ApiMinistry>(`${environment.apiBaseUrl}/ministries`, this.toApi(input), this.options()).pipe(map((item) => this.fromApi(item))); const ministry: Ministry = { ...input, id: `min-${Date.now()}`, active: true }; this.ministries = [ministry, ...this.ministries]; return of({ ...ministry }).pipe(delay(350)); }
  update(id: string, input: MinistryInput): Observable<Ministry> { if (this.usesApi()) return this.http!.patch<ApiMinistry>(`${environment.apiBaseUrl}/ministries/${id}`, this.toApi(input), this.options()).pipe(map((item) => this.fromApi(item))); const current = this.ministries.find((item) => item.id === id); if (!current) return throwError(() => new Error('MINISTRY_NOT_FOUND')); const ministry = { ...current, ...input }; this.ministries = this.ministries.map((item) => item.id === id ? ministry : item); return of({ ...ministry }).pipe(delay(350)); }
  generate(seriesId: string, throughDate: string): Observable<GenerationResult> { if (this.usesApi()) return this.http!.post<GenerationResult>(`${environment.apiBaseUrl}/celebration-series/${seriesId}/occurrences:generate`, { throughDate }, this.options()); return of({ createdCount: 0, skippedCount: 0, generatedThrough: throughDate }); }
  markGenerated(id: string, generatedThrough: string): Observable<Ministry> { const current = this.ministries.find((item) => item.id === id); if (!current) return throwError(() => new Error('MINISTRY_NOT_FOUND')); const ministry = { ...current, generatedThrough }; this.ministries = this.ministries.map((item) => item.id === id ? ministry : item); return of({ ...ministry }).pipe(delay(200)); }
  archive(id: string): Observable<void> { if (this.usesApi()) return this.http!.post<void>(`${environment.apiBaseUrl}/ministries/${id}/archive`, null, this.options()); this.ministries = this.ministries.map((item) => item.id === id ? { ...item, active: false } : item); return of(undefined).pipe(delay(250)); }
  private usesApi(): boolean { return Boolean(this.http) && !environment.useMocks; }
  private options() { return { withCredentials: true } as const; }
  private toApi(input: MinistryInput) { return { name: input.name, memberIds: input.participants.map((person) => person.id), defaultSeries: { title: input.celebrationTitle, location: input.location, weekday: input.weekday, localTime: input.time, timezone: 'America/Fortaleza' } }; }
  private fromApi(item: ApiMinistry): Ministry { const series = item.series[0]; const participants: MinistryParticipant[] = item.members.map((member) => ({ id: member.memberId, name: member.name, initials: member.initials, photoUrl: memberPhotoUrl(member.memberId, member.hasPhoto, member.photoUrl), whatsapp: member.whatsapp ?? '', role: member.role })); return { id: item.id, name: item.name, participants, weekday: series?.weekday ?? 'SUNDAY', time: series?.localTime?.slice(0, 5) ?? '00:00', celebrationTitle: series?.title ?? item.name, location: series?.location ?? '', active: item.status === 'ACTIVE', seriesId: series?.id }; }
}

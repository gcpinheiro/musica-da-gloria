import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AvailabilityRule, Member, MemberInput } from '../models/member.model';
import { MEMBERS_MOCK } from './members.mock';

interface ApiMember {
  readonly id: string; readonly name: string; readonly email: string; readonly phone: string;
  readonly photoUrl?: string | null; readonly initials: string; readonly talentIds?: readonly string[];
  readonly availability?: readonly AvailabilityRule[]; readonly notes?: string | null;
  readonly status: 'ACTIVE' | 'INACTIVE';
}
interface ApiPage<T> { readonly items: readonly T[]; }

@Injectable({ providedIn: 'root' })
export class MembersService {
  private members: Member[] = MEMBERS_MOCK.map((member) => ({ ...member }));
  constructor(@Optional() private readonly http: HttpClient | null = null) {}

  list(): Observable<readonly Member[]> {
    if (this.usesApi()) return this.http!.get<ApiPage<ApiMember>>(`${environment.apiBaseUrl}/members`, this.options()).pipe(map(({ items }) => items.map((item) => this.fromApi(item))));
    return of(this.members.map((member) => ({ ...member }))).pipe(delay(280));
  }
  getById(id: string): Observable<Member> {
    if (this.usesApi()) return this.http!.get<ApiMember>(`${environment.apiBaseUrl}/members/${id}`, this.options()).pipe(map((item) => this.fromApi(item)));
    const member = this.members.find((item) => item.id === id);
    return member ? of({ ...member }).pipe(delay(220)) : throwError(() => new Error('MEMBER_NOT_FOUND'));
  }
  create(input: MemberInput): Observable<Member> {
    if (this.usesApi()) return this.http!.post<ApiMember>(`${environment.apiBaseUrl}/members`, this.toApi(input), this.options()).pipe(switchMap((member) => this.uploadPhoto(member, input.photoUrl)), map((member) => this.fromApi(member)));
    const member: Member = { ...input, id: `mem-${Date.now()}`, initials: this.initials(input.name), status: 'ACTIVE' };
    this.members = [member, ...this.members];
    return of({ ...member }).pipe(delay(420));
  }
  update(id: string, input: MemberInput): Observable<Member> {
    if (this.usesApi()) return this.http!.patch<ApiMember>(`${environment.apiBaseUrl}/members/${id}`, this.toApi(input), this.options()).pipe(switchMap((member) => this.uploadPhoto(member, input.photoUrl)), map((member) => this.fromApi(member)));
    const current = this.members.find((member) => member.id === id);
    if (!current) return throwError(() => new Error('MEMBER_NOT_FOUND'));
    const updated: Member = { ...current, ...input, initials: this.initials(input.name) };
    this.members = this.members.map((member) => member.id === id ? updated : member);
    return of({ ...updated }).pipe(delay(420));
  }
  deactivate(id: string): Observable<void> {
    if (this.usesApi()) return this.http!.post<void>(`${environment.apiBaseUrl}/members/${id}/archive`, null, this.options());
    this.members = this.members.map((member) => member.id === id ? { ...member, status: 'INACTIVE' } : member);
    return of(undefined).pipe(delay(300));
  }
  invite(member: Member): Observable<void> {
    if (!this.usesApi()) return of(undefined).pipe(delay(200));
    return this.http!.post<void>(`${environment.apiBaseUrl}/users/invitations`, { role: 'MEMBER', memberId: member.id, email: member.email }, this.options());
  }

  private usesApi(): boolean { return Boolean(this.http) && !environment.useMocks; }
  private options() { return { withCredentials: true } as const; }
  private toApi(input: MemberInput) { return { name: input.name, email: input.email, phone: input.phone, talentIds: input.talents, availability: [input.availability], notes: input.notes }; }
  private fromApi(item: ApiMember): Member {
    return { id: item.id, name: item.name, email: item.email, phone: item.phone, photoUrl: item.photoUrl ?? undefined, initials: item.initials, talents: item.talentIds ?? [], ministries: [], availability: item.availability?.[0] ?? { weekday: 'SUNDAY', startTime: '00:00', endTime: '23:59' }, status: item.status, notes: item.notes ?? '' };
  }
  private uploadPhoto(member: ApiMember, value?: string): Observable<ApiMember> {
    if (!value?.startsWith('data:image/')) return of(member);
    const [metadata, encoded] = value.split(',');
    const mime = metadata.match(/^data:([^;]+)/)?.[1] ?? 'image/jpeg';
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const form = new FormData();
    form.append('file', new Blob([bytes], { type: mime }), `member.${mime.split('/')[1] ?? 'jpg'}`);
    return this.http!.put<{ photoUrl: string }>(`${environment.apiBaseUrl}/members/${member.id}/photo`, form, this.options()).pipe(map(({ photoUrl }) => ({ ...member, photoUrl })));
  }
  private initials(name: string): string { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''); }
}

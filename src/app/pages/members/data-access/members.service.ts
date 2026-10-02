import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AvailabilityRule, Member, MemberInput, MemberInvitation, MemberInvitationWithLink, MemberMinistryOption } from '../models/member.model';
import { MEMBERS_MOCK } from './members.mock';
import { memberPhotoUrl } from '../../../shared/utils/member-photo-url';

interface ApiMember {
  readonly id: string; readonly name: string; readonly email: string; readonly phone: string | null;
  readonly photoUrl?: string | null; readonly hasPhoto?: boolean; readonly initials: string; readonly talentIds?: readonly string[];
  readonly availability?: readonly AvailabilityRule[]; readonly notes?: string | null;
  readonly status: 'ACTIVE' | 'INACTIVE';
  readonly ministries?: readonly MemberMinistryOption[];
}
interface ApiPage<T> { readonly items: readonly T[]; }
interface ApiMinistryOption { readonly id: string; readonly name: string; readonly status: string; }

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
  listMinistryOptions(): Observable<readonly MemberMinistryOption[]> {
    if (!this.usesApi()) return of([]).pipe(delay(100));
    return this.http!.get<readonly ApiMinistryOption[]>(`${environment.apiBaseUrl}/ministries`, this.options()).pipe(
      map((items) => items.filter((item) => item.status === 'ACTIVE').map(({ id, name }) => ({ id, name }))),
    );
  }
  create(input: MemberInput): Observable<Member> {
    if (this.usesApi()) return this.http!.post<ApiMember>(`${environment.apiBaseUrl}/members`, this.toApi(input), this.options()).pipe(map((member) => this.fromApi(member)));
    const member: Member = { ...input, id: `mem-${Date.now()}`, initials: this.initials(input.name), status: 'ACTIVE' };
    this.members = [member, ...this.members];
    return of({ ...member }).pipe(delay(420));
  }
  update(id: string, input: MemberInput): Observable<Member> {
    if (this.usesApi()) return this.http!.patch<ApiMember>(`${environment.apiBaseUrl}/members/${id}`, this.toApi(input), this.options()).pipe(map((member) => this.fromApi(member)));
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
  listInvitations(): Observable<readonly MemberInvitation[]> {
    if (!this.usesApi()) return of([]).pipe(delay(100));
    return this.http!.get<readonly MemberInvitation[]>(`${environment.apiBaseUrl}/users/invitations`, this.options());
  }
  invite(member: Member): Observable<MemberInvitationWithLink> {
    if (!this.usesApi()) return throwError(() => new Error('API_REQUIRED'));
    return this.http!.post<MemberInvitationWithLink>(`${environment.apiBaseUrl}/users/invitations`, { role: 'MEMBER', memberId: member.id, email: member.email }, this.options());
  }
  obtainInvitationLink(invitationId: string): Observable<MemberInvitationWithLink> {
    if (!this.usesApi()) return throwError(() => new Error('API_REQUIRED'));
    return this.http!.post<MemberInvitationWithLink>(`${environment.apiBaseUrl}/users/invitations/${encodeURIComponent(invitationId)}/link`, {}, this.options());
  }

  private usesApi(): boolean { return Boolean(this.http) && !environment.useMocks; }
  private options() { return { withCredentials: true } as const; }
  private toApi(input: MemberInput) { return { name: input.name, email: input.email, phone: this.normalizePhone(input.phone), talentIds: input.talents, ministryIds: input.ministries, availability: [input.availability], notes: input.notes }; }
  private fromApi(item: ApiMember): Member {
    return { id: item.id, name: item.name, email: item.email, phone: item.phone ?? '', photoUrl: memberPhotoUrl(item.id, item.hasPhoto, item.photoUrl), initials: item.initials, talents: item.talentIds ?? [], ministries: item.ministries?.map((ministry) => ministry.name) ?? [], ministryIds: item.ministries?.map((ministry) => ministry.id) ?? [], availability: item.availability?.[0] ?? { weekday: 'SUNDAY', startTime: '00:00', endTime: '23:59' }, status: item.status, notes: item.notes ?? '' };
  }
  private initials(name: string): string { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''); }
  private normalizePhone(value: string): string | undefined { let digits = value.replace(/\D/g, ''); if (!digits) return undefined; if (digits.length === 10 || digits.length === 11) digits = `55${digits}`; return `+${digits}`; }
}

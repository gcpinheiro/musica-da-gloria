import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Member, MemberInput } from '../models/member.model';
import { MEMBERS_MOCK } from './members.mock';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private members: Member[] = MEMBERS_MOCK.map((member) => ({ ...member }));

  list(): Observable<readonly Member[]> {
    return of(this.members.map((member) => ({ ...member }))).pipe(delay(280));
  }

  getById(id: string): Observable<Member> {
    const member = this.members.find((item) => item.id === id);
    return member ? of({ ...member }).pipe(delay(220)) : throwError(() => new Error('MEMBER_NOT_FOUND'));
  }

  create(input: MemberInput): Observable<Member> {
    const member: Member = {
      ...input,
      id: `mem-${Date.now()}`,
      initials: this.initials(input.name),
      status: 'ACTIVE',
    };
    this.members = [member, ...this.members];
    return of({ ...member }).pipe(delay(420));
  }

  update(id: string, input: MemberInput): Observable<Member> {
    const current = this.members.find((member) => member.id === id);
    if (!current) {
      return throwError(() => new Error('MEMBER_NOT_FOUND'));
    }
    const updated: Member = { ...current, ...input, initials: this.initials(input.name) };
    this.members = this.members.map((member) => member.id === id ? updated : member);
    return of({ ...updated }).pipe(delay(420));
  }

  deactivate(id: string): Observable<void> {
    this.members = this.members.map((member) => member.id === id ? { ...member, status: 'INACTIVE' } : member);
    return of(undefined).pipe(delay(300));
  }

  private initials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LeaderInvitationInput, Parish, ParishInput } from '../models/administration.model';

@Injectable({ providedIn: 'root' })
export class AdministrationService {
  private readonly http = inject(HttpClient);
  private readonly options = { withCredentials: true } as const;
  listParishes(): Observable<readonly Parish[]> { return this.http.get<readonly Parish[]>(`${environment.apiBaseUrl}/parishes`, this.options); }
  createParish(input: ParishInput): Observable<Parish> { return this.http.post<Parish>(`${environment.apiBaseUrl}/parishes`, input, this.options); }
  inviteLeader(input: LeaderInvitationInput): Observable<void> { return this.http.post<void>(`${environment.apiBaseUrl}/users/invitations`, { ...input, role: 'LEADER' }, this.options); }
}

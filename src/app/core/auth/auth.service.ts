import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AuthUser, InvitationAcceptance, LoginCredentials } from './auth.models';
import { environment } from '../../../environments/environment';
import { memberPhotoUrl } from '../../shared/utils/member-photo-url';

const DEMO_USERS: readonly AuthUser[] = [{
  id: 'usr-leader-01',
  name: 'Eury',
  email: 'lider@musicadagloria.org.br',
  role: 'LEADER',
  initials: 'E',
  parishId: 'parish-demo',
  memberId: 'mem-001',
}, {
  id: 'usr-member-01',
  name: 'Rafael Lima',
  email: 'membro@musicadagloria.org.br',
  role: 'MEMBER',
  initials: 'RL',
  parishId: 'parish-demo',
  memberId: 'mem-002',
}];

interface AuthSession { readonly user: AuthUser; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(@Optional() private readonly http: HttpClient | null = null) {}

  login(credentials: LoginCredentials): Observable<AuthUser> {
    if (this.http && !environment.useMocks) {
      return new Observable<AuthUser>((subscriber) => {
        this.http!.post<AuthSession>(`${environment.apiBaseUrl}/auth/login`, credentials, { withCredentials: true })
          .subscribe({ next: ({ user }) => { subscriber.next(this.present(user)); subscriber.complete(); }, error: (error) => subscriber.error(error) });
      });
    }
    const user = DEMO_USERS.find((item) => item.email === credentials.email.trim().toLowerCase());
    const validCredentials = user && credentials.password === 'gloria2026';

    if (!validCredentials) {
      return throwError(() => new Error('INVALID_CREDENTIALS')).pipe(delay(450));
    }

    return of(user).pipe(delay(550));
  }

  logout(): Observable<void> {
    if (this.http && !environment.useMocks) {
      return this.http.post<void>(`${environment.apiBaseUrl}/auth/logout`, null, { withCredentials: true });
    }
    return of(undefined).pipe(delay(150));
  }

  me(): Observable<AuthUser> {
    if (this.http && !environment.useMocks) {
      return new Observable<AuthUser>((subscriber) => {
        this.http!.get<AuthSession>(`${environment.apiBaseUrl}/auth/me`, { withCredentials: true })
          .subscribe({ next: ({ user }) => { subscriber.next(this.present(user)); subscriber.complete(); }, error: (error) => subscriber.error(error) });
      });
    }
    return throwError(() => new Error('UNAUTHENTICATED'));
  }

  acceptInvitation(token: string, input: InvitationAcceptance): Observable<AuthUser> {
    if (!this.http) return throwError(() => new Error('API_REQUIRED'));
    return new Observable<AuthUser>((subscriber) => {
      this.http!.post<AuthSession>(`${environment.apiBaseUrl}/users/invitations/${encodeURIComponent(token)}/accept`, input, { withCredentials: true })
        .subscribe({ next: ({ user }) => { subscriber.next(this.present(user)); subscriber.complete(); }, error: (error) => subscriber.error(error) });
    });
  }

  private present(user: AuthUser): AuthUser {
    return { ...user, photoUrl: user.memberId ? memberPhotoUrl(user.memberId, user.hasPhoto) : undefined };
  }
}

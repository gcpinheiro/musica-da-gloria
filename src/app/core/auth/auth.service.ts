import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AuthUser, LoginCredentials } from './auth.models';

const DEMO_USERS: readonly AuthUser[] = [{
  id: 'usr-leader-01',
  name: 'Eury',
  email: 'lider@musicadagloria.org.br',
  role: 'LEADER',
  initials: 'E',
}, {
  id: 'usr-member-01',
  name: 'Rafael Lima',
  email: 'membro@musicadagloria.org.br',
  role: 'MEMBER',
  initials: 'RL',
}];

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(credentials: LoginCredentials): Observable<AuthUser> {
    const user = DEMO_USERS.find((item) => item.email === credentials.email.trim().toLowerCase());
    const validCredentials = user && credentials.password === 'gloria2026';

    if (!validCredentials) {
      return throwError(() => new Error('INVALID_CREDENTIALS')).pipe(delay(450));
    }

    return of(user).pipe(delay(550));
  }

  logout(): Observable<void> {
    return of(undefined).pipe(delay(150));
  }
}

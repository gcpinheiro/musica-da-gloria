import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { AuthUser, LoginCredentials } from './auth.models';

const DEMO_USER: AuthUser = {
  id: 'usr-leader-01',
  name: 'Eury',
  email: 'lider@musicadagloria.org.br',
  role: 'LEADER',
  initials: 'E',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(credentials: LoginCredentials): Observable<AuthUser> {
    const validCredentials =
      credentials.email.trim().toLowerCase() === DEMO_USER.email &&
      credentials.password === 'gloria2026';

    if (!validCredentials) {
      return throwError(() => new Error('INVALID_CREDENTIALS')).pipe(delay(450));
    }

    return of(DEMO_USER).pipe(delay(550));
  }

  logout(): Observable<void> {
    return of(undefined).pipe(delay(150));
  }
}

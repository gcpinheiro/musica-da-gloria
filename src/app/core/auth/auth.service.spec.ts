import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('uses Eury as the demonstration leader', async () => {
    const user = await firstValueFrom(new AuthService().login({
      email: 'lider@musicadagloria.org.br',
      password: 'gloria2026',
    }));

    expect(user.name).toBe('Eury');
    expect(user.initials).toBe('E');
    expect(user.role).toBe('LEADER');
  });

  it('authenticates a read-only ministry member', async () => {
    const user = await firstValueFrom(new AuthService().login({
      email: 'membro@musicadagloria.org.br',
      password: 'gloria2026',
    }));

    expect(user.name).toBe('Rafael Lima');
    expect(user.role).toBe('MEMBER');
    expect(user.memberId).toBe('mem-002');
  });

  it('validates an invitation before the activation form is shown', () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), AuthService, provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(AuthService);
    const http = TestBed.inject(HttpTestingController);
    let valid = false;

    service.validateInvitation('token with spaces').subscribe((result) => { valid = result.valid; });
    const request = http.expectOne(`${environment.apiBaseUrl}/users/invitations/token%20with%20spaces/validate`);
    expect(request.request.method).toBe('GET');
    request.flush({ valid: true, expiresAt: '2026-10-07T15:00:00.000Z' });

    expect(valid).toBeTrue();
    http.verify();
  });
});

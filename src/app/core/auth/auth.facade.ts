import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { AuthUser, InvitationAcceptance, LoginCredentials } from './auth.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly user = this.userState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly canManage = computed(() => this.userState()?.role === 'LEADER');
  readonly isSuperAdmin = computed(() => this.userState()?.role === 'SUPER_ADMIN');
  readonly isMember = computed(() => this.userState()?.role === 'MEMBER');

  restoreSession(): Observable<void> {
    if (!isPlatformBrowser(this.platformId)) return of(undefined);
    return this.authService.me().pipe(
      map((user) => { this.userState.set(user); }),
      catchError(() => { this.userState.set(null); return of(undefined); }),
    );
  }

  login(credentials: LoginCredentials): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.authService
      .login(credentials)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (user) => {
          this.userState.set(user);
          void this.router.navigateByUrl(user.role === 'SUPER_ADMIN' ? '/administracao' : '/dashboard');
        },
        error: () => {
          this.errorState.set('E-mail ou senha inválidos. Confira os dados e tente novamente.');
        },
      });
  }

  acceptInvitation(token: string, input: InvitationAcceptance): void {
    this.loadingState.set(true); this.errorState.set(null);
    this.authService.acceptInvitation(token, input).pipe(finalize(() => this.loadingState.set(false))).subscribe({
      next: (user) => { this.userState.set(user); void this.router.navigateByUrl('/dashboard'); },
      error: () => this.errorState.set('Não foi possível aceitar o convite. Verifique o link e os dados informados.'),
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.userState.set(null);
      void this.router.navigateByUrl('/login');
    });
  }
}

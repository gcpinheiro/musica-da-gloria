import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthUser, LoginCredentials } from './auth.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly userState = signal<AuthUser | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly user = this.userState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly canManage = computed(() => ['ADMIN', 'LEADER'].includes(this.userState()?.role ?? ''));
  readonly isMember = computed(() => this.userState()?.role === 'MEMBER');

  login(credentials: LoginCredentials): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.authService
      .login(credentials)
      .pipe(finalize(() => this.loadingState.set(false)))
      .subscribe({
        next: (user) => {
          this.userState.set(user);
          void this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.errorState.set('E-mail ou senha inválidos. Confira os dados e tente novamente.');
        },
      });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.userState.set(null);
      void this.router.navigateByUrl('/login');
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

interface NavigationItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly exact?: boolean;
  readonly managementOnly?: boolean;
  readonly pastoralOnly?: boolean;
  readonly superAdminOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShell {
  protected readonly authFacade = inject(AuthFacade);
  protected readonly menuOpen = signal(false);
  private readonly navigation: readonly NavigationItem[] = [
    { label: 'Administração', route: '/administracao', icon: '⚙', superAdminOnly: true },
    { label: 'Visão geral', route: '/dashboard', icon: '⌂', exact: true, pastoralOnly: true },
    { label: 'Escalas', route: '/escalas', icon: '▦', pastoralOnly: true },
    { label: 'Membros', route: '/membros', icon: '♙', managementOnly: true, pastoralOnly: true },
    { label: 'Ministérios', route: '/ministerios', icon: '♫', managementOnly: true, pastoralOnly: true },
    { label: 'Repertório', route: '/repertorio', icon: '♫', pastoralOnly: true },
  ];
  protected readonly visibleNavigation = computed(() =>
    this.navigation.filter((item) =>
      (!item.managementOnly || this.authFacade.canManage()) &&
      (!item.superAdminOnly || this.authFacade.isSuperAdmin()) &&
      (!item.pastoralOnly || !this.authFacade.isSuperAdmin())),
  );

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

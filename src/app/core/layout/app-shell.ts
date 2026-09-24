import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

interface NavigationItem {
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly exact?: boolean;
  readonly managementOnly?: boolean;
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
    { label: 'Visão geral', route: '/dashboard', icon: '⌂', exact: true },
    { label: 'Escalas', route: '/escalas', icon: '▦' },
    { label: 'Membros', route: '/membros', icon: '♙', managementOnly: true },
    { label: 'Repertório', route: '/repertorio', icon: '♫' },
  ];
  protected readonly visibleNavigation = computed(() =>
    this.navigation.filter((item) => !item.managementOnly || this.authFacade.canManage()),
  );

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

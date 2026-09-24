import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';
import { AppShell } from './app-shell';

describe('AppShell', () => {
  it('shows an explicit sign-out action in the sidebar', async () => {
    const logout = jasmine.createSpy('logout');
    await TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: {
            user: signal({ name: 'Eury', initials: 'E' }),
            canManage: signal(true),
            isMember: signal(false),
            logout,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.logout') as HTMLButtonElement;

    expect(button.textContent).toContain('Sair da conta');
    button.click();
    expect(logout).toHaveBeenCalled();
  });

  it('hides management navigation for a member', async () => {
    await TestBed.resetTestingModule().configureTestingModule({
      imports: [AppShell],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        {
          provide: AuthFacade,
          useValue: {
            user: signal({ name: 'Rafael Lima', initials: 'RL' }),
            canManage: signal(false),
            isMember: signal(true),
            logout: jasmine.createSpy('logout'),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const sidebar = fixture.nativeElement.querySelector('.sidebar') as HTMLElement;

    expect(sidebar.textContent).not.toContain('Membros');
    expect(sidebar.textContent).toContain('Escalas');
    expect(sidebar.textContent).toContain('Repertório');
    expect(sidebar.textContent).toContain('Membro do ministério');
  });
});

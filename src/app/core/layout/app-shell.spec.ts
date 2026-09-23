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
        { provide: AuthFacade, useValue: { user: signal({ name: 'Gabriel', initials: 'E' }), logout } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppShell);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.logout') as HTMLButtonElement;

    expect(button.textContent).toContain('Sair da conta');
    button.click();
    expect(logout).toHaveBeenCalled();
  });
});

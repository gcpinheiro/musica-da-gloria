import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';
import { managementGuard } from './auth.guard';

describe('managementGuard', () => {
  const router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

  function runGuard(authenticated: boolean, canManage: boolean): boolean | UrlTree {
    router.createUrlTree.calls.reset();
    router.createUrlTree.and.returnValue({} as UrlTree);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        {
          provide: AuthFacade,
          useValue: { isAuthenticated: signal(authenticated), canManage: signal(canManage) },
        },
      ],
    });

    return TestBed.runInInjectionContext(() => managementGuard({} as never, {} as never)) as boolean | UrlTree;
  }

  afterEach(() => TestBed.resetTestingModule());

  it('allows leaders to access management routes', () => {
    expect(runGuard(true, true)).toBeTrue();
  });

  it('redirects members away from management routes', () => {
    expect(runGuard(true, false)).toEqual({} as UrlTree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
  });
});

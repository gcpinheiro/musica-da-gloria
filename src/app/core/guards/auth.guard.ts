import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../auth/auth.facade';

export const authGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  return authFacade.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const managementGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (!authFacade.isAuthenticated()) return router.createUrlTree(['/login']);
  return authFacade.canManage() ? true : router.createUrlTree(['/dashboard']);
};

export const superAdminGuard: CanActivateFn = () => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) return true;
  const authFacade = inject(AuthFacade); const router = inject(Router);
  if (!authFacade.isAuthenticated()) return router.createUrlTree(['/login']);
  return authFacade.isSuperAdmin() ? true : router.createUrlTree(['/dashboard']);
};

import { registerLocaleData } from '@angular/common';
import ptLocale from '@angular/common/locales/pt';
import { ApplicationConfig, inject, LOCALE_ID, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AuthFacade } from './core/auth/auth.facade';

registerLocaleData(ptLocale, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideAppInitializer(() => inject(AuthFacade).restoreSession()),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
  ]
};

import { formatDate } from '@angular/common';
import { appConfig } from './app.config';

describe('app locale', () => {
  it('registers Brazilian Portuguese for date formatting', () => {
    expect(appConfig.providers).toBeDefined();
    expect(formatDate('2026-09-22T12:00:00Z', 'EEEE, d MMMM', 'pt-BR', 'UTC'))
      .toBe('terça-feira, 22 setembro');
  });
});

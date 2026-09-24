import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('uses Eury as the demonstration leader', async () => {
    const user = await firstValueFrom(new AuthService().login({
      email: 'lider@musicadagloria.org.br',
      password: 'gloria2026',
    }));

    expect(user.name).toBe('Eury');
    expect(user.initials).toBe('E');
    expect(user.role).toBe('LEADER');
  });

  it('authenticates a read-only ministry member', async () => {
    const user = await firstValueFrom(new AuthService().login({
      email: 'membro@musicadagloria.org.br',
      password: 'gloria2026',
    }));

    expect(user.name).toBe('Rafael Lima');
    expect(user.role).toBe('MEMBER');
  });
});

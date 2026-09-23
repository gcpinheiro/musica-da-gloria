import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('uses Gabriel as the demonstration leader', async () => {
    const user = await firstValueFrom(new AuthService().login({
      email: 'lider@musicadagloria.org.br',
      password: 'gloria2026',
    }));

    expect(user.name).toBe('Gabriel');
    expect(user.initials).toBe('E');
  });
});

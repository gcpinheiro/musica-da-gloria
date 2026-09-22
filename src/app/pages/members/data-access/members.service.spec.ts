import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let service: MembersService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(MembersService);
  });

  it('lists the mocked members', async () => {
    const members = await firstValueFrom(service.list());
    expect(members.length).toBeGreaterThan(0);
  });

  it('creates a member and preserves it in the session', async () => {
    const created = await firstValueFrom(service.create({
      name: 'Pessoa de Teste',
      email: 'pessoa@exemplo.org',
      phone: '(85) 99999-0000',
      talents: ['Voz de apoio'],
      ministries: [],
      availability: { weekday: 'SATURDAY', startTime: '17:00', endTime: '20:00' },
      notes: '',
    }));
    const members = await firstValueFrom(service.list());
    const found = members.some((member) => member.id === created.id);
    expect(found).toBeTrue();
  });
});

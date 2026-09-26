import { firstValueFrom } from 'rxjs';
import { MinistriesService } from './ministries.service';

describe('MinistriesService', () => {
  it('creates, updates and archives a ministry without deleting its history', async () => {
    const service = new MinistriesService();
    const created = await firstValueFrom(service.create({ name: 'Ministério São José', weekday: 'SATURDAY', time: '18:00', celebrationTitle: 'Santa Missa', location: 'Igreja Matriz', participants: [] }));
    const updated = await firstValueFrom(service.update(created.id, { name: created.name, weekday: 'SUNDAY', time: '09:00', celebrationTitle: created.celebrationTitle, location: created.location, participants: [] }));
    await firstValueFrom(service.archive(created.id));
    const archived = await firstValueFrom(service.getById(created.id));

    expect(updated.weekday).toBe('SUNDAY');
    expect(archived.active).toBeFalse();
  });
});

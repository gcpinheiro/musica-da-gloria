import { DashboardData, WeekSchedule } from '../models/dashboard.model';
import { NewsItem } from '../models/dashboard.model';

function isoDate(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

function recurringSchedules(): WeekSchedule[] {
  const schedules: WeekSchedule[] = [];
  for (let offset = -370; offset <= 370; offset += 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    if (date.getDay() === 0) {
      schedules.push({ id: `occ-rec-${offset}-09`, title: 'Santa Missa Dominical', ministry: 'Ministério São José', date: date.toISOString(), time: '09:00', location: 'Igreja Matriz', liturgicalTime: 'Tempo Comum', status: 'CONFIRMED', members: [{ id: 'mem-006', name: 'João Pedro', initials: 'JP', role: 'Voz', confirmed: true }, { id: 'mem-007', name: 'Lia Martins', initials: 'LM', role: 'Teclado', confirmed: true }], totalMembers: 5, repertoireCount: 7 });
      schedules.push({ id: `occ-rec-${offset}-19`, title: 'Santa Missa Dominical', ministry: 'Ministério Magnificat', date: date.toISOString(), time: '19:00', location: 'Igreja Matriz', liturgicalTime: 'Tempo Comum', status: offset % 3 === 0 ? 'ATTENTION' : 'CONFIRMED', members: [{ id: 'mem-001', name: 'Ana Clara', initials: 'AC', role: 'Voz', confirmed: true }, { id: 'mem-002', name: 'Rafael Lima', initials: 'RL', role: 'Violão', confirmed: true }], totalMembers: 6, repertoireCount: 8, alert: offset % 3 === 0 ? '1 função ainda sem músico' : undefined });
    }
    if (date.getDay() === 4) {
      schedules.push({ id: `occ-rec-${offset}-adoracao`, title: 'Adoração ao Santíssimo', ministry: 'Ministério Adoremus', date: date.toISOString(), time: '19:30', location: 'Capela do Santíssimo', liturgicalTime: 'Adoração', status: 'PENDING', members: [{ id: 'mem-004', name: 'Camila Sousa', initials: 'CS', role: 'Voz', confirmed: true }, { id: 'mem-005', name: 'Daniel Rocha', initials: 'DR', role: 'Violão', confirmed: false }], totalMembers: 4, repertoireCount: 5, alert: '1 confirmação pendente' });
    }
  }
  return schedules;
}

export const DASHBOARD_MOCK: DashboardData = {
  summary: {
    celebrations: 5,
    confirmedMembers: 18,
    pendingConfirmations: 4,
    openPositions: 2,
  },
  schedules: [
    ...recurringSchedules(),
    {
      id: 'occ-001',
      title: 'Santa Missa',
      ministry: 'Ministério Magnificat',
      date: isoDate(1),
      time: '18:30',
      location: 'Igreja Matriz',
      liturgicalTime: 'Tempo Comum',
      status: 'CONFIRMED',
      members: [
        { id: 'mem-001', name: 'Ana Clara', initials: 'AC', role: 'Voz', confirmed: true },
        { id: 'mem-002', name: 'Rafael Lima', initials: 'RL', role: 'Violão', confirmed: true },
        { id: 'mem-003', name: 'Bruno Melo', initials: 'BM', role: 'Teclado', confirmed: true },
      ],
      totalMembers: 6,
      repertoireCount: 8,
    },
    {
      id: 'occ-002',
      title: 'Adoração ao Santíssimo',
      ministry: 'Ministério Adoremus',
      date: isoDate(3),
      time: '19:30',
      location: 'Capela do Santíssimo',
      liturgicalTime: 'Adoração',
      status: 'PENDING',
      members: [
        { id: 'mem-004', name: 'Camila Sousa', initials: 'CS', role: 'Voz', confirmed: true },
        { id: 'mem-005', name: 'Daniel Rocha', initials: 'DR', role: 'Violão', confirmed: false },
      ],
      totalMembers: 5,
      repertoireCount: 6,
      alert: '2 confirmações pendentes',
    },
    {
      id: 'occ-003',
      title: 'Santa Missa Dominical',
      ministry: 'Ministério São José',
      date: isoDate(6),
      time: '09:00',
      location: 'Igreja Matriz',
      liturgicalTime: '25º Domingo do Tempo Comum',
      status: 'ATTENTION',
      members: [
        { id: 'mem-006', name: 'João Pedro', initials: 'JP', role: 'Voz', confirmed: true },
        { id: 'mem-007', name: 'Lia Martins', initials: 'LM', role: 'Teclado', confirmed: true },
      ],
      totalMembers: 5,
      repertoireCount: 7,
      alert: 'Bateria ainda sem músico',
    },
    {
      id: 'occ-004',
      title: 'Santa Missa Dominical',
      ministry: 'Ministério Magnificat',
      date: isoDate(6),
      time: '19:00',
      location: 'Igreja Matriz',
      liturgicalTime: '25º Domingo do Tempo Comum',
      status: 'CONFIRMED',
      members: [
        { id: 'mem-001', name: 'Ana Clara', initials: 'AC', role: 'Voz', confirmed: true },
        { id: 'mem-008', name: 'Paulo Nunes', initials: 'PN', role: 'Baixo', confirmed: true },
        { id: 'mem-009', name: 'Sara Alves', initials: 'SA', role: 'Bateria', confirmed: true },
      ],
      totalMembers: 7,
      repertoireCount: 9,
    },
  ],
};

export const NEWS_MOCK: readonly NewsItem[] = [
  { id: 'news-001', title: 'Ensaio geral dos ministérios', body: 'No próximo sábado teremos ensaio geral às 16h, na Igreja Matriz. Levem seus instrumentos e cheguem com antecedência.', publishedAt: new Date().toISOString(), author: 'Eury' },
  { id: 'news-002', title: 'Novo repertório para o Tempo Comum', body: 'As cifras-base já estão disponíveis na biblioteca. Confiram os tons antes do ensaio de cada ministério.', publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(), author: 'Eury' },
];

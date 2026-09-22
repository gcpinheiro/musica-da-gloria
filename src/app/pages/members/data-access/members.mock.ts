import { Member } from '../models/member.model';

export const MEMBERS_MOCK: readonly Member[] = [
  {
    id: 'mem-001', name: 'Ana Clara Mendes', email: 'ana.clara@exemplo.org', phone: '(85) 99911-2030', initials: 'AC',
    talents: ['Voz principal', 'Voz de apoio'], ministries: ['Magnificat'], availability: { weekday: 'SUNDAY', startTime: '17:00', endTime: '21:00' }, status: 'ACTIVE',
    notes: 'Preferência por repertório em tons médios.',
  },
  {
    id: 'mem-002', name: 'Rafael Lima', email: 'rafael.lima@exemplo.org', phone: '(85) 99842-6125', initials: 'RL',
    talents: ['Violão', 'Guitarra'], ministries: ['Magnificat', 'São José'], availability: { weekday: 'SUNDAY', startTime: '07:00', endTime: '20:30' }, status: 'ACTIVE', notes: '',
  },
  {
    id: 'mem-003', name: 'Bruno Melo', email: 'bruno.melo@exemplo.org', phone: '(85) 99763-1180', initials: 'BM',
    talents: ['Teclado'], ministries: ['Magnificat'], availability: { weekday: 'SATURDAY', startTime: '16:00', endTime: '20:00' }, status: 'ACTIVE', notes: '',
  },
  {
    id: 'mem-004', name: 'Camila Sousa', email: 'camila.sousa@exemplo.org', phone: '(85) 99120-7784', initials: 'CS',
    talents: ['Voz principal'], ministries: ['Adoremus'], availability: { weekday: 'THURSDAY', startTime: '18:30', endTime: '22:00' }, status: 'ACTIVE', notes: '',
  },
  {
    id: 'mem-005', name: 'Daniel Rocha', email: 'daniel.rocha@exemplo.org', phone: '(85) 99617-3320', initials: 'DR',
    talents: ['Violão', 'Baixo'], ministries: ['Adoremus'], availability: { weekday: 'THURSDAY', startTime: '18:00', endTime: '22:00' }, status: 'ACTIVE', notes: '',
  },
  {
    id: 'mem-006', name: 'João Pedro Silva', email: 'joao.pedro@exemplo.org', phone: '(85) 99201-4588', initials: 'JP',
    talents: ['Voz de apoio', 'Percussão'], ministries: ['São José'], availability: { weekday: 'SUNDAY', startTime: '06:30', endTime: '12:00' }, status: 'ACTIVE', notes: '',
  },
  {
    id: 'mem-007', name: 'Lia Martins', email: 'lia.martins@exemplo.org', phone: '(85) 99551-9042', initials: 'LM',
    talents: ['Teclado', 'Voz de apoio'], ministries: ['São José'], availability: { weekday: 'SUNDAY', startTime: '07:00', endTime: '12:00' }, status: 'ACTIVE', notes: '',
  },
  {
    id: 'mem-010', name: 'Marcos Vieira', email: 'marcos.vieira@exemplo.org', phone: '(85) 99333-2014', initials: 'MV',
    talents: ['Bateria'], ministries: [], availability: { weekday: 'SATURDAY', startTime: '17:00', endTime: '21:00' }, status: 'INACTIVE', notes: 'Afastamento temporário.',
  },
];

export const TALENT_OPTIONS = ['Voz principal', 'Voz de apoio', 'Violão', 'Guitarra', 'Teclado', 'Baixo', 'Bateria', 'Percussão', 'Técnica de som'] as const;
export const MINISTRY_OPTIONS = ['Magnificat', 'Adoremus', 'São José'] as const;
export const WEEKDAY_OPTIONS = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
] as const;

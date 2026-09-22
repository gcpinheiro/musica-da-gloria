import { Schedule } from '../models/schedule.model';

function isoDate(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

export const SCHEDULES_MOCK: readonly Schedule[] = [
  {
    id: 'occ-001', title: 'Santa Missa', date: isoDate(1), time: '18:30', location: 'Igreja Matriz', ministry: 'Magnificat',
    status: 'PUBLISHED', liturgicalTime: 'Tempo Comum', notes: 'Chegada para passagem de som às 17h45.',
    people: [
      { id: 'mem-001', name: 'Ana Clara Mendes', initials: 'AC', role: 'Voz principal', confirmation: 'CONFIRMED' },
      { id: 'mem-002', name: 'Rafael Lima', initials: 'RL', role: 'Violão', confirmation: 'CONFIRMED' },
      { id: 'mem-003', name: 'Bruno Melo', initials: 'BM', role: 'Teclado', confirmation: 'CONFIRMED' },
      { id: 'mem-008', name: 'Paulo Nunes', initials: 'PN', role: 'Baixo', confirmation: 'PENDING' },
    ],
    songs: ['Eis-me Aqui, Senhor', 'Kyrie Eleison', 'Glória a Deus nas Alturas', 'Aleluia', 'Pão da Vida', 'Maria de Nazaré'],
  },
  {
    id: 'occ-002', title: 'Adoração ao Santíssimo', date: isoDate(3), time: '19:30', location: 'Capela do Santíssimo', ministry: 'Adoremus',
    status: 'DRAFT', liturgicalTime: 'Adoração', notes: 'Repertório mais contemplativo.',
    people: [
      { id: 'mem-004', name: 'Camila Sousa', initials: 'CS', role: 'Voz principal', confirmation: 'CONFIRMED' },
      { id: 'mem-005', name: 'Daniel Rocha', initials: 'DR', role: 'Violão', confirmation: 'PENDING' },
    ],
    songs: ['Tão Sublime Sacramento', 'Diante do Rei', 'Eu Navegarei'],
  },
  {
    id: 'occ-003', title: 'Santa Missa Dominical', date: isoDate(6), time: '09:00', location: 'Igreja Matriz', ministry: 'São José',
    status: 'ATTENTION', liturgicalTime: '25º Domingo do Tempo Comum', notes: 'A função de bateria precisa de substituição.',
    people: [
      { id: 'mem-006', name: 'João Pedro Silva', initials: 'JP', role: 'Voz de apoio', confirmation: 'CONFIRMED' },
      { id: 'mem-007', name: 'Lia Martins', initials: 'LM', role: 'Teclado', confirmation: 'CONFIRMED' },
    ],
    songs: ['Reunidos Aqui', 'Senhor, que Viestes Salvar', 'A Vossa Palavra, Senhor', 'Tudo é do Pai'],
  },
  {
    id: 'occ-004', title: 'Santa Missa Dominical', date: isoDate(6), time: '19:00', location: 'Igreja Matriz', ministry: 'Magnificat',
    status: 'PUBLISHED', liturgicalTime: '25º Domingo do Tempo Comum', notes: 'Chegada às 18h para ensaio breve.',
    people: [
      { id: 'mem-001', name: 'Ana Clara Mendes', initials: 'AC', role: 'Voz principal', confirmation: 'CONFIRMED' },
      { id: 'mem-002', name: 'Rafael Lima', initials: 'RL', role: 'Violão', confirmation: 'CONFIRMED' },
      { id: 'mem-009', name: 'Sara Alves', initials: 'SA', role: 'Bateria', confirmation: 'CONFIRMED' },
    ],
    songs: ['O Senhor Necessitou de Mim', 'Glória a Deus', 'Aleluia, a Minha Alma Abrirei', 'Prova de Amor', 'Cordeiro de Deus', 'Te Amarei, Senhor'],
  },
];

import { Schedule, ScheduleMemberOption, ScheduleSongOption } from '../models/schedule.model';

function isoDate(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
}

export const SCHEDULE_MEMBER_OPTIONS: readonly ScheduleMemberOption[] = [
  { id: 'mem-001', name: 'Ana Clara Mendes', initials: 'AC', role: 'Voz principal', confirmation: 'PENDING', available: true },
  { id: 'mem-002', name: 'Rafael Lima', initials: 'RL', role: 'Violão', confirmation: 'PENDING', available: true },
  { id: 'mem-003', name: 'Bruno Melo', initials: 'BM', role: 'Teclado', confirmation: 'PENDING', available: true },
  { id: 'mem-004', name: 'Camila Sousa', initials: 'CS', role: 'Voz principal', confirmation: 'PENDING', available: true },
  { id: 'mem-005', name: 'Daniel Rocha', initials: 'DR', role: 'Violão', confirmation: 'PENDING', available: false },
  { id: 'mem-006', name: 'João Pedro Silva', initials: 'JP', role: 'Percussão', confirmation: 'PENDING', available: true },
];

export const SCHEDULE_SONG_OPTIONS: readonly ScheduleSongOption[] = [
  { songId: 'song-001', title: 'Eis-me Aqui, Senhor', key: 'G', liturgicalMoment: 'Entrada' },
  { songId: 'song-002', title: 'Kyrie Eleison', key: 'Em', liturgicalMoment: 'Ato penitencial' },
  { songId: 'song-003', title: 'Glória a Deus nas Alturas', key: 'D', liturgicalMoment: 'Glória' },
  { songId: 'song-004', title: 'Aleluia', key: 'A', liturgicalMoment: 'Aclamação' },
  { songId: 'song-005', title: 'Tão Sublime Sacramento', key: 'C', liturgicalMoment: 'Adoração' },
  { songId: 'song-006', title: 'Reunidos Aqui', key: 'D', liturgicalMoment: 'Entrada' },
  { songId: 'song-007', title: 'Terra Seca', key: 'G', liturgicalMoment: 'Adoração' },
  { songId: 'song-008', title: 'Caminho de Luz', key: 'G', liturgicalMoment: 'Entrada' },
];

const songs = (ids: readonly string[]) => SCHEDULE_SONG_OPTIONS.filter((song) => ids.includes(song.songId)).map((song, index) => ({ ...song, id: `item-${index}-${song.songId}` }));

function recurringSchedules(): Schedule[] {
  const schedules: Schedule[] = [];
  for (let offset = -370; offset <= 370; offset += 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    if (date.getDay() === 0) {
      schedules.push({ id: `occ-rec-${offset}-09`, title: 'Santa Missa Dominical', date: date.toISOString(), time: '09:00', location: 'Igreja Matriz', ministry: 'Nossa Senhora da Glória', status: 'PUBLISHED', liturgicalTime: 'Tempo Comum', notes: 'Chegada às 08h15 para passagem de som.', people: [SCHEDULE_MEMBER_OPTIONS[5], SCHEDULE_MEMBER_OPTIONS[2]], songs: songs(['song-001', 'song-003', 'song-008']) });
      schedules.push({ id: `occ-rec-${offset}-19`, title: 'Santa Missa Dominical', date: date.toISOString(), time: '19:00', location: 'Igreja Matriz', ministry: 'Santa Cecília', status: offset % 3 === 0 ? 'ATTENTION' : 'PUBLISHED', liturgicalTime: 'Tempo Comum', notes: offset % 3 === 0 ? 'Uma função da formação ainda precisa ser preenchida.' : 'Chegada às 18h15 para passagem de som.', people: [SCHEDULE_MEMBER_OPTIONS[0], SCHEDULE_MEMBER_OPTIONS[1]], songs: songs(['song-001', 'song-004', 'song-007']) });
    }
    if (date.getDay() === 4) {
      schedules.push({ id: `occ-rec-${offset}-adoracao`, title: 'Adoração ao Santíssimo', date: date.toISOString(), time: '19:30', location: 'Capela do Santíssimo', ministry: 'São Gregório Magno', status: 'DRAFT', liturgicalTime: 'Adoração', notes: 'Repertório contemplativo.', people: [SCHEDULE_MEMBER_OPTIONS[3], SCHEDULE_MEMBER_OPTIONS[4]], songs: songs(['song-005', 'song-007']) });
    }
  }
  return schedules;
}

export const SCHEDULES_MOCK: readonly Schedule[] = [
  ...recurringSchedules(),
  { id: 'occ-001', title: 'Santa Missa', date: isoDate(1), time: '18:30', location: 'Igreja Matriz', ministry: 'Santa Cecília', status: 'PUBLISHED', liturgicalTime: 'Tempo Comum', notes: 'Chegada para passagem de som às 17h45.', people: [{ ...SCHEDULE_MEMBER_OPTIONS[0], confirmation: 'CONFIRMED' }, { ...SCHEDULE_MEMBER_OPTIONS[1], confirmation: 'CONFIRMED' }, { ...SCHEDULE_MEMBER_OPTIONS[2], confirmation: 'CONFIRMED' }], songs: songs(['song-001', 'song-002', 'song-003', 'song-004']) },
  { id: 'occ-002', title: 'Adoração ao Santíssimo', date: isoDate(3), time: '19:30', location: 'Capela do Santíssimo', ministry: 'São Gregório Magno', status: 'DRAFT', liturgicalTime: 'Adoração', notes: 'Repertório mais contemplativo.', people: [{ ...SCHEDULE_MEMBER_OPTIONS[3], confirmation: 'CONFIRMED' }, SCHEDULE_MEMBER_OPTIONS[4]], songs: songs(['song-005']) },
  { id: 'occ-003', title: 'Santa Missa Dominical', date: isoDate(6), time: '09:00', location: 'Igreja Matriz', ministry: 'Nossa Senhora da Glória', status: 'ATTENTION', liturgicalTime: '25º Domingo do Tempo Comum', notes: 'A função de bateria precisa de substituição.', people: [SCHEDULE_MEMBER_OPTIONS[5]], songs: songs(['song-006']) },
  { id: 'occ-004', title: 'Santa Missa Dominical', date: isoDate(6), time: '19:00', location: 'Igreja Matriz', ministry: 'Santa Cecília', status: 'PUBLISHED', liturgicalTime: '25º Domingo do Tempo Comum', notes: 'Chegada às 18h para ensaio breve.', people: [SCHEDULE_MEMBER_OPTIONS[0], SCHEDULE_MEMBER_OPTIONS[1]], songs: songs(['song-001', 'song-003', 'song-004']) },
];

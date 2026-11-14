import { ScheduledSong } from '../models/schedule.model';
import { reorderScheduleSongs } from './reorder-schedule-songs';

describe('reorderScheduleSongs', () => {
  const songs: readonly ScheduledSong[] = [
    { id: 'item-1', songId: 'song-1', title: 'Entrada', key: 'G', liturgicalMoment: 'Entrada' },
    { id: 'item-2', songId: 'song-2', title: 'Ofertório', key: 'D', liturgicalMoment: 'Ofertório' },
    { id: 'item-3', songId: 'song-3', title: 'Final', key: 'A', liturgicalMoment: 'Final' },
  ];

  it('moves a song to the dropped position without mutating the source', () => {
    const result = reorderScheduleSongs(songs, 0, 2);

    expect(result.map((song) => song.id)).toEqual(['item-2', 'item-3', 'item-1']);
    expect(songs.map((song) => song.id)).toEqual(['item-1', 'item-2', 'item-3']);
  });

  it('keeps the same collection when the move is invalid or unnecessary', () => {
    expect(reorderScheduleSongs(songs, 1, 1)).toBe(songs);
    expect(reorderScheduleSongs(songs, -1, 1)).toBe(songs);
    expect(reorderScheduleSongs(songs, 0, songs.length)).toBe(songs);
  });
});

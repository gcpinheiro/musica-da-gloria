import { ScheduledSong } from '../models/schedule.model';

export function reorderScheduleSongs(
  songs: readonly ScheduledSong[],
  previousIndex: number,
  currentIndex: number,
): readonly ScheduledSong[] {
  if (
    previousIndex === currentIndex ||
    previousIndex < 0 ||
    currentIndex < 0 ||
    previousIndex >= songs.length ||
    currentIndex >= songs.length
  ) {
    return songs;
  }

  const reordered = [...songs];
  const [movedSong] = reordered.splice(previousIndex, 1);
  reordered.splice(currentIndex, 0, movedSong);
  return reordered;
}

import { isChordLine, isMusicalKey, keySemitoneOffset, transposeChordLine, transposeKey } from './song-transposition';

describe('song transposition', () => {
  it('transposes chord qualities and inverted bass notes', () => {
    expect(transposeChordLine('G  D/F#  Em7  C9', 2)).toBe('A  E/G#  F#m7  D9');
  });

  it('transposes downward and preserves the key quality', () => {
    expect(transposeKey('Em', -2)).toBe('Dm');
    expect(transposeChordLine('Bb  F/A', -2)).toBe('Ab  Eb/G');
  });

  it('distinguishes chord lines from lyrics', () => {
    expect(isChordLine('Am7  D  G/B')).toBeTrue();
    expect(isChordLine('Vem, Senhor, caminhar ao nosso lado')).toBeFalse();
  });

  it('calculates the persisted transposition between the library and schedule keys', () => {
    expect(keySemitoneOffset('C', 'D')).toBe(2);
    expect(keySemitoneOffset('F', 'Eb')).toBe(10);
    expect(keySemitoneOffset('Am', 'Bm')).toBe(2);
  });

  it('distinguishes musical keys from an uninformed key', () => {
    expect(isMusicalKey('D')).toBeTrue();
    expect(isMusicalKey('Bm')).toBeTrue();
    expect(isMusicalKey('N/I')).toBeFalse();
  });
});

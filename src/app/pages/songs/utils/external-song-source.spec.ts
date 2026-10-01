import { externalSongSource } from './external-song-source';

describe('externalSongSource', () => {
  it('accepts an HTTPS URL from an allowed source', () => {
    expect(externalSongSource('https://cifrascatolicas.com.br/artista/musica')?.name).toBe('Cifras Católicas');
  });

  it('rejects unknown hosts and non-HTTPS URLs', () => {
    expect(externalSongSource('https://example.com/song')).toBeNull();
    expect(externalSongSource('http://cifrascatolicas.com.br/song')).toBeNull();
  });

  it('does not accept a hostname that only ends like an allowed host', () => {
    expect(externalSongSource('https://cifrascatolicas.com.br.attacker.test/song')).toBeNull();
  });
});

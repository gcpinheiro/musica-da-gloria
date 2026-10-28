import { youtubeVideoSource } from './youtube-video-source';

describe('youtubeVideoSource', () => {
  it('normalizes YouTube watch and short URLs to a privacy-enhanced embed', () => {
    expect(youtubeVideoSource('https://youtu.be/Qc-nle3oT9o?si=abc')).toEqual({
      videoId: 'Qc-nle3oT9o',
      watchUrl: 'https://www.youtube.com/watch?v=Qc-nle3oT9o',
      embedUrl: 'https://www.youtube-nocookie.com/embed/Qc-nle3oT9o?rel=0',
    });
    expect(youtubeVideoSource('https://www.youtube.com/watch?v=Qc-nle3oT9o')?.videoId).toBe('Qc-nle3oT9o');
  });

  it('rejects invalid IDs, non-HTTPS URLs and deceptive hosts', () => {
    expect(youtubeVideoSource('https://youtube.com/watch?v=short')).toBeNull();
    expect(youtubeVideoSource('http://youtu.be/Qc-nle3oT9o')).toBeNull();
    expect(youtubeVideoSource('https://youtube.com.attacker.test/watch?v=Qc-nle3oT9o')).toBeNull();
  });
});

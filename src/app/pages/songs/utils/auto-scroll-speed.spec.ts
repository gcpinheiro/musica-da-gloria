import { autoScrollPixelsPerSecond } from './auto-scroll-speed';

describe('autoScrollPixelsPerSecond', () => {
  it('starts scrolling at the minimum control value', () => {
    expect(autoScrollPixelsPerSecond(1)).toBe(3);
  });

  it('keeps the first half of the control gradual', () => {
    expect(autoScrollPixelsPerSecond(25)).toBeLessThan(15);
    expect(autoScrollPixelsPerSecond(50)).toBeLessThan(35);
  });

  it('caps values outside the supported range', () => {
    expect(autoScrollPixelsPerSecond(-10)).toBe(3);
    expect(autoScrollPixelsPerSecond(200)).toBe(90);
  });
});

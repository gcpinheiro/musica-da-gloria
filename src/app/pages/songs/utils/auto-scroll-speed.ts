const MIN_CONTROL_VALUE = 1;
const MAX_CONTROL_VALUE = 100;
const MIN_PIXELS_PER_SECOND = 3;
const MAX_PIXELS_PER_SECOND = 90;

export function autoScrollPixelsPerSecond(value: number): number {
  const normalized = Math.min(
    1,
    Math.max(0, (value - MIN_CONTROL_VALUE) / (MAX_CONTROL_VALUE - MIN_CONTROL_VALUE)),
  );
  return MIN_PIXELS_PER_SECOND
    + (MAX_PIXELS_PER_SECOND - MIN_PIXELS_PER_SECOND) * normalized ** 1.7;
}

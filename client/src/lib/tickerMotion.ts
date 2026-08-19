export function nextTickerOffset(previousOffset: number, elapsedMs: number, halfTrackWidth: number, pixelsPerSecond = 52) {
  if (!Number.isFinite(halfTrackWidth) || halfTrackWidth <= 0 || !Number.isFinite(elapsedMs) || elapsedMs <= 0) return 0;
  return (previousOffset + (elapsedMs / 1000) * pixelsPerSecond) % halfTrackWidth;
}

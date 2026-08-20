export function shouldBeginAtlasPan(deltaX: number, deltaY: number) {
  return Math.abs(deltaX) + Math.abs(deltaY) > 4;
}

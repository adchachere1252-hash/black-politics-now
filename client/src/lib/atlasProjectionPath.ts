function isLargeProjectionClipRectangle(subPath: string) {
  const values = (subPath.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const lineCount = (subPath.match(/L/g) ?? []).length;
  if (lineCount !== 3 || !subPath.endsWith("Z") || values.length < 8) return false;
  const [x1, y1, x2, y2, x3, y3, x4, y4] = values;
  const epsilon = 0.1;
  const isRectangle = Math.abs(x1 - x4) < epsilon && Math.abs(y1 - y2) < epsilon && Math.abs(x2 - x3) < epsilon && Math.abs(y3 - y4) < epsilon;
  const area = Math.abs(x2 - x1) * Math.abs(y3 - y2);
  return isRectangle && area >= 1000;
}

/**
 * D3's composite Albers projection can emit large clip surfaces alongside the
 * actual district path. Remove only those full-map/inset rectangles, never a
 * normal district ring (including a legitimate rectangular district).
 */
export function renderAtlasDistrictPath(draw: (feature: unknown) => string | null, feature: unknown) {
  const path = draw(feature) || "";
  return (path.match(/M[^M]*/g) ?? []).filter((subPath) => !isLargeProjectionClipRectangle(subPath)).join("");
}

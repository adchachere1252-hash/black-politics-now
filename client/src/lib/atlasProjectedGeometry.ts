type Coordinate = [number, number];
type Project = (coordinate: Coordinate) => [number, number] | null;

type PolygonGeometry = { type: "Polygon"; coordinates: Coordinate[][] };
type MultiPolygonGeometry = { type: "MultiPolygon"; coordinates: Coordinate[][][] };
type DistrictGeometry = PolygonGeometry | MultiPolygonGeometry;

function signedArea(points: Array<[number, number]>) {
  return points.reduce((area, point, index) => {
    const next = points[(index + 1) % points.length];
    return area + point[0] * next[1] - next[0] * point[1];
  }, 0);
}

function ringPath(project: Project, ring: Coordinate[]) {
  const points = ring
    .map((coordinate) => project(coordinate))
    .filter((point): point is [number, number] => Boolean(point));
  if (points.length < 3) return "";
  const withoutDuplicateClose = points.length > 3 && points[0][0] === points.at(-1)![0] && points[0][1] === points.at(-1)![1]
    ? points.slice(0, -1)
    : points;
  if (withoutDuplicateClose.length < 3) return "";
  // Historical source rings are not consistently wound. Every congressional
  // district ring is drawn as an exterior surface here, so a reversed source
  // ring cannot become a false interior cutout in the public SVG.
  const ordered = signedArea(withoutDuplicateClose) > 0 ? [...withoutDuplicateClose].reverse() : withoutDuplicateClose;
  return `M${ordered.map(([x, y]) => `${Number(x.toFixed(3))},${Number(y.toFixed(3))}`).join("L")}Z`;
}

export function renderProjectedDistrictGeometry(project: Project, geometry: unknown) {
  if (!geometry || typeof geometry !== "object") return "";
  const districtGeometry = geometry as DistrictGeometry;
  if (districtGeometry.type === "Polygon" && Array.isArray(districtGeometry.coordinates)) return districtGeometry.coordinates.map((ring) => ringPath(project, ring)).join("");
  if (districtGeometry.type === "MultiPolygon" && Array.isArray(districtGeometry.coordinates)) return districtGeometry.coordinates.flatMap((polygon) => polygon.map((ring) => ringPath(project, ring))).join("");
  return "";
}

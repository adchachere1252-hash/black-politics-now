import { geoAlbersUsa } from "d3-geo";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

const ORIGIN = process.env.ATLAS_ORIGIN ?? "http://127.0.0.1:3000";
const CONGRESS = Number(process.env.ATLAS_CONGRESS ?? 119);
const STEP = Number(process.env.ATLAS_SAMPLE_STEP ?? 5);
type Coordinate = [number, number];

function pointInRing(point: Coordinate, ring: Coordinate[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
    const intersects = yi > point[1] !== yj > point[1] && point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonCovers(point: Coordinate, polygon: Coordinate[][]) {
  return pointInRing(point, polygon[0]) && !polygon.slice(1).some((ring) => pointInRing(point, ring));
}

function featureCovers(point: Coordinate, geometry: any) {
  if (geometry?.type === "Polygon") return polygonCovers(point, geometry.coordinates);
  if (geometry?.type === "MultiPolygon") return geometry.coordinates.some((polygon: Coordinate[][]) => polygonCovers(point, polygon));
  return false;
}

function components(empty: Uint8Array, width: number, height: number) {
  const visited = new Uint8Array(width * height);
  const results: Array<{ cells: number; bounds: { x: number; y: number; width: number; height: number } }> = [];
  for (let start = 0; start < empty.length; start += 1) {
    if (!empty[start] || visited[start]) continue;
    const queue = [start]; visited[start] = 1;
    let count = 0, minX = width, minY = height, maxX = 0, maxY = 0, boundary = false;
    for (let index = 0; index < queue.length; index += 1) {
      const cell = queue[index], x = cell % width, y = Math.floor(cell / width);
      count += 1; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) boundary = true;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy, neighbor = ny * width + nx;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height && empty[neighbor] && !visited[neighbor]) { visited[neighbor] = 1; queue.push(neighbor); }
      }
    }
    if (!boundary && count >= 3) results.push({ cells: count, bounds: { x: minX * STEP, y: minY * STEP, width: (maxX - minX + 1) * STEP, height: (maxY - minY + 1) * STEP } });
  }
  return results.sort((a, b) => b.cells - a.cells);
}

async function main() {
  const response = await fetch(`${ORIGIN}${UCLA_TRUE_DISTRICT_ASSETS[CONGRESS]}`);
  if (!response.ok) throw new Error(`${response.status}`);
  const frame = await response.json();
  const projection = geoAlbersUsa().fitSize([1000, 620], frame as any);
  const width = Math.ceil(1000 / STEP), height = Math.ceil(620 / STEP), uncovered = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const coordinate = projection.invert([x * STEP + STEP / 2, y * STEP + STEP / 2]);
    if (!coordinate || !frame.features.some((feature: any) => featureCovers(coordinate as Coordinate, feature.geometry))) uncovered[y * width + x] = 1;
  }
  console.log(JSON.stringify({ congress: CONGRESS, sampleStep: STEP, enclosedRawSourceGaps: components(uncovered, width, height).slice(0, 30) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

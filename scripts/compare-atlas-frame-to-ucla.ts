import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ORIGIN = process.env.ATLAS_ORIGIN ?? "http://127.0.0.1:3000";
const CONGRESS = Number(process.env.ATLAS_CONGRESS ?? 119);
const UCLA_SOURCE_DIRECTORY = process.env.UCLA_SOURCE_DIRECTORY ?? "/home/ubuntu/ucla-boundary-source/GeoJson";

function rawRingCount(geometry: any) {
  if (geometry?.type === "Polygon") return geometry.coordinates.length;
  if (geometry?.type === "MultiPolygon") return geometry.coordinates.reduce((sum: number, polygon: unknown[]) => sum + polygon.length, 0);
  return 0;
}

function coordinateCount(geometry: any): number {
  if (geometry?.type === "Polygon") return geometry.coordinates.flat(2).length / 2;
  if (geometry?.type === "MultiPolygon") return geometry.coordinates.flat(3).length / 2;
  return 0;
}

async function main() {
  const canonicalFiles = (await readdir(UCLA_SOURCE_DIRECTORY)).filter((file) => {
    const match = file.match(/_(\d+)_to_(\d+)\.geojson$/);
    return match && Number(match[1]) <= CONGRESS && Number(match[2]) >= CONGRESS;
  });
  const localResponse = await fetch(`${ORIGIN}${UCLA_TRUE_DISTRICT_ASSETS[CONGRESS]}`);
  if (!localResponse.ok) throw new Error(`Local frame: ${localResponse.status}`);
  const local = await localResponse.json();
  const canonicalFeatures = (await Promise.all(canonicalFiles.map(async (file) => {
    const frame = JSON.parse(await readFile(join(UCLA_SOURCE_DIRECTORY, file), "utf8"));
    return frame.features.filter((feature: any) => Number(feature.properties.startcong) <= CONGRESS && Number(feature.properties.endcong) >= CONGRESS);
  }))).flat();
  const localById = new Map(local.features.map((feature: any) => [String(feature.properties.id), feature]));
  const canonicalById = new Map(canonicalFeatures.map((feature: any) => [String(feature.properties.id), feature]));
  const onlyLocal = [...localById.keys()].filter((id) => !canonicalById.has(id));
  const onlyCanonical = [...canonicalById.keys()].filter((id) => !localById.has(id));
  const geometryDifferences = [...canonicalById.entries()].flatMap(([id, feature]) => {
    const localFeature = localById.get(id);
    if (!localFeature) return [];
    const canonicalRings = rawRingCount(feature.geometry);
    const localRings = rawRingCount(localFeature.geometry);
    const canonicalCoordinates = coordinateCount(feature.geometry);
    const localCoordinates = coordinateCount(localFeature.geometry);
    const coordinatesMatch = JSON.stringify(feature.geometry) === JSON.stringify(localFeature.geometry);
    return canonicalRings !== localRings || feature.geometry?.type !== localFeature.geometry?.type || canonicalCoordinates !== localCoordinates || !coordinatesMatch
      ? [{ id, state: feature.properties.statename, district: feature.properties.district, canonicalType: feature.geometry?.type, localType: localFeature.geometry?.type, canonicalRings, localRings, canonicalCoordinates, localCoordinates, coordinatesMatch }]
      : [];
  });
  console.log(JSON.stringify({ congress: CONGRESS, localFeatures: local.features.length, canonicalFiles: canonicalFiles.length, canonicalFeatures: canonicalFeatures.length, onlyLocal, onlyCanonical, geometryDifferences }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

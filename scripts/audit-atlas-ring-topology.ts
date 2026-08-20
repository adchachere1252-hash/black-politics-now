import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

const ORIGIN = process.env.ATLAS_ORIGIN ?? "http://127.0.0.1:3000";
type Coordinate = [number, number];

function signedArea(ring: Coordinate[]) {
  return ring.reduce((area, point, index) => {
    const next = ring[(index + 1) % ring.length];
    return area + point[0] * next[1] - next[0] * point[1];
  }, 0);
}

function rings(geometry: any): Coordinate[][] {
  if (geometry?.type === "Polygon") return geometry.coordinates;
  if (geometry?.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

async function main() {
  const rows: any[] = [];
  for (const [congressKey, asset] of Object.entries(UCLA_TRUE_DISTRICT_ASSETS)) {
    const response = await fetch(`${ORIGIN}${asset}`);
    if (!response.ok) throw new Error(`${congressKey}: ${response.status}`);
    const frame = await response.json();
    const unusual = frame.features.flatMap((feature: any) => {
      const featureRings = rings(feature.geometry);
      const areas = featureRings.map(signedArea);
      const signChanges = new Set(areas.filter(Boolean).map((area) => Math.sign(area))).size;
      const largeInteriorLikeRings = areas.slice(1).filter((area) => Math.abs(area) > 0.01).length;
      return signChanges > 1 || largeInteriorLikeRings > 0
        ? [{ state: feature.properties.state, district: feature.properties.district, id: feature.properties.id, geometryType: feature.geometry.type, ringCount: featureRings.length, signs: areas.map((area) => Math.sign(area)), absAreas: areas.map((area) => Number(Math.abs(area).toFixed(6))) }]
        : [];
    });
    rows.push({ congress: Number(congressKey), unusualFeatureCount: unusual.length, unusual });
  }
  console.log(JSON.stringify({ origin: ORIGIN, rows }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

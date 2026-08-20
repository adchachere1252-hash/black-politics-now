import { geoAlbersUsa, geoPath } from "d3-geo";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

const ORIGIN = process.env.ATLAS_ORIGIN ?? "http://127.0.0.1:3000";

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

async function main() {
  const results: Array<{ congress: number; removedRings: number; affectedFeatures: Array<{ state: string; district: number; id: string; removed: string[] }> }> = [];
  for (const [congressKey, asset] of Object.entries(UCLA_TRUE_DISTRICT_ASSETS)) {
    const congress = Number(congressKey);
    const response = await fetch(`${ORIGIN}${asset}`);
    if (!response.ok) throw new Error(`${congress}: ${response.status}`);
    const frame = await response.json() as { features: Array<{ properties: { state: string; district: number; id: string } }> };
    const projection = geoAlbersUsa().fitSize([1000, 620], { type: "FeatureCollection", features: frame.features } as any);
    const draw = geoPath(projection);
    const affectedFeatures = frame.features.flatMap((feature: any) => {
      const raw = draw(feature) ?? "";
      const removed = (raw.match(/M[^M]*/g) ?? []).filter(isLargeProjectionClipRectangle);
      return removed.length ? [{ state: feature.properties.state, district: Number(feature.properties.district), id: String(feature.properties.id), removed }] : [];
    });
    results.push({ congress, removedRings: affectedFeatures.reduce((sum, item) => sum + item.removed.length, 0), affectedFeatures });
  }
  console.log(JSON.stringify({ origin: ORIGIN, results, totalRemovedRings: results.reduce((sum, item) => sum + item.removedRings, 0) }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

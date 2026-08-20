import { geoAlbersUsa, geoPath } from "d3-geo";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

function removeProjectionClipRects(path: string) {
  const subPaths = path.match(/M[^M]*/g) ?? [];
  return subPaths.filter((subPath) => {
    const lineCount = (subPath.match(/L/g) ?? []).length;
    if (lineCount !== 3 || !subPath.endsWith("Z")) return true;
    const values = (subPath.match(/-?\d+\.?\d*/g) ?? []).map(Number);
    if (values.length < 8) return true;
    const [x1, y1, x2, y2, x3, y3, x4, y4] = values;
    const epsilon = 0.1;
    const isRectangle = Math.abs(x1 - x4) < epsilon && Math.abs(y1 - y2) < epsilon && Math.abs(x2 - x3) < epsilon && Math.abs(y3 - y4) < epsilon;
    return !isRectangle || Math.abs(x2 - x1) * Math.abs(y3 - y2) < 1000;
  }).join("");
}

async function main() {
  const findings: Array<{ congress: number; sourceFeatures: number; fullyRemoved: number; shortened: number; samples: string[] }> = [];
  for (const [congressText, asset] of Object.entries(UCLA_TRUE_DISTRICT_ASSETS)) {
    const congress = Number(congressText);
    const response = await fetch(`http://127.0.0.1:3000${asset}`);
    if (!response.ok) throw new Error(`Unable to load ${congress}: ${response.status}`);
    const frame = await response.json();
    const projection = geoAlbersUsa().fitSize([1000, 620], frame);
    const draw = geoPath(projection);
    let fullyRemoved = 0;
    let shortened = 0;
    const samples: string[] = [];
    for (const feature of frame.features) {
      const original = draw(feature) || "";
      const cleaned = removeProjectionClipRects(original);
      if (original && !cleaned) {
        fullyRemoved += 1;
        if (samples.length < 8) samples.push(`${feature.properties.state}-${feature.properties.district}`);
      } else if (original.length !== cleaned.length) {
        shortened += 1;
        if (samples.length < 8) samples.push(`${feature.properties.state}-${feature.properties.district}`);
      }
    }
    findings.push({ congress, sourceFeatures: frame.features.length, fullyRemoved, shortened, samples });
  }
  const totals = findings.reduce((total, frame) => ({ fullyRemoved: total.fullyRemoved + frame.fullyRemoved, shortened: total.shortened + frame.shortened }), { fullyRemoved: 0, shortened: 0 });
  console.log(JSON.stringify({ totals, affectedFrames: findings.filter((frame) => frame.fullyRemoved || frame.shortened), findings }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

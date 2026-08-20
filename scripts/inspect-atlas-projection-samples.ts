import { geoAlbersUsa, geoPath } from "d3-geo";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

function describeSubPath(subPath: string) {
  const values = (subPath.match(/-?\d+\.?\d*/g) ?? []).map(Number);
  const lineCount = (subPath.match(/L/g) ?? []).length;
  const rectangle = lineCount === 3 && subPath.endsWith("Z") && values.length >= 8
    ? (() => {
      const [x1, y1, x2, y2, x3, y3, x4, y4] = values;
      const epsilon = 0.1;
      return Math.abs(x1 - x4) < epsilon && Math.abs(y1 - y2) < epsilon && Math.abs(x2 - x3) < epsilon && Math.abs(y3 - y4) < epsilon;
    })()
    : false;
  const area = rectangle ? Math.abs(values[2] - values[0]) * Math.abs(values[5] - values[1]) : null;
  return { lineCount, rectangle, area, length: subPath.length, preview: subPath.slice(0, 90) };
}

async function main() {
  const response = await fetch(`http://127.0.0.1:3000${UCLA_TRUE_DISTRICT_ASSETS[110]}`);
  const frame = await response.json();
  const projection = geoAlbersUsa().fitSize([1000, 620], frame);
  const draw = geoPath(projection);
  const targets = frame.features.filter((feature: any) => ["New York-1", "New York-15", "Texas-27", "Texas-28"].includes(`${feature.properties.state}-${feature.properties.district}`));
  const report = targets.map((feature: any) => {
    const path = draw(feature) || "";
    const subPaths = path.match(/M[^M]*/g) ?? [];
    return { id: `${feature.properties.state}-${feature.properties.district}`, subPathCount: subPaths.length, subPaths: subPaths.map(describeSubPath) };
  });
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

import { gunzipSync } from "node:zlib";
import { geoAlbersUsa } from "d3-geo";
import { feature } from "topojson-client";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

const ORIGIN = process.env.ATLAS_ORIGIN ?? "https://blkpolnow-nztxnshf.manus.space";
const CONGRESS = Number(process.env.ATLAS_CONGRESS ?? 119);
const point: [number, number] = [638, 204];

async function main() {
  const response = await fetch(`${ORIGIN}${UCLA_TRUE_DISTRICT_ASSETS[CONGRESS]}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const topology = JSON.parse(gunzipSync(new Uint8Array(await response.arrayBuffer())).toString("utf8"));
  const collection = feature(topology, topology.objects.districts) as any;
  const projection = geoAlbersUsa().fitSize([1000, 620], collection);
  console.log(JSON.stringify({ congress: CONGRESS, svgPoint: point, geographicCoordinate: projection.invert(point), source: topology.metadata?.source, sourceUrl: topology.metadata?.sourceUrl }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

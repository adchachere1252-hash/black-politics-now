import { gunzipSync } from "node:zlib";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

const ORIGIN = process.env.ATLAS_ORIGIN ?? "http://127.0.0.1:3000";

async function main() {
  const frames: Array<{ congress: number; states: number; districts: number; arcs: number; bytes: number }> = [];
  for (const congress of Object.keys(UCLA_TRUE_DISTRICT_ASSETS).map(Number).sort((a, b) => a - b)) {
    const response = await fetch(`${ORIGIN}${UCLA_TRUE_DISTRICT_ASSETS[congress]}`);
    if (!response.ok) throw new Error(`${congress}: HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const topology = JSON.parse(gunzipSync(bytes).toString("utf8"));
    const geometries = topology.objects?.districts?.geometries ?? [];
    const states = new Set(geometries.map((geometry: any) => geometry.properties?.state));
    const ids = geometries.map((geometry: any) => geometry.properties?.id);
    if (topology.type !== "Topology" || topology.metadata?.congress !== congress || topology.metadata?.topologyPreservesSharedBoundaries !== true || topology.metadata?.simplifiedForWeb !== false || states.size !== 50 || new Set(ids).size !== ids.length || !topology.arcs?.length) throw new Error(`${congress}: invalid canonical topology contract`);
    frames.push({ congress, states: states.size, districts: geometries.length, arcs: topology.arcs.length, bytes: bytes.byteLength });
  }
  console.log(JSON.stringify({ origin: ORIGIN, frameCount: frames.length, frames }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

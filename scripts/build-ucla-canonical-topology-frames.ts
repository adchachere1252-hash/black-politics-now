import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { topology } from "topojson-server";
import { planarTriangleArea, presimplify, simplify } from "topojson-simplify";

const SOURCE_DIRECTORY = process.env.UCLA_SOURCE_DIRECTORY ?? "/home/ubuntu/ucla-boundary-source/GeoJson";
const OUTPUT_DIRECTORY = process.env.ATLAS_OUTPUT_DIRECTORY ?? "/home/ubuntu/webdev-static-assets/atlas-ucla-canonical";
const requestedCongress = process.env.ATLAS_CONGRESS ? Number(process.env.ATLAS_CONGRESS) : null;
const simplificationTolerance = Number(process.env.ATLAS_TOPOLOGY_TOLERANCE ?? "0");
const congresses = requestedCongress ? [requestedCongress] : Array.from({ length: 31 }, (_, index) => 89 + index);
const STATE_CODES: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

async function readCongressFeatures(congress: number) {
  const files = (await readdir(SOURCE_DIRECTORY)).filter((file) => {
    const match = file.match(/_(\d+)_to_(\d+)\.geojson$/);
    return match && Number(match[1]) <= congress && Number(match[2]) >= congress;
  });
  const features = (await Promise.all(files.map(async (file) => {
    const collection = JSON.parse(await readFile(join(SOURCE_DIRECTORY, file), "utf8"));
    return collection.features
      .filter((feature: any) => Number(feature.properties.startcong) <= congress && Number(feature.properties.endcong) >= congress && STATE_CODES[feature.properties.statename])
      .map((feature: any) => ({
        type: "Feature",
        properties: {
          id: String(feature.properties.id),
          state: feature.properties.statename,
          stateCode: STATE_CODES[feature.properties.statename],
          district: Number(feature.properties.district),
          sourceFile: file,
          startCongress: Number(feature.properties.startcong),
          endCongress: Number(feature.properties.endcong),
          sourceMethod: feature.properties.note || null,
        },
        geometry: feature.geometry,
      }));
  }))).flat();
  const unique = new Map<string, any>();
  for (const feature of features) unique.set(feature.properties.id, feature);
  return [...unique.values()];
}

async function main() {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const manifest: Record<number, { filename: string; features: number; states: number; bytes: number }> = {};
  for (const congress of congresses) {
    const features = await readCongressFeatures(congress);
    const states = new Set(features.map((feature) => feature.properties.state));
    if (states.size !== 50) throw new Error(`${congress}: expected 50 states, found ${states.size}`);
    const collection = { type: "FeatureCollection" as const, features };
    const rawTopology = topology({ districts: collection as any }, 1e7) as any;
    const frame = simplificationTolerance > 0 ? simplify(presimplify(rawTopology, planarTriangleArea), simplificationTolerance) as any : rawTopology;
    frame.metadata = {
      source: "UCLA Congressional District Maps canonical GeoJSON (shared-arc topology)",
      sourceUrl: "https://github.com/JeffreyBLewis/congressional-district-boundaries",
      congress,
      states: states.size,
      districtFeatures: features.length,
      simplifiedForWeb: simplificationTolerance > 0,
      topologyPreservesSharedBoundaries: true,
      canonicalRevision: "bf68a9b",
      topologySimplificationTolerance: simplificationTolerance || null,
    };
    const serialized = JSON.stringify(frame);
    const filename = `ucla-canonical-c${congress}.topo.json`;
    await writeFile(join(OUTPUT_DIRECTORY, filename), serialized);
    manifest[congress] = { filename, features: features.length, states: states.size, bytes: Buffer.byteLength(serialized) };
    console.log(`${congress}: ${features.length} districts, ${(Buffer.byteLength(serialized) / 1024 / 1024).toFixed(2)} MB`);
  }
  await writeFile(join(OUTPUT_DIRECTORY, "manifest.json"), JSON.stringify(manifest, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

import { UCLA_TRUE_DISTRICT_ASSETS } from "@/data/atlasTrueDistrictAssets";
import { feature as topologyFeature, merge as topologyMerge } from "topojson-client";

export type TrueDistrictFeature = {
  type: "Feature";
  properties: { state: string; district: number; id: string };
  geometry: unknown;
};

export type TrueDistrictFrame = {
  type: "FeatureCollection";
  metadata: { source: string; sourceUrl: string; congress: number; states: number; districtFeatures: number; overlapArtifactsRemoved?: number; simplifiedForWeb: boolean; topologyPreservesSharedBoundaries?: boolean; canonicalRevision?: string };
  features: TrueDistrictFeature[];
  stateBoundaries?: Array<{ state: string; geometry: unknown }>;
};

type AtlasTopologyFrame = {
  type: "Topology";
  objects: { districts: { type?: string; geometries?: Array<{ properties?: { state?: string } }> } };
  metadata: TrueDistrictFrame["metadata"];
};

const frameCache = new Map<number, TrueDistrictFrame>();
const MAX_CACHED_FRAMES = 3;

function cacheFrame(congress: number, frame: TrueDistrictFrame) {
  if (frameCache.has(congress)) frameCache.delete(congress);
  frameCache.set(congress, frame);
  if (frameCache.size > MAX_CACHED_FRAMES) frameCache.delete(frameCache.keys().next().value as number);
}

export async function loadTrueDistrictFrame(congress: number, request: typeof fetch = fetch) {
  const cached = frameCache.get(congress);
  if (cached) return cached;
  const url = UCLA_TRUE_DISTRICT_ASSETS[congress];
  if (!url) throw new Error(`No validated UCLA district frame exists for Congress ${congress}`);
  const response = await request(url);
  if (!response.ok) throw new Error(`Validated district frame unavailable for Congress ${congress}`);
  if (!response.body || typeof DecompressionStream === "undefined") throw new Error("This browser cannot decode the Atlas source-topology frame");
  const text = await new Response(response.body.pipeThrough(new DecompressionStream("gzip"))).text();
  const topology = JSON.parse(text) as AtlasTopologyFrame;
  if (topology.metadata?.simplifiedForWeb || topology.metadata?.topologyPreservesSharedBoundaries !== true) {
    throw new Error(`Atlas frame ${congress} does not use the required canonical shared-boundary geometry`);
  }
  const resolved = topologyFeature(topology as any, topology.objects?.districts as any) as unknown as { type: "FeatureCollection"; features: TrueDistrictFeature[] };
  const rawGeometries = topology.objects?.districts?.geometries ?? [];
  const statesInTopology = Array.from(new Set(rawGeometries.map((geometry) => geometry.properties?.state).filter((state): state is string => Boolean(state))));
  const stateBoundaries = statesInTopology.map((state) => ({
    state,
    geometry: topologyMerge(topology as any, rawGeometries.filter((geometry) => geometry.properties?.state === state) as any),
  }));
  const frame: TrueDistrictFrame = { type: "FeatureCollection", metadata: topology.metadata, features: resolved.features, stateBoundaries };
  const states = new Set(frame.features?.map((feature) => feature.properties?.state).filter(Boolean));
  if (frame.type !== "FeatureCollection" || frame.metadata?.congress !== congress || states.size !== 50 || stateBoundaries.length !== 50 || !frame.features?.length) {
    throw new Error(`Validated district frame failed integrity checks for Congress ${congress}`);
  }
  cacheFrame(congress, frame);
  return frame;
}

/** Warm the next frame without changing the visible map or surfacing a preload failure. */
export function preloadTrueDistrictFrame(congress: number) {
  if (congress < 89 || congress > 119 || frameCache.has(congress)) return;
  void loadTrueDistrictFrame(congress).catch(() => undefined);
}

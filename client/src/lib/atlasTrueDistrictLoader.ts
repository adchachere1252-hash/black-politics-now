import { UCLA_TRUE_DISTRICT_ASSETS } from "@/data/atlasTrueDistrictAssets";

export type TrueDistrictFeature = {
  type: "Feature";
  properties: { state: string; district: number; id: string };
  geometry: unknown;
};

export type TrueDistrictFrame = {
  type: "FeatureCollection";
  metadata: { source: string; sourceUrl: string; congress: number; states: number; districtFeatures: number; overlapArtifactsRemoved?: number; simplifiedForWeb: boolean };
  features: TrueDistrictFeature[];
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
  const frame = await response.json() as TrueDistrictFrame;
  const states = new Set(frame.features?.map((feature) => feature.properties?.state).filter(Boolean));
  if (frame.type !== "FeatureCollection" || frame.metadata?.congress !== congress || states.size !== 50 || !frame.features?.length) {
    throw new Error(`Validated district frame failed integrity checks for Congress ${congress}`);
  }
  cacheFrame(congress, frame);
  return frame;
}

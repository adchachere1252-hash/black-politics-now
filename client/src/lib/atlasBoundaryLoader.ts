import { atlasManifestCoverage } from "@/lib/atlasPlayback";

type BoundaryResponse = { ok: boolean; json: () => Promise<unknown>; text: () => Promise<string> };
type BoundaryRequest = (input: string, init?: RequestInit) => Promise<BoundaryResponse>;

export type AtlasBoundaryLoad = { bundle: Record<string, string>; source: "chunked-bundle" | "state-fallback" };
type ProgressListener = (bundle: Record<string, string>, loadedStateFiles: number, expectedStateFiles: number) => void;

const frameCache = new Map<number, Record<string, string>>();
const MAX_CACHED_FRAMES = 4;

function cacheFrame(congress: number, bundle: Record<string, string>) {
  if (frameCache.has(congress)) frameCache.delete(congress);
  frameCache.set(congress, bundle);
  if (frameCache.size > MAX_CACHED_FRAMES) frameCache.delete(frameCache.keys().next().value as number);
}

async function loadFilesWithConcurrency(filenames: string[], request: BoundaryRequest, onProgress?: ProgressListener, concurrency = 6) {
  const entries: Array<[string, string]> = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, filenames.length) }, async () => {
    while (index < filenames.length) {
      const filename = filenames[index++];
      const response = await request(`/api/atlas/boundary/${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error(`Boundary source unavailable for ${filename}`);
      entries.push([filename, await response.text()]);
      onProgress?.(Object.fromEntries(entries), entries.length, filenames.length);
    }
  });
  await Promise.all(workers);
  return Object.fromEntries(entries);
}

/**
 * Load compact chunks first and surface each completed chunk immediately. This
 * avoids an oversized national response and lets the map become useful while
 * the remaining repository-backed geometry is still arriving.
 */
export async function loadNationalAtlasBoundaryBundle(congress: number, request: BoundaryRequest = fetch, onProgress?: ProgressListener) : Promise<AtlasBoundaryLoad> {
  const coverage = atlasManifestCoverage(congress);
  const cached = frameCache.get(congress);
  if (cached) {
    onProgress?.(cached, coverage.stateCount, coverage.stateCount);
    return { bundle: cached, source: "chunked-bundle" };
  }

  try {
    const chunkCount = Math.ceil(coverage.boundaryFiles.length / 10);
    const bundle: Record<string, string> = {};
    await Promise.all(Array.from({ length: chunkCount }, async (_, chunk) => {
      const response = await request(`/api/atlas/bundle/${congress}?chunk=${chunk}&atlas_bundle_revision=2`);
      if (!response.ok) throw new Error("Historical boundary chunk unavailable");
      const payload = await response.json() as Record<string, string>;
      Object.assign(bundle, payload);
      onProgress?.({ ...bundle }, Object.keys(bundle).length, coverage.stateCount);
    }));
    if (Object.keys(bundle).length === coverage.stateCount) {
      cacheFrame(congress, bundle);
      return { bundle, source: "chunked-bundle" };
    }
  } catch { /* fall through to individual repository state files */ }

  const bundle = await loadFilesWithConcurrency(coverage.boundaryFiles, request, onProgress);
  if (Object.keys(bundle).length !== coverage.stateCount) throw new Error("Historical national boundary frame is incomplete");
  cacheFrame(congress, bundle);
  return { bundle, source: "state-fallback" };
}

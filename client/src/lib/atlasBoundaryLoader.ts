import { atlasManifestCoverage } from "@/lib/atlasPlayback";

type BoundaryResponse = { ok: boolean; json: () => Promise<unknown>; text: () => Promise<string> };
type BoundaryRequest = (input: string, init?: RequestInit) => Promise<BoundaryResponse>;

export type AtlasBoundaryLoad = { bundle: Record<string, string>; source: "bundle" | "chunked-bundle" | "state-fallback" };

async function loadFilesWithConcurrency(filenames: string[], request: BoundaryRequest, concurrency = 6) {
  const entries: Array<[string, string]> = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, filenames.length) }, async () => {
    while (index < filenames.length) {
      const filename = filenames[index++];
      const response = await request(`/api/atlas/boundary/${encodeURIComponent(filename)}`);
      if (!response.ok) throw new Error(`Boundary source unavailable for ${filename}`);
      entries.push([filename, await response.text()]);
    }
  });
  await Promise.all(workers);
  return Object.fromEntries(entries);
}

/**
 * Prefer a compact national payload. If an edge proxy declines the large
 * response, reconstruct the identical repository-backed 50-state frame from
 * the existing state boundary route with bounded parallelism.
 */
export async function loadNationalAtlasBoundaryBundle(congress: number, request: BoundaryRequest = fetch) : Promise<AtlasBoundaryLoad> {
  const coverage = atlasManifestCoverage(congress);
  try {
    const response = await request(`/api/atlas/bundle/${congress}`);
    if (response.ok) {
      const candidate = await response.json();
      if (candidate && typeof candidate === "object" && Object.keys(candidate as Record<string, string>).length === coverage.stateCount) {
        return { bundle: candidate as Record<string, string>, source: "bundle" };
      }
    }
  } catch { /* fall through to repository state files */ }

  try {
    const chunkCount = Math.ceil(coverage.boundaryFiles.length / 10);
    const chunks = await Promise.all(Array.from({ length: chunkCount }, async (_, chunk) => {
      const response = await request(`/api/atlas/bundle/${congress}?chunk=${chunk}`);
      if (!response.ok) throw new Error("Historical boundary chunk unavailable");
      return response.json() as Promise<Record<string, string>>;
    }));
    const bundle = Object.assign({}, ...chunks);
    if (Object.keys(bundle).length === coverage.stateCount) return { bundle, source: "chunked-bundle" };
  } catch { /* fall through to individual repository state files */ }

  const bundle = await loadFilesWithConcurrency(coverage.boundaryFiles, request);
  if (Object.keys(bundle).length !== coverage.stateCount) throw new Error("Historical national boundary frame is incomplete");
  return { bundle, source: "state-fallback" };
}

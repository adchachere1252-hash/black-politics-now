import type { Express } from "express";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const LEWIS_GEOJSON_BASE = "https://raw.githubusercontent.com/JeffreyBLewis/congressional-district-boundaries/master/GeoJson";
const boundaryCache = new Map<string, string>();
const boundaryFetches = new Map<string, Promise<string | null>>();
const congressBundleCache = new Map<number, string>();
const congressBundleFetches = new Map<number, Promise<string | null>>();
const MAX_BOUNDARY_CACHE_ENTRIES = 180;
const MAX_BUNDLE_CACHE_ENTRIES = 6;

function safeBoundaryFilename(value: string) {
  return /^[A-Za-z][A-Za-z _-]{1,80}_[0-9]{3}_to_[0-9]{3}\.geojson$/.test(value);
}

function cacheBoundary(filename: string, value: string) {
  if (boundaryCache.has(filename)) boundaryCache.delete(filename);
  boundaryCache.set(filename, value);
  if (boundaryCache.size > MAX_BOUNDARY_CACHE_ENTRIES) boundaryCache.delete(boundaryCache.keys().next().value as string);
}

function cacheCongressBundle(congress: number, value: string) {
  if (congressBundleCache.has(congress)) congressBundleCache.delete(congress);
  congressBundleCache.set(congress, value);
  if (congressBundleCache.size > MAX_BUNDLE_CACHE_ENTRIES) congressBundleCache.delete(congressBundleCache.keys().next().value as number);
}

async function getBoundaryFile(filename: string): Promise<string | null> {
  const cached = boundaryCache.get(filename);
  if (cached) return cached;
  const pending = boundaryFetches.get(filename);
  if (pending) return pending;
  const request = (async () => {
    try {
      const response = await fetch(`${LEWIS_GEOJSON_BASE}/${encodeURIComponent(filename)}`, { signal: AbortSignal.timeout(20_000) });
      if (!response.ok) return null;
      const body = await response.text();
      if (!body.startsWith("{") || body.length < 100) return null;
      cacheBoundary(filename, body);
      return body;
    } catch {
      return null;
    } finally {
      boundaryFetches.delete(filename);
    }
  })();
  boundaryFetches.set(filename, request);
  return request;
}

async function buildCongressBundle(congress: number): Promise<string | null> {
  const cached = congressBundleCache.get(congress);
  if (cached) return cached;
  const pending = congressBundleFetches.get(congress);
  if (pending) return pending;
  const request = (async () => {
    try {
      const filenames = Array.from(new Set(Object.values(LEWIS_MANIFEST)
        .map((eras) => eras.find((era) => congress >= era.start && congress <= era.end)?.name)
        .filter((name): name is string => Boolean(name))));
      const fetched = await Promise.all(filenames.map(async (filename) => ({ filename, body: await getBoundaryFile(filename) })));
      const bundle: Record<string, string> = {};
      fetched.forEach(({ filename, body }) => { if (body) bundle[filename] = body; });
      if (!Object.keys(bundle).length) return null;
      const serialized = JSON.stringify(bundle);
      cacheCongressBundle(congress, serialized);
      return serialized;
    } finally {
      congressBundleFetches.delete(congress);
    }
  })();
  congressBundleFetches.set(congress, request);
  return request;
}

/**
 * Serves repository-backed historical congressional boundary files. Both routes
 * are read-only references: they document historical geography, not legal-map certification.
 */
export function registerAtlasBoundaryRoute(app: Express) {
  app.get("/api/atlas/boundary/:filename", async (req, res) => {
    const filename = req.params.filename;
    if (!safeBoundaryFilename(filename)) return res.status(400).json({ error: "Invalid historical boundary filename" });
    const body = await getBoundaryFile(filename);
    if (!body) return res.status(502).json({ error: "Historical boundary source unavailable" });
    res.setHeader("Content-Type", "application/geo+json");
    res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    return res.send(body);
  });

  app.get("/api/atlas/bundle/:congress", async (req, res) => {
    const congress = Number(req.params.congress);
    if (!Number.isInteger(congress) || congress < 89 || congress > 119) return res.status(400).json({ error: "Congress must be between 89 and 119" });
    const bundle = await buildCongressBundle(congress);
    if (!bundle) return res.status(502).json({ error: "Historical boundary bundle is unavailable" });
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    return res.send(bundle);
  });
}

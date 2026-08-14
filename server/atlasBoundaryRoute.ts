import type { Express } from "express";

const LEWIS_GEOJSON_BASE = "https://raw.githubusercontent.com/JeffreyBLewis/congressional-district-boundaries/master/GeoJson";
const boundaryCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 24;

function safeBoundaryFilename(value: string) {
  return /^[A-Za-z][A-Za-z _-]{1,80}_[0-9]{3}_to_[0-9]{3}\.geojson$/.test(value);
}

function cacheBoundary(filename: string, value: string) {
  if (boundaryCache.has(filename)) boundaryCache.delete(filename);
  boundaryCache.set(filename, value);
  if (boundaryCache.size > MAX_CACHE_ENTRIES) boundaryCache.delete(boundaryCache.keys().next().value as string);
}

/**
 * Proxies only manifest-shaped Lewis Congressional District Boundary filenames.
 * The route is read-only and intentionally does not imply that historical files
 * are current legal maps.
 */
export function registerAtlasBoundaryRoute(app: Express) {
  app.get("/api/atlas/boundary/:filename", async (req, res) => {
    const filename = req.params.filename;
    if (!safeBoundaryFilename(filename)) return res.status(400).json({ error: "Invalid historical boundary filename" });
    const cached = boundaryCache.get(filename);
    if (cached) {
      res.setHeader("Content-Type", "application/geo+json");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached);
    }
    try {
      const response = await fetch(`${LEWIS_GEOJSON_BASE}/${encodeURIComponent(filename)}`, { signal: AbortSignal.timeout(12_000) });
      if (response.status === 404) return res.status(404).json({ error: "Historical boundary file not found" });
      if (!response.ok) return res.status(502).json({ error: "Historical boundary source unavailable" });
      const body = await response.text();
      if (!body.startsWith("{") || body.length < 100) return res.status(502).json({ error: "Historical boundary source returned invalid data" });
      cacheBoundary(filename, body);
      res.setHeader("Content-Type", "application/geo+json");
      res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
      return res.send(body);
    } catch {
      return res.status(504).json({ error: "Historical boundary source timed out" });
    }
  });
}

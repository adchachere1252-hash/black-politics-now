import type { Express } from "express";
import { gzipSync } from "node:zlib";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const LEWIS_GEOJSON_BASE = "https://raw.githubusercontent.com/JeffreyBLewis/congressional-district-boundaries/master/GeoJson";
const boundaryCache = new Map<string, string>();
const boundaryFetches = new Map<string, Promise<string | null>>();
const congressBundleCache = new Map<number, { json: string; gzip: Buffer }>();
const congressBundleFetches = new Map<number, Promise<string | null>>();
type AtlasOverlayMember = { name: string; party: "D" | "R" | "O"; partyCode: number; stateCode: string; district: number; bioguideId: string | null };
const voteviewOverlayCache = new Map<number, Record<string, AtlasOverlayMember>>();
const voteviewOverlayFetches = new Map<number, Promise<Record<string, AtlasOverlayMember> | null>>();
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
  congressBundleCache.set(congress, { json: value, gzip: gzipSync(value, { level: 9 }) });
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
  if (cached) return cached.json;
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

function parseCsvRow(row: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"') {
      if (quoted && row[index + 1] === '"') { current += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { values.push(current); current = ""; }
    else current += character;
  }
  values.push(current);
  return values;
}

function memberDisplayName(value: string) {
  const trimmed = value.trim();
  if (!trimmed.includes(",")) return trimmed;
  const [surname, ...given] = trimmed.split(",");
  const titleCaseSurname = surname.trim().toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
  return `${given.join(",").trim()} ${titleCaseSurname}`.trim();
}

async function loadVoteviewOverlay(congress: number): Promise<Record<string, AtlasOverlayMember> | null> {
  const cached = voteviewOverlayCache.get(congress);
  if (cached) return cached;
  const pending = voteviewOverlayFetches.get(congress);
  if (pending) return pending;
  const request = (async () => {
    try {
      const file = `H${String(congress).padStart(3, "0")}_members.csv`;
      const response = await fetch(`https://voteview.com/static/data/out/members/${file}`, { signal: AbortSignal.timeout(20_000) });
      if (!response.ok) return null;
      const csv = await response.text();
      const lines = csv.trim().split(/\r?\n/);
      if (lines.length < 2) return null;
      const headings = parseCsvRow(lines[0]);
      const column = (name: string) => headings.indexOf(name);
      const chamber = column("chamber");
      const state = column("state_abbrev");
      const district = column("district_code");
      const party = column("party_code");
      const name = column("bioname");
      const bioguideId = column("bioguide_id");
      if ([chamber, state, district, party, name].some((value) => value < 0)) return null;
      const members: Record<string, AtlasOverlayMember> = {};
      for (const line of lines.slice(1)) {
        const values = parseCsvRow(line);
        if (values[chamber] !== "House") continue;
        const stateCode = values[state]?.trim();
        const districtNumber = Number(values[district]);
        const partyCode = Number(values[party]);
        if (!stateCode || !Number.isInteger(districtNumber) || !Number.isInteger(partyCode)) continue;
        members[`${stateCode}-${districtNumber}`] = {
          name: memberDisplayName(values[name] ?? ""),
          party: partyCode === 100 ? "D" : partyCode === 200 ? "R" : "O",
          partyCode,
          stateCode,
          district: districtNumber,
          bioguideId: values[bioguideId]?.trim() || null,
        };
      }
      if (!Object.keys(members).length) return null;
      voteviewOverlayCache.set(congress, members);
      return members;
    } catch {
      return null;
    } finally {
      voteviewOverlayFetches.delete(congress);
    }
  })();
  voteviewOverlayFetches.set(congress, request);
  return request;
}

/**
 * Serves repository-backed historical congressional boundary files and verified
 * Voteview House member data. Both remain descriptive historical references.
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
    const compressed = congressBundleCache.get(congress)?.gzip ?? gzipSync(bundle, { level: 9 });
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.setHeader("Vary", "Accept-Encoding");
    return res.send(compressed);
  });

  app.get("/api/atlas/overlay/:congress", async (req, res) => {
    const congress = Number(req.params.congress);
    if (!Number.isInteger(congress) || congress < 89 || congress > 119) return res.status(400).json({ error: "Congress must be between 89 and 119" });
    const members = await loadVoteviewOverlay(congress);
    if (!members) return res.status(503).json({ error: "Verified Voteview member data is temporarily unavailable" });
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    return res.json({
      congress,
      source: {
        name: "Voteview: Congressional Roll-Call Votes Database",
        url: "https://voteview.com/data",
        memberDataUrl: `https://voteview.com/static/data/out/members/H${String(congress).padStart(3, "0")}_members.csv`,
        citation: "Lewis, Poole, Rosenthal, Boche, Rudkin, and Sonnet (2026)",
      },
      members,
    });
  });
}

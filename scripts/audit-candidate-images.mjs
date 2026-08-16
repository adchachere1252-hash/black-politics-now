import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const productionOrigin = "https://blkpolnow-nztxnshf.manus.space";
const timeoutMs = 15_000;
const concurrency = 12;

const sources = [
  {
    category: "Senate",
    sql: "SELECT id, state_code AS jurisdiction, candidate1_name AS name, candidate1_photo AS photo_url, 'candidate1' AS photo_field FROM senate_races UNION ALL SELECT id, state_code, candidate2_name, candidate2_photo, 'candidate2' FROM senate_races",
  },
  {
    category: "House",
    sql: "SELECT id, CONCAT(state_code, '-', district_label) AS jurisdiction, candidate1_name AS name, candidate1_photo AS photo_url, 'candidate1' AS photo_field FROM house_races UNION ALL SELECT id, CONCAT(state_code, '-', district_label), candidate2_name, candidate2_photo, 'candidate2' FROM house_races",
  },
  {
    category: "Governor",
    sql: "SELECT id, state_code AS jurisdiction, dem_candidate AS name, dem_photo AS photo_url, 'dem' AS photo_field FROM governor_races UNION ALL SELECT id, state_code, rep_candidate, rep_photo, 'rep' FROM governor_races",
  },
  {
    category: "Black Representation",
    sql: "SELECT id, CONCAT(state_code, '-', district) AS jurisdiction, member AS name, photo AS photo_url, 'profile' AS photo_field FROM cbc_members",
  },
];

function normaliseUrl(value) {
  if (!value || !String(value).trim()) return null;
  const url = String(value).trim();
  return url.startsWith("/") ? `${productionOrigin}${url}` : url;
}

function signatureType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buffer.subarray(0, 5).toString().toLowerCase() === "<?xml" || buffer.subarray(0, 4).toString().toLowerCase() === "<svg") return "svg";
  return null;
}

async function inspectImage(rawUrl) {
  const url = normaliseUrl(rawUrl);
  if (!url) return { status: "missing", resolvedUrl: null, httpStatus: null, contentType: null, signature: null, error: null };
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
    if (!response.ok || !response.headers.get("content-type")) {
      response = await fetch(url, { method: "GET", headers: { Range: "bytes=0-2047" }, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
    }
    const contentType = response.headers.get("content-type") || "";
    const body = response.body ? Buffer.from(await response.arrayBuffer()) : Buffer.alloc(0);
    const signature = signatureType(body);
    const isImage = response.ok && (contentType.toLowerCase().startsWith("image/") || Boolean(signature));
    return {
      status: isImage ? "reachable_image" : "invalid_asset",
      resolvedUrl: response.url || url,
      httpStatus: response.status,
      contentType: contentType || null,
      signature,
      error: isImage ? null : "URL did not return a recognizable image response",
    };
  } catch (error) {
    return { status: "unreachable", resolvedUrl: url, httpStatus: null, contentType: null, signature: null, error: error instanceof Error ? error.message : String(error) };
  }
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const rowsByCategory = [];
for (const source of sources) {
  const [rows] = await connection.query(source.sql);
  rowsByCategory.push({ category: source.category, rows: rows.filter((row) => row.name && String(row.name).trim()) });
}
await connection.end();

const candidates = rowsByCategory.flatMap(({ category, rows }) => rows.map((row) => ({ category, ...row })));
const inspected = await mapLimit(candidates, concurrency, async (candidate) => ({ ...candidate, ...(await inspectImage(candidate.photo_url)) }));

const summary = sources.map(({ category }) => {
  const group = inspected.filter((item) => item.category === category);
  const count = (status) => group.filter((item) => item.status === status).length;
  return {
    category,
    namedCandidateSlots: group.length,
    reachableImages: count("reachable_image"),
    missingImages: count("missing"),
    unreachableImages: count("unreachable"),
    invalidAssets: count("invalid_asset"),
    coverageRate: group.length ? Number(((count("reachable_image") / group.length) * 100).toFixed(1)) : 0,
  };
});

const report = {
  generatedAt: new Date().toISOString(),
  scope: "Candidate slot coverage and URL-level image reachability. This audit does not certify the depicted person's identity or photo recency.",
  summary,
  gaps: inspected.filter((item) => item.status !== "reachable_image"),
  reachableAssets: inspected.filter((item) => item.status === "reachable_image"),
};

const outputDir = path.resolve("reports");
await fs.mkdir(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "candidate-image-audit.json");
await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ outputPath, summary, totalNamedCandidateSlots: inspected.length }, null, 2));
process.exit(0);

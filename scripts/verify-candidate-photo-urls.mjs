import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";

const photos = JSON.parse(await readFile("server/repositoryCandidatePhotos.json", "utf8"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const previewBase = process.env.PHOTO_VERIFY_BASE ?? "https://blkpolnow-nztxnshf.manus.space";
const repositoryStorageBase = "https://electionmap-duqshn4d.manus.space";

const normalize = (name) => (name || "")
  .toLowerCase()
  .replace(/\s*\([^)]*\)/g, "")
  .replace(/,?\s+(jr\.?|sr\.?|ii|iii|iv)$/i, "")
  .replace(/\s+[a-z]\.?\s+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const fields = [
  ["Senate", "senate_races", "candidate1_name", "candidate1_photo"], ["Senate", "senate_races", "candidate2_name", "candidate2_photo"],
  ["House", "house_races", "candidate1_name", "candidate1_photo"], ["House", "house_races", "candidate2_name", "candidate2_photo"],
  ["Governor", "governor_races", "dem_candidate", "dem_photo"], ["Governor", "governor_races", "rep_candidate", "rep_photo"],
  ["Black Representation", "cbc_members", "member", "photo"],
];

function mapUrl(token) {
  if (!token) return null;
  if (token.startsWith("bioguide:")) return `https://unitedstates.github.io/images/congress/225x275/${token.slice(9)}.jpg`;
  if (token.startsWith("cdn:")) return `${repositoryStorageBase}/manus-storage/${token.slice(4)}`;
  if (token.startsWith("manus:")) {
    const storedPath = token.slice(6);
    if (storedPath.startsWith("http")) return storedPath;
    if (storedPath.startsWith("/manus-storage/")) return `${repositoryStorageBase}${storedPath}`;
    return `${repositoryStorageBase}/manus-storage/${storedPath.replace(/^\/+/, "")}`;
  }
  return null;
}

function publicUrl(url) {
  if (!url || url === "NULL" || url === "None") return null;
  return url.startsWith("/") ? `${previewBase}${url}` : url;
}

const resolved = new Map();
for (const [collection, table, nameField, photoField] of fields) {
  const [rows] = await connection.query(`SELECT \`${nameField}\` AS name, \`${photoField}\` AS photo FROM \`${table}\` WHERE \`${nameField}\` IS NOT NULL AND TRIM(\`${nameField}\`) <> ''`);
  for (const row of rows) {
    const name = String(row.name);
    if (name.toLowerCase().startsWith("tbd")) continue;
    const token = photos[name.toLowerCase().trim()] || photos[normalize(name)] || null;
    const url = publicUrl(row.photo) || mapUrl(token);
    if (url) resolved.set(`${collection}:${name}`, { collection, name, url });
  }
}

const entries = [...resolved.values()];
const checkedByCollection = Object.fromEntries([...new Set(entries.map((entry) => entry.collection))].map((collection) => [collection, entries.filter((entry) => entry.collection === collection).length]));
const failures = [];
let cursor = 0;
const concurrency = 20;
async function worker() {
  while (cursor < entries.length) {
    const entry = entries[cursor++];
    try {
      let response = await fetch(entry.url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(45_000) });
      if (!response.ok && response.status !== 405) response = await fetch(entry.url, { headers: { Range: "bytes=0-1024" }, redirect: "follow", signal: AbortSignal.timeout(45_000) });
      if (!response.ok) failures.push({ ...entry, status: response.status });
    } catch (error) {
      failures.push({ ...entry, status: "network", error: error instanceof Error ? error.message : String(error) });
    }
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
await connection.end();

console.log(JSON.stringify({ checked: entries.length, checkedByCollection, passed: entries.length - failures.length, failed: failures.length, failures: failures.slice(0, 100) }, null, 2));
process.exit(failures.length ? 2 : 0);

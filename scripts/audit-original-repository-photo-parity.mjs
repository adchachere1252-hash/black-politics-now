import mysql from "mysql2/promise";
import { readFile } from "node:fs/promises";

const originalMapSource = await readFile("/home/ubuntu/election-map-2026/client/src/lib/candidatePhotos.ts", "utf8");
const repositoryPhotos = JSON.parse(await readFile("server/repositoryCandidatePhotos.json", "utf8"));
const researchedPhotos = JSON.parse(await readFile("server/researchedCandidatePhotos.json", "utf8"));
const blackRepresentationPhotos = JSON.parse(await readFile("server/blackRepresentationVerifiedPhotos.json", "utf8"));

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/,?\s+(jr\.?|sr\.?|ii|iii|iv)$/i, "")
    .replace(/\s+[a-z]\.?\s+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function namesInBlock(start, end) {
  const body = originalMapSource.slice(originalMapSource.indexOf(start), originalMapSource.indexOf(end));
  return [...body.matchAll(/^\s*"([^"]+)"\s*:/gm)].map((match) => normalize(match[1]));
}

const originalNames = new Set([
  ...namesInBlock("export const BIOGUIDE_MAP", "const CDN_PHOTOS"),
  ...namesInBlock("const CDN_PHOTOS", "export function"),
]);
const currentFallbackNames = new Set([
  ...Object.keys(repositoryPhotos),
  ...Object.keys(researchedPhotos),
  ...Object.keys(blackRepresentationPhotos),
].map(normalize));

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const fields = [
  ["Senate", "senate_races", "candidate1_name", "candidate1_photo"],
  ["Senate", "senate_races", "candidate2_name", "candidate2_photo"],
  ["House", "house_races", "candidate1_name", "candidate1_photo"],
  ["House", "house_races", "candidate2_name", "candidate2_photo"],
  ["Governor", "governor_races", "dem_candidate", "dem_photo"],
  ["Governor", "governor_races", "rep_candidate", "rep_photo"],
  ["Black Representation", "cbc_members", "member", "photo"],
];

const targets = [];
for (const [collection, table, nameField, photoField] of fields) {
  const [rows] = await connection.query(`SELECT \`${nameField}\` AS name, \`${photoField}\` AS storedPhoto FROM \`${table}\` WHERE \`${nameField}\` IS NOT NULL AND TRIM(\`${nameField}\`) <> ''`);
  for (const row of rows) {
    const name = String(row.name);
    if (normalize(name).startsWith("tbd")) continue;
    const stored = Boolean(row.storedPhoto && row.storedPhoto !== "None" && row.storedPhoto !== "null");
    const normalized = normalize(name);
    targets.push({ collection, name, stored, originalMap: originalNames.has(normalized), currentFallback: currentFallbackNames.has(normalized) });
  }
}
await connection.end();

const byCollection = Object.fromEntries([...new Set(targets.map((target) => target.collection))].map((collection) => {
  const rows = targets.filter((target) => target.collection === collection);
  return [collection, {
    named: rows.length,
    stored: rows.filter((target) => target.stored).length,
    originalRepositoryMapped: rows.filter((target) => target.originalMap).length,
    currentFallbackMapped: rows.filter((target) => target.currentFallback).length,
    deployable: rows.filter((target) => target.stored || target.currentFallback).length,
    unresolved: rows.filter((target) => !target.stored && !target.currentFallback).length,
  }];
}));
const unresolved = targets.filter((target) => !target.stored && !target.currentFallback);

console.log(JSON.stringify({
  originalRepository: {
    staticNameMappings: originalNames.size,
    currentRepositoryFallbackMappings: Object.keys(repositoryPhotos).length,
    currentResearchMappings: Object.keys(researchedPhotos).length,
    currentBlackRepresentationMappings: Object.keys(blackRepresentationPhotos).length,
    originalNamesNotPresentInCurrentFallbackMaps: [...originalNames].filter((name) => !currentFallbackNames.has(name)).length,
  },
  currentPlatform: {
    namedNonTbdSlots: targets.length,
    storedPhotoSlots: targets.filter((target) => target.stored).length,
    currentFallbackSlots: targets.filter((target) => target.currentFallback).length,
    deployableSlots: targets.filter((target) => target.stored || target.currentFallback).length,
    unresolvedSlots: unresolved.length,
    byCollection,
    sampleUnresolved: unresolved.slice(0, 40),
  },
}, null, 2));

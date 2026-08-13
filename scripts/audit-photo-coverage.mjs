import mysql from "mysql2/promise";
import { readFile, writeFile } from "node:fs/promises";

const photos = JSON.parse(await readFile("/home/ubuntu/election-map-2026/server/allCandidatePhotos.json", "utf8"));
const connection = await mysql.createConnection(process.env.DATABASE_URL);

const normalize = (name) => (name || "")
  .toLowerCase()
  .replace(/\s*\([^)]*\)/g, "")
  .replace(/,?\s+(jr\.?|sr\.?|ii|iii|iv)$/i, "")
  .replace(/\s+[a-z]\.?\s+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const candidateFields = [
  ["Senate", "senate_races", "candidate1_name", "candidate1_photo"],
  ["Senate", "senate_races", "candidate2_name", "candidate2_photo"],
  ["House", "house_races", "candidate1_name", "candidate1_photo"],
  ["House", "house_races", "candidate2_name", "candidate2_photo"],
  ["Governor", "governor_races", "dem_candidate", "dem_photo"],
  ["Governor", "governor_races", "rep_candidate", "rep_photo"],
  ["Black Representation", "cbc_members", "member", "photo"],
];

const people = [];
for (const [collection, table, nameField, photoField] of candidateFields) {
  const [rows] = await connection.query(`SELECT \`${nameField}\` AS name, \`${photoField}\` AS storedPhoto FROM \`${table}\` WHERE \`${nameField}\` IS NOT NULL AND TRIM(\`${nameField}\`) <> ''`);
  for (const row of rows) {
    const exact = `${row.name}`.toLowerCase().trim();
    const normalized = normalize(row.name);
    const mapping = photos[exact] || photos[normalized] || null;
    people.push({ collection, name: row.name, stored: Boolean(row.storedPhoto), mapping });
  }
}

const byCollection = Object.fromEntries([...new Set(people.map((person) => person.collection))].map((collection) => {
  const subset = people.filter((person) => person.collection === collection);
  return [collection, {
    named: subset.length,
    storedPhoto: subset.filter((person) => person.stored).length,
    originalRepoMatch: subset.filter((person) => person.mapping).length,
    deployablePhoto: subset.filter((person) => person.stored || person.mapping).length,
    stillUnresolved: subset.filter((person) => !person.stored && !person.mapping).length,
  }];
}));

const unresolved = people.filter((person) => !person.stored && !person.mapping);
const sourceableUnresolved = unresolved.filter((person) => !person.name.toLowerCase().startsWith("tbd"));
await writeFile("docs/candidate-photo-unresolved-2026-08-13.json", JSON.stringify(sourceableUnresolved, null, 2));
console.log(JSON.stringify({
  originalRepoMapEntries: Object.keys(photos).length,
  totals: {
    named: people.length,
    storedPhoto: people.filter((person) => person.stored).length,
    originalRepoMatch: people.filter((person) => person.mapping).length,
    deployablePhoto: people.filter((person) => person.stored || person.mapping).length,
    stillUnresolved: unresolved.length,
  },
  byCollection,
  unresolvedByCollection: Object.fromEntries([...new Set(unresolved.map((person) => person.collection))].map((collection) => [collection, unresolved.filter((person) => person.collection === collection).slice(0, 30).map((person) => person.name)])),
  sourceableUnresolved: sourceableUnresolved.length,
}, null, 2));

await connection.end();
process.exit(0);

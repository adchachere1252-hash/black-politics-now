import { readFile, writeFile } from "node:fs/promises";

const reportPaths = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["docs/candidate-photo-research-validated-2026-08-13.json"];
const reports = await Promise.all(reportPaths.map(async (reportPath) => JSON.parse(await readFile(reportPath, "utf8"))));
const map = {};
const provenance = [];

for (const report of reports) for (const row of report.integrationRows) {
  const key = row.candidate_name.toLowerCase().trim();
  if (map[key] && map[key] !== row.resolved_image_url) continue;
  map[key] = row.resolved_image_url;
  provenance.push({
    collection: row.collection,
    candidate_name: row.candidate_name,
    portrait_url: row.resolved_image_url,
    portrait_page_url: row.portrait_page_url,
    source_type: row.source_type,
    source_title: row.source_title,
    image_origin: row.image_origin,
  });
}

await writeFile("server/researchedCandidatePhotos.json", JSON.stringify(map, null, 2));
await writeFile("docs/verified-candidate-portrait-provenance-2026-08-13.json", JSON.stringify(provenance, null, 2));
console.log(`Prepared ${provenance.length} provenance-backed portrait fallbacks.`);

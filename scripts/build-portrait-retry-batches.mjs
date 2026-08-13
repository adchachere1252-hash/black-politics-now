import { mkdir, readFile, writeFile } from "node:fs/promises";

const candidates = JSON.parse(await readFile("docs/candidate-photo-unresolved-2026-08-13.json", "utf8"));
const reportPaths = [
  "docs/candidate-photo-research-validated-2026-08-13.json",
  "docs/candidate-photo-research-retry-validated-2026-08-13.json",
  "docs/candidate-photo-research-final-validated-2026-08-13.json",
  "docs/candidate-photo-research-last-validated-2026-08-13.json",
];
const reports = await Promise.all(reportPaths.map(async (reportPath) => JSON.parse(await readFile(reportPath, "utf8"))));
const integrated = new Set(reports.flatMap((report) => report.integrationRows.map((row) => `${row.collection}|${row.candidate_name.toLowerCase().trim()}`)));
const priorEvidence = new Map(reports.flatMap((report) => report.validationFailures).map((row) => [
  `${row.collection}|${row.candidate_name.toLowerCase().trim()}`,
  {
    priorPortraitPageUrl: row.portrait_page_url,
    priorDirectImageUrl: row.direct_image_url,
    priorSourceType: row.source_type,
    validationFailure: row.image?.reason ?? "source_page_or_image_unavailable",
  },
]));

const remaining = candidates
  .filter((candidate) => !candidate.name.toLowerCase().startsWith("tbd"))
  .filter((candidate) => !integrated.has(`${candidate.collection}|${candidate.name.toLowerCase().trim()}`))
  .map((candidate) => ({ ...candidate, ...(priorEvidence.get(`${candidate.collection}|${candidate.name.toLowerCase().trim()}`) ?? {}) }));

const outputDir = process.argv[2] ?? "docs/candidate-photo-research-final-batches";
await mkdir(outputDir, { recursive: true });
const batchSize = 30;
for (let index = 0; index < remaining.length; index += batchSize) {
  const number = String(index / batchSize + 1).padStart(2, "0");
  await writeFile(`${outputDir}/batch-${number}.json`, JSON.stringify(remaining.slice(index, index + batchSize), null, 2));
}

await writeFile("docs/candidate-photo-research-final-remaining-2026-08-13.json", JSON.stringify(remaining, null, 2));
console.log(`Created ${Math.ceil(remaining.length / batchSize)} second-pass batches for ${remaining.length} candidates.`);

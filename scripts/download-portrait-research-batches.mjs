import { mkdir, readFile, writeFile } from "node:fs/promises";

const manifestPath = process.argv[2] ?? "/home/ubuntu/source_unresolved_candidate_portraits.json";
const outputDir = process.argv[3] ?? "docs/candidate-photo-research-results";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
await mkdir(outputDir, { recursive: true });

for (const [index, result] of manifest.results.entries()) {
  const url = result.output.research_file;
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Batch ${index + 1} download failed: ${response.status}`);
  const number = String(index + 1).padStart(2, "0");
  await writeFile(`${outputDir}/batch-${number}.csv`, await response.text());
}

await writeFile(`${outputDir}/research-manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`Downloaded ${manifest.results.length} official-source portrait research batches.`);

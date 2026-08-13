import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = JSON.parse(await readFile("docs/candidate-photo-unresolved-2026-08-13.json", "utf8"));
const candidates = source.filter((entry) => !entry.name.toLowerCase().startsWith("tbd"));
const batchSize = 30;
const outputDir = "docs/candidate-photo-research-batches";
await mkdir(outputDir, { recursive: true });

for (let index = 0; index < candidates.length; index += batchSize) {
  const batch = candidates.slice(index, index + batchSize);
  const number = String(index / batchSize + 1).padStart(2, "0");
  await writeFile(`${outputDir}/batch-${number}.json`, JSON.stringify(batch, null, 2));
}

console.log(`Created ${Math.ceil(candidates.length / batchSize)} batches for ${candidates.length} candidates.`);

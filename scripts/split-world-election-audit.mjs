import { mkdir, readFile, writeFile } from 'node:fs/promises';

const records = JSON.parse(
  await readFile('docs/world-elections-verification-input-2026-08-13.json', 'utf8'),
);
const batchSize = 6;
const outputDir = 'docs/world-elections-audit-batches-2026-08-13';
await mkdir(outputDir, { recursive: true });

const paths = [];
for (let offset = 0; offset < records.length; offset += batchSize) {
  const batch = records.slice(offset, offset + batchSize);
  const index = String(paths.length + 1).padStart(2, '0');
  const path = `${outputDir}/batch-${index}.json`;
  await writeFile(path, JSON.stringify(batch, null, 2) + '\n', 'utf8');
  paths.push(`/home/ubuntu/black-politics-now/${path}`);
}

console.log(paths.join('\n'));

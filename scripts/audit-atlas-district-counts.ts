import { APPORTIONMENT_HISTORY } from "../client/src/data/atlasHistory";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const SOURCE_ROOT = "https://raw.githubusercontent.com/JeffreyBLewis/congressional-district-boundaries/master/GeoJson";
const CONGRESSES = Array.from({ length: 31 }, (_, index) => 89 + index);

function historyIndexForCongress(congress: number) {
  if (congress <= 92) return 0;
  if (congress <= 97) return 1;
  if (congress <= 102) return 2;
  if (congress <= 107) return 3;
  if (congress <= 112) return 4;
  if (congress <= 117) return 5;
  return 6;
}

function filenameFor(state: string, congress: number) {
  return LEWIS_MANIFEST[state].find((era) => congress >= era.start && congress <= era.end)?.name;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }));
  return results;
}

async function auditCongress(congress: number) {
  const index = historyIndexForCongress(congress);
  const states = Object.keys(LEWIS_MANIFEST);
  const rows = await mapPool(states, 8, async (state) => {
    const filename = filenameFor(state, congress);
    if (!filename) return { state, filename: null, expected: APPORTIONMENT_HISTORY[state][index], features: -1 };
    const response = await fetch(`${SOURCE_ROOT}/${encodeURIComponent(filename)}`, { signal: AbortSignal.timeout(25_000) });
    if (!response.ok) return { state, filename, expected: APPORTIONMENT_HISTORY[state][index], features: -1 };
    const collection = await response.json() as { features?: unknown[] };
    return { state, filename, expected: APPORTIONMENT_HISTORY[state][index], features: collection.features?.length ?? 0 };
  });
  const mismatches = rows.filter((row) => row.features !== row.expected);
  return {
    congress,
    states: rows.length,
    expectedDistricts: rows.reduce((total, row) => total + row.expected, 0),
    sourceFeatures: rows.reduce((total, row) => total + Math.max(0, row.features), 0),
    mismatches,
  };
}

async function main() {
  const reports = [];
  for (const congress of CONGRESSES) reports.push(await auditCongress(congress));
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), reports }, null, 2));
  if (reports.some((report) => report.expectedDistricts !== report.sourceFeatures || report.mismatches.length)) process.exitCode = 1;
}

void main();

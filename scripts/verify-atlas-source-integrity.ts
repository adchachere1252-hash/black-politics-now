import { APPORTIONMENT_HISTORY } from "../client/src/data/atlasHistory";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const VRA_FIRST_CONGRESS = 89;
const CURRENT_CONGRESS = 119;
const repositoryTree = "https://api.github.com/repos/JeffreyBLewis/congressional-district-boundaries/git/trees/master?recursive=1";

type GitTreeResponse = { tree?: Array<{ path?: string; type?: string }> };

async function main() {
  const states = Object.keys(LEWIS_MANIFEST).sort();
  const manifestFiles = states.flatMap((state) => LEWIS_MANIFEST[state].map((era) => era.name));
  const coverageGaps = states.flatMap((state) => Array.from({ length: CURRENT_CONGRESS - VRA_FIRST_CONGRESS + 1 }, (_, index) => VRA_FIRST_CONGRESS + index)
    .filter((congress) => !LEWIS_MANIFEST[state].some((era) => congress >= era.start && congress <= era.end))
    .map((congress) => `${state}:${congress}`));
  const response = await fetch(repositoryTree, { headers: { Accept: "application/vnd.github+json" }, signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`GitHub tree request failed: ${response.status}`);
  const payload = await response.json() as GitTreeResponse;
  const repositoryFiles = new Set((payload.tree ?? [])
    .filter((entry) => entry.type === "blob" && entry.path?.startsWith("GeoJson/"))
    .map((entry) => entry.path!.slice("GeoJson/".length)));
  const missingRepositoryFiles = manifestFiles.filter((filename) => !repositoryFiles.has(filename));
  const malformedRanges = states.flatMap((state) => LEWIS_MANIFEST[state]
    .filter((era) => {
      const range = era.name.match(/_(\d{3})_to_(\d{3})\.geojson$/);
      return !range || Number(range[1]) > era.start || Number(range[2]) < era.end;
    })
    .map((era) => `${state}:${era.name}`));
  const report = {
    checkedAt: new Date().toISOString(),
    scope: `${VRA_FIRST_CONGRESS}th through ${CURRENT_CONGRESS}th Congress`,
    states: states.length,
    stateHistories: Object.keys(APPORTIONMENT_HISTORY).length,
    manifestFiles: manifestFiles.length,
    repositoryGeoJsonFiles: repositoryFiles.size,
    coverageGaps,
    missingRepositoryFiles,
    malformedRanges,
    passed: states.length === 50 && Object.keys(APPORTIONMENT_HISTORY).length === 50 && coverageGaps.length === 0 && missingRepositoryFiles.length === 0 && malformedRanges.length === 0,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.passed) process.exitCode = 1;
}

void main();

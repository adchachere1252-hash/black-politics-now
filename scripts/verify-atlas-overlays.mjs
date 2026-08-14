const origin = process.env.ATLAS_VERIFY_ORIGIN || "http://127.0.0.1:3000";
const congresses = [89, 104, 119];

async function getJson(path) {
  const response = await fetch(`${origin}${path}`);
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.json();
}

for (const congress of congresses) {
  const [bundle, overlay] = await Promise.all([
    getJson(`/api/atlas/bundle/${congress}`),
    getJson(`/api/atlas/overlay/${congress}`),
  ]);
  const stateFeatures = new Map();
  for (const raw of Object.values(bundle)) {
    const collection = JSON.parse(raw);
    for (const feature of collection.features ?? []) {
      const state = feature.properties?.statename ?? feature.properties?.STATENAME ?? "Unknown";
      stateFeatures.set(state, (stateFeatures.get(state) ?? 0) + 1);
    }
  }
  const members = Object.values(overlay.members ?? {});
  const partyCounts = members.reduce((counts, member) => {
    counts[member.party] = (counts[member.party] ?? 0) + 1;
    return counts;
  }, {});
  const emptyNames = members.filter((member) => !member.name).length;
  const stateCoverage = stateFeatures.size;
  if (stateCoverage < 45) throw new Error(`${congress}th Congress has incomplete geometry coverage: ${stateCoverage} state labels`);
  if (members.length < 300) throw new Error(`${congress}th Congress has unexpectedly thin Voteview overlay coverage: ${members.length} members`);
  if (emptyNames > 0) throw new Error(`${congress}th Congress contains ${emptyNames} blank Voteview member names`);
  console.log(JSON.stringify({ congress, boundaryFiles: Object.keys(bundle).length, districtFeatures: [...stateFeatures.values()].reduce((total, count) => total + count, 0), stateCoverage, verifiedMemberOverlays: members.length, partyCounts, source: overlay.source?.name }, null, 2));
}

console.log("Atlas boundary and Voteview overlay verification passed for Congresses 89, 104, and 119.");

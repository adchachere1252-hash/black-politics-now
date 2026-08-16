import fs from "node:fs/promises";
import path from "node:path";

const root = "/home/ubuntu/black-politics-now";
const rawAudit = JSON.parse(await fs.readFile("/home/ubuntu/audit_candidate_photo_identity.json", "utf8"));
const portalManifest = JSON.parse(
  await fs.readFile(path.join(root, "reports/candidate-photo-identity-manifest.json"), "utf8"),
);
const repositoryMap = await fs.readFile(
  "/home/ubuntu/election-map-2026-audit/client/src/lib/candidatePhotos.ts",
  "utf8",
);

const validVerdicts = new Set(["verified_match", "mismatch", "broken", "unverifiable"]);
const unresolvedIds = rawAudit.results
  .filter((result) => !result.output || !validVerdicts.has(result.output.verdict))
  .map((result) => Number(result.input));

const unresolved = unresolvedIds.map((auditId) => {
  const record = portalManifest.find((item) => item.audit_id === auditId);
  if (!record) throw new Error(`Missing portal manifest record ${auditId}`);
  const escapedName = record.candidate_name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bioguideMatch = repositoryMap.match(new RegExp(`"${escapedName}"\\s*:\\s*"([A-Z]\\d{6})"`));
  const commentedMatch = repositoryMap.match(new RegExp(`//\\s*"${escapedName}"\\s*:\\s*"([A-Z]\\d{6})"`));
  const bioguideId = bioguideMatch?.[1] || commentedMatch?.[1] || null;
  return {
    ...record,
    repository_bioguide_id: bioguideId,
    repository_portrait_url: bioguideId
      ? `https://unitedstates.github.io/images/congress/225x275/${bioguideId}.jpg`
      : null,
  };
});

const outputPath = path.join(root, "reports/curated-unresolved-portrait-manifest.json");
await fs.writeFile(outputPath, JSON.stringify({ generated_at: new Date().toISOString(), records: unresolved }, null, 2));
console.log(JSON.stringify({ outputPath, count: unresolved.length }));

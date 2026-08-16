import fs from "node:fs/promises";
import path from "node:path";

const inputPath = "/home/ubuntu/audit_candidate_photo_identity.json";
const outputPath = path.resolve("reports/candidate-photo-identity-summary.json");
const raw = JSON.parse(await fs.readFile(inputPath, "utf8"));

const allowedVerdicts = new Set(["verified_match", "mismatch", "broken", "unverifiable"]);

const normalized = raw.results.map((result) => {
  if (!result.output || !allowedVerdicts.has(result.output.verdict)) {
    return {
      audit_id: Number(result.input),
      candidate_name: result.output?.candidate_name || "Unknown",
      verdict: "audit_failed",
      reason: result.error || "The identity audit did not return a complete usable finding.",
      source_url: null,
    };
  }
  return {
    audit_id: result.output.audit_id,
    candidate_name: result.output.candidate_name,
    verdict: result.output.verdict,
    reason: result.output.reason,
    source_url: result.output.source_url === "NA" ? null : result.output.source_url,
  };
});

const byVerdict = Object.fromEntries(
  ["verified_match", "mismatch", "broken", "unverifiable", "audit_failed"].map((verdict) => [
    verdict,
    normalized.filter((item) => item.verdict === verdict),
  ]),
);

const summary = {
  generated_at: new Date().toISOString(),
  total_reachable_portraits: normalized.length,
  counts: Object.fromEntries(Object.entries(byVerdict).map(([verdict, entries]) => [verdict, entries.length])),
  mismatches: byVerdict.mismatch,
  unavailable: [...byVerdict.broken, ...byVerdict.audit_failed],
  needs_human_verification: byVerdict.unverifiable,
  verified_matches: byVerdict.verified_match,
};

await fs.writeFile(outputPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ outputPath, counts: summary.counts }));

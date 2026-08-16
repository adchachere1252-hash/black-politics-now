import fs from "node:fs/promises";
import path from "node:path";

const auditPath = path.resolve("reports/candidate-image-audit.json");
const outputPath = path.resolve("reports/candidate-photo-identity-manifest.json");
const audit = JSON.parse(await fs.readFile(auditPath, "utf8"));

const entries = (audit.reachableAssets ?? []).map((item, index) => ({
  audit_id: index + 1,
  candidate_name: item.name,
  category: item.category,
  jurisdiction: item.jurisdiction,
  photo_field: item.photo_field,
  image_url: item.resolvedUrl ?? item.photo_url,
}));

await fs.writeFile(outputPath, JSON.stringify(entries, null, 2));
console.log(JSON.stringify({ outputPath, count: entries.length }));

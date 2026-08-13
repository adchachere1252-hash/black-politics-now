import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const audit = JSON.parse(await readFile('docs/world-elections-audit-sources-2026-08-13.json', 'utf8'));
const evidence = audit.results.flatMap((batch) => {
  const raw = batch?.output?.evidence ?? '[]';
  try { return JSON.parse(raw); } catch { return []; }
});

const connection = await mysql.createConnection(process.env.DATABASE_URL);
let updated = 0;
for (const record of evidence) {
  if (!Number.isInteger(record.id) || !Array.isArray(record.source_urls)) continue;
  const urls = [...new Set(record.source_urls.filter((url) => typeof url === 'string' && /^https:\/\//.test(url)))];
  if (!urls.length) continue;
  await connection.execute(
    'UPDATE world_elections SET source_urls = ?, updated_at = NOW() WHERE id = ?',
    [JSON.stringify(urls), record.id],
  );
  updated += 1;
}
await connection.end();
console.log(`Stored clickable audited sources for ${updated} World Elections records.`);

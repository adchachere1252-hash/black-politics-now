import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

const sourceFile = 'docs/world-election-detail-enrichment-sources-2026-08-13.json';
const report = JSON.parse(await readFile(sourceFile, 'utf8'));
const details = report.results.flatMap((result) => {
  const text = result?.output?.detail_json ?? '[]';
  return JSON.parse(text);
});

const connection = await mysql.createConnection(process.env.DATABASE_URL);
let updated = 0;

for (const detail of details) {
  const [rows] = await connection.execute(
    'SELECT key_issues, system_type, term_length, notes FROM world_elections WHERE id = ?',
    [detail.id],
  );
  const current = rows[0];
  if (!current) continue;

  const keyIssues = current.key_issues || JSON.stringify(detail.key_issues ?? []);
  const systemType = current.system_type || detail.system_type || null;
  const termLength = current.term_length || detail.term_length || null;
  const sourceLine = detail.source_urls?.length ? `\n\nDetail sources (audit 2026-08-13): ${detail.source_urls.join(' | ')}` : '';
  const notes = current.notes?.includes('Detail sources (audit 2026-08-13):')
    ? current.notes
    : `${current.notes ?? ''}${sourceLine}`.trim();

  await connection.execute(
    'UPDATE world_elections SET key_issues = ?, system_type = ?, term_length = ?, notes = ?, updated_at = NOW() WHERE id = ?',
    [keyIssues, systemType, termLength, notes, detail.id],
  );
  updated += 1;
}

await connection.end();
console.log(`Integrated source-backed detail context for ${updated} World Elections records.`);

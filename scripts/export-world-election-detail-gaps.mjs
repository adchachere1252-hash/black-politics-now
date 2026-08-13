import mysql from 'mysql2/promise';
import { mkdir, writeFile } from 'node:fs/promises';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute(`
  SELECT id, country, country_code, election_type, election_name, election_date,
         world_election_status, incumbent, incumbent_party, winner, winner_party,
         notes, candidates, key_issues, system_type, term_length
  FROM world_elections
  WHERE candidates IS NULL OR candidates = '' OR key_issues IS NULL OR key_issues = ''
     OR system_type IS NULL OR system_type = '' OR term_length IS NULL OR term_length = ''
  ORDER BY election_date ASC, country ASC
`);
await connection.end();

const outputDir = 'docs/world-election-detail-gap-batches-2026-08-13';
await mkdir(outputDir, { recursive: true });
for (let offset = 0; offset < rows.length; offset += 7) {
  const batch = rows.slice(offset, offset + 7);
  const index = String(offset / 7 + 1).padStart(2, '0');
  await writeFile(`${outputDir}/batch-${index}.json`, JSON.stringify(batch, null, 2) + '\n', 'utf8');
}
console.log(`Exported ${rows.length} incomplete World Elections records into ${Math.ceil(rows.length / 7)} batches.`);

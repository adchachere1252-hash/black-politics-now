import mysql from 'mysql2/promise';
import { writeFile } from 'node:fs/promises';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute(`
  SELECT id, country, country_code, election_type, election_name, election_date,
         end_date, world_election_status, is_date_confirmed, incumbent,
         incumbent_party, winner, winner_party, total_votes, turnout_pct,
         notes, updated_at
  FROM world_elections
  ORDER BY election_date ASC, country ASC
`);
await connection.end();

await writeFile(
  'docs/world-elections-verification-input-2026-08-13.json',
  JSON.stringify(rows, null, 2) + '\n',
  'utf8',
);

console.log(`Exported ${rows.length} World Elections records for verification.`);

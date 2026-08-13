import mysql from 'mysql2/promise';

function normalizeJsonText(value) {
  if (typeof value !== 'string' || !value.trim()) return value;
  try {
    const first = JSON.parse(value);
    if (typeof first !== 'string') return value;
    const second = JSON.parse(first);
    if (Array.isArray(second) || (second && typeof second === 'object')) return JSON.stringify(second);
  } catch {
    // Preserve an already-valid or non-JSON editorial field unchanged.
  }
  return value;
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT id, candidates, key_issues, polling_data FROM world_elections');
let changed = 0;

for (const row of rows) {
  const candidates = normalizeJsonText(row.candidates);
  const keyIssues = normalizeJsonText(row.key_issues);
  const pollingData = normalizeJsonText(row.polling_data);
  if (candidates === row.candidates && keyIssues === row.key_issues && pollingData === row.polling_data) continue;
  await connection.execute(
    'UPDATE world_elections SET candidates = ?, key_issues = ?, polling_data = ?, updated_at = NOW() WHERE id = ?',
    [candidates, keyIssues, pollingData, row.id],
  );
  changed += 1;
}

await connection.end();
console.log(`Normalized structured detail JSON for ${changed} World Elections records.`);

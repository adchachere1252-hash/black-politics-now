import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("No DATABASE_URL"); process.exit(1); }

// State code mapping
const stateCodes = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
  "Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
  "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS",
  "Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA",
  "Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT",
  "Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM",
  "New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK",
  "Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
  "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT",
  "Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"
};

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  // Import CBC members
  const cbcData = JSON.parse(fs.readFileSync("/home/ubuntu/cbc_members.json", "utf8"));
  let inserted = 0;
  for (const m of cbcData) {
    const stateCode = m.district.split("-")[0];
    try {
      await conn.execute(
        `INSERT INTO cbc_members (district, member, party, state, state_code, chamber, cbc_status, up_in_2026) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE member=VALUES(member), party=VALUES(party), cbc_status=VALUES(cbc_status)`,
        [m.district, m.member, m.party, m.state, stateCode, m.chamber, m.status, m.upIn2026 !== false ? 1 : 0]
      );
      inserted++;
    } catch (e) {
      console.error(`Failed: ${m.district} ${m.member}:`, e.message);
    }
  }
  console.log(`CBC members imported: ${inserted}`);

  // Import redistricting data
  try {
    const redistData = JSON.parse(fs.readFileSync("/home/ubuntu/seed-data/redistricting.json", "utf8"));
    if (redistData?.result?.data) {
      const rows = redistData.result.data;
      let rInserted = 0;
      for (const r of rows) {
        await conn.execute(
          `INSERT INTO redistricting_states (state_code, state_name, enacted, reason, status, method, delegation_before, projected_impact, litigation_notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE enacted=VALUES(enacted), status=VALUES(status)`,
          [r.stateCode, r.stateName, r.enacted ? 1 : 0, r.reason || null, r.status || null, r.method || null, r.delegationBefore || null, r.projectedImpact || null, r.litigationNotes || null]
        );
        rInserted++;
      }
      console.log(`Redistricting states imported: ${rInserted}`);
    }
  } catch (e) {
    console.log(`Redistricting import skipped: ${e.message}`);
  }

  // Import world elections data
  try {
    const worldData = JSON.parse(fs.readFileSync("/home/ubuntu/seed-data/world_elections.json", "utf8"));
    if (worldData?.result?.data) {
      const rows = worldData.result.data;
      let wInserted = 0;
      for (const w of rows) {
        await conn.execute(
          `INSERT INTO world_elections (country, country_code, election_type, election_name, election_date, end_date, world_election_status, is_date_confirmed, is_snap, incumbent, incumbent_party, system_type, term_length, candidates, polling_data, key_issues, winner, winner_party, total_votes, turnout_pct, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE world_election_status=VALUES(world_election_status)`,
          [w.country, w.countryCode, w.electionType, w.electionName, w.electionDate, w.endDate || null, w.status || "Upcoming", w.isDateConfirmed ? 1 : 0, w.isSnap ? 1 : 0, w.incumbent || null, w.incumbentParty || null, w.systemType || null, w.termLength || null, w.candidates ? JSON.stringify(w.candidates) : null, w.pollingData ? JSON.stringify(w.pollingData) : null, w.keyIssues ? JSON.stringify(w.keyIssues) : null, w.winner || null, w.winnerParty || null, w.totalVotes || null, w.turnoutPct || null, w.notes || null]
        );
        wInserted++;
      }
      console.log(`World elections imported: ${wInserted}`);
    }
  } catch (e) {
    console.log(`World elections import skipped: ${e.message}`);
  }

  await conn.end();
  console.log("Done!");
}

main().catch(e => { console.error(e); process.exit(1); });

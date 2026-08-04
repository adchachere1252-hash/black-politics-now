// One-time seed script: imports live production data pulled from the two
// existing sites (election-map-2026 and daily-podcast) into the unified DB.
// Run: node seed-import.mjs
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import fs from "fs";
import "dotenv/config";

const DATA_DIR = "/home/ubuntu/seed-data";

function load(name) {
  const raw = JSON.parse(fs.readFileSync(`${DATA_DIR}/${name}.json`, "utf8"));
  return raw.result.data.json;
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);

async function batchInsert(table, rows, mapper) {
  if (!rows.length) return 0;
  let count = 0;
  for (const row of rows) {
    const obj = mapper(row);
    const keys = Object.keys(obj);
    const placeholders = keys.map(() => "?").join(",");
    const sql = `INSERT INTO \`${table}\` (${keys.map(k => `\`${k}\``).join(",")}) VALUES (${placeholders})`;
    try {
      await conn.execute(sql, keys.map(k => obj[k] === undefined ? null : obj[k]));
      count++;
    } catch (e) {
      console.error(`  ! ${table} row failed:`, e.message.slice(0, 120));
    }
  }
  return count;
}

const num = v => (v === null || v === undefined || v === "" ? null : Number(v));
const str = v => (v === null || v === undefined ? null : String(v));
const bool = v => (v ? 1 : 0);

// ─── Senate ───────────────────────────────────────────────────────────────────
const senate = load("senate");
console.log(`Seeding ${senate.length} senate races...`);
let n = await batchInsert("senate_races", senate, r => ({
  state_code: r.stateCode, state_name: r.stateName,
  is_special: bool(r.isSpecial), special_note: str(r.specialNote),
  incumbent: str(r.incumbent), incumbent_party: str(r.incumbentParty),
  incumbent_retiring: bool(r.incumbentRetiring),
  candidate1_name: str(r.candidate1Name), candidate1_party: str(r.candidate1Party),
  candidate1_votes: num(r.candidate1Votes) ?? 0, candidate1_vote_pct: str(r.candidate1VotePct),
  candidate2_name: str(r.candidate2Name), candidate2_party: str(r.candidate2Party),
  candidate2_votes: num(r.candidate2Votes) ?? 0, candidate2_vote_pct: str(r.candidate2VotePct),
  called_winner: str(r.calledWinner), called_party: str(r.calledParty), called_at: num(r.calledAt),
  primary_winner: str(r.primaryWinner), primary_party: str(r.primaryParty),
  other_candidate_name: str(r.otherCandidateName), other_candidate_party: str(r.otherCandidateParty),
  other_votes: num(r.otherVotes) ?? 0, other_vote_pct: str(r.otherVotePct),
  previous_party: str(r.previousParty), rating: str(r.rating), status: str(r.status) || "Scheduled",
  primary_date: str(r.primaryDate), primary_runoff_date: str(r.primaryRunoffDate),
  general_date: str(r.generalDate), pct_reporting: str(r.pctReporting) || "0",
  candidate1_bio: str(r.candidate1Bio), candidate2_bio: str(r.candidate2Bio),
  candidate1_photo: str(r.candidate1Photo), candidate2_photo: str(r.candidate2Photo),
  notes: str(r.notes),
}));
console.log(`  -> ${n} inserted`);

// ─── House ────────────────────────────────────────────────────────────────────
const house = load("house");
console.log(`Seeding ${house.length} house races...`);
n = await batchInsert("house_races", house, r => ({
  state_code: r.stateCode, state_name: r.stateName,
  district: num(r.district) ?? 0, district_label: str(r.districtLabel) || "AL",
  incumbent: str(r.incumbent), incumbent_party: str(r.incumbentParty),
  incumbent_retiring: bool(r.incumbentRetiring), is_vacancy: bool(r.isVacancy),
  candidate1_name: str(r.candidate1Name), candidate1_party: str(r.candidate1Party),
  candidate1_votes: num(r.candidate1Votes) ?? 0, candidate1_vote_pct: str(r.candidate1VotePct),
  candidate2_name: str(r.candidate2Name), candidate2_party: str(r.candidate2Party),
  candidate2_votes: num(r.candidate2Votes) ?? 0, candidate2_vote_pct: str(r.candidate2VotePct),
  called_winner: str(r.calledWinner), called_party: str(r.calledParty), called_at: num(r.calledAt),
  primary_winner: str(r.primaryWinner), primary_party: str(r.primaryParty),
  other_candidate_name: str(r.otherCandidateName), other_candidate_party: str(r.otherCandidateParty),
  other_votes: num(r.otherVotes) ?? 0, other_vote_pct: str(r.otherVotePct),
  previous_party: str(r.previousParty), rating: str(r.rating), status: str(r.status) || "Scheduled",
  primary_date: str(r.primaryDate), general_date: str(r.generalDate),
  pct_reporting: str(r.pctReporting) || "0",
  candidate1_bio: str(r.candidate1Bio), candidate2_bio: str(r.candidate2Bio),
  candidate1_photo: str(r.candidate1Photo), candidate2_photo: str(r.candidate2Photo),
  notes: str(r.notes),
}));
console.log(`  -> ${n} inserted`);

// ─── Governors ────────────────────────────────────────────────────────────────
const gov = load("governor");
console.log(`Seeding ${gov.length} governor races...`);
n = await batchInsert("governor_races", gov, r => ({
  state_code: r.stateCode, state_name: r.stateName,
  incumbent_name: str(r.incumbentName), incumbent_party: str(r.incumbentParty),
  is_open: bool(r.isOpen), is_term_limited: bool(r.isTermLimited),
  previous_party: str(r.previousParty) || "R", rating: str(r.rating) || "Solid R",
  primary_date: str(r.primaryDate), runoff_date: str(r.runoffDate),
  general_date: str(r.generalDate) || "November 3, 2026", is_special: bool(r.isSpecial),
  status: str(r.status) || "Scheduled",
  called_party: str(r.calledParty), called_winner: str(r.calledWinner), called_at: num(r.calledAt),
  primary_winner: str(r.primaryWinner), primary_party: str(r.primaryParty),
  dem_votes: num(r.demVotes) ?? 0, rep_votes: num(r.repVotes) ?? 0,
  other_candidate_name: str(r.otherCandidateName), other_candidate_party: str(r.otherCandidateParty),
  other_votes: num(r.otherVotes) ?? 0, other_vote_pct: str(r.otherVotePct),
  pct_reporting: str(r.pctReporting) || "0",
  dem_candidate: str(r.demCandidate), rep_candidate: str(r.repCandidate),
  dem_previous_office: str(r.demPreviousOffice), rep_previous_office: str(r.repPreviousOffice),
  dem_bio: str(r.demBio), rep_bio: str(r.repBio),
  dem_photo: str(r.demPhoto), rep_photo: str(r.repPhoto),
  notes: str(r.notes),
}));
console.log(`  -> ${n} inserted`);

// ─── Referendums ──────────────────────────────────────────────────────────────
const refs = load("referendums");
console.log(`Seeding ${refs.length} referendums...`);
n = await batchInsert("referendums", refs, r => ({
  state_code: (r.stateCode || "XX").slice(0, 2), state_name: r.stateName || r.country || "Unknown",
  name: r.name, description: str(r.description), category: str(r.category),
  measure_type: str(r.measureType), measure_type_full: str(r.measureTypeFull),
  scope: str(r.scope) || "state", country: str(r.country) || "United States",
  country_code: (str(r.countryCode) || "US").slice(0, 3),
  yes_label: str(r.yesLabel) || "Yes", no_label: str(r.noLabel) || "No",
  yes_votes: num(r.yesVotes) ?? 0, no_votes: num(r.noVotes) ?? 0,
  pct_reporting: str(r.pctReporting) || "0", election_date: str(r.electionDate) || "2026",
  status: str(r.status) || "Scheduled", called_result: str(r.calledResult),
  notes: str(r.notes),
}));
console.log(`  -> ${n} inserted`);

// ─── Episodes + Segments ──────────────────────────────────────────────────────
const episodes = load("episodes");
console.log(`Seeding ${episodes.length} podcast episodes...`);
let epCount = 0, segCount = 0;
for (const ep of episodes) {
  try {
    await conn.execute(
      `INSERT INTO episodes (date, day, friendlyDate, totalDurationSec, totalDurationLabel, segmentCount, fullEpisodeCdnUrl, verificationStatus, verificationWarnings)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [
        ep.date, str(ep.day), null, num(ep.totalDurationSec), str(ep.totalDurationLabel),
        num(ep.segmentCount), str(ep.fullEpisodeCdnUrl),
        ["passed", "warnings", "pending"].includes(ep.verificationStatus) ? ep.verificationStatus : "pending",
        ep.verificationWarnings ? JSON.stringify(ep.verificationWarnings) : null,
      ]
    );
    epCount++;
    let order = 0;
    for (const seg of ep.segments || []) {
      try {
        await conn.execute(
          `INSERT INTO episode_segments (episodeDate, segmentKey, label, emoji, durationSec, durationLabel, andrewCdnUrl, jennyCdnUrl, sortOrder, isBreaking, breakingReason)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
          [
            ep.date, seg.key, str(seg.label), str(seg.emoji), num(seg.durationSec),
            str(seg.durationLabel), str(seg.audioPath), str(seg.jennyAudioPath),
            order++, seg.isBreaking ? 1 : 0, str(seg.breakingReason)?.slice(0, 250) ?? null,
          ]
        );
        segCount++;
      } catch (e) {
        console.error(`  ! segment failed (${ep.date}/${seg.key}):`, e.message.slice(0, 100));
      }
    }
  } catch (e) {
    console.error(`  ! episode ${ep.date} failed:`, e.message.slice(0, 100));
  }
}
console.log(`  -> ${epCount} episodes, ${segCount} segments inserted`);

await conn.end();
console.log("Seed complete.");

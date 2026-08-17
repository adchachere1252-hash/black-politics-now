import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const auditStart = "2026-07-28";
const outputPath = path.resolve("reports/post-july-daily-brief-audit-input.json");

const allowedTopicKeys = [
  "00_greeting",
  "00_weekend_brief",
  "00_week_in_review",
  "01_ai_trends",
  "02_american_political_briefs",
  "03_meta_news",
  "04_ai_legal_briefs",
  "05_global_economy_briefs",
  "06_global_ai_updates",
  "07_global_political_briefs",
  "08_eu_ai_act_updates",
  "09_health_ai_briefs",
  "10_australian_online_safety",
  "11_dsa_briefs",
  "12_space_exploration",
  "13_natural_disasters",
  "13_closing",
];

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to export the Daily Brief audit input.");
}

const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const [episodes] = await db.execute(
    `SELECT \`date\`, day, verificationStatus, fullEpisodeCdnUrl, jennyFullEpisodeCdnUrl,
            segmentCount, totalDurationSec, totalDurationLabel
       FROM episodes
      WHERE \`date\` >= ?
      ORDER BY \`date\` ASC`,
    [auditStart],
  );
  const [segments] = await db.execute(
    `SELECT episodeDate, segmentKey, label, sourceLinks, durationSec, durationLabel,
            andrewCdnUrl, jennyCdnUrl, script, sortOrder, isBreaking, breakingReason, sourceVerifiedAt
       FROM episode_segments
      WHERE episodeDate >= ?
      ORDER BY episodeDate ASC, sortOrder ASC, id ASC`,
    [auditStart],
  );

  const byDate = new Map();
  for (const episode of episodes) {
    byDate.set(episode.date, { ...episode, segments: [] });
  }
  for (const segment of segments) {
    const episode = byDate.get(segment.episodeDate);
    if (!episode) continue;
    let sources = [];
    try {
      sources = typeof segment.sourceLinks === "string" ? JSON.parse(segment.sourceLinks) : segment.sourceLinks ?? [];
    } catch {
      sources = [];
    }
    episode.segments.push({ ...segment, sources });
    delete episode.segments.at(-1).sourceLinks;
  }

  const payload = {
    audit_start: auditStart,
    generated_at: new Date().toISOString(),
    original_repository_topic_contract: {
      allowed_topic_keys: allowedTopicKeys,
      flow_contract: "Opening greeting first; 13 or more sourced editorial segments; closing last; Monday may include a Weekend Brief; Friday may include a Week in Review.",
      source_contract: "Each editorial segment must retain source provenance; original repository source tiers require authoritative sources and prohibit unverified/social/partisan sources.",
    },
    episodes: [...byDate.values()],
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${payload.episodes.length} Daily Brief audit records to ${outputPath}`);
} finally {
  await db.end();
}

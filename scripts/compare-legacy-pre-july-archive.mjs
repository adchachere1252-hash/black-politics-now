import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const sourcePath = "/home/ubuntu/daily-podcast/client/src/lib/podcastData.ts";
const outputPath = path.resolve("reports/pre-july-daily-brief-preservation-check.json");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to compare the preserved Daily Brief archive.");
}

const source = await fs.readFile(sourcePath, "utf8");
const staticSection = source.slice(source.indexOf("export const STATIC_EPISODES"));
const dates = [...staticSection.matchAll(/date: "(2026-[0-9]{2}-[0-9]{2})"/g)].map((match) => match[1]);
const uniqueDates = [...new Set(dates)].filter((date) => date < "2026-07-28");

const blocks = uniqueDates.map((date) => {
  const start = staticSection.indexOf(`date: "${date}"`);
  const next = staticSection.indexOf("\n  {", start + 1);
  const block = staticSection.slice(start, next === -1 ? undefined : next);
  const pick = (pattern) => block.match(pattern)?.[1] ?? null;
  return {
    date,
    day: pick(/day: "([^"]+)"/),
    fullEpisodeCdnUrl: pick(/fullEpisodeCdnUrl: "([^"]+)"/),
    segmentCount: Number(pick(/segmentCount: ([0-9]+)/)),
    totalDurationLabel: pick(/totalDurationLabel: "([^"]+)"/),
  };
});

const db = await mysql.createConnection(process.env.DATABASE_URL);
try {
  const placeholders = blocks.map(() => "?").join(", ");
  const [rows] = await db.execute(
    `SELECT \`date\`, day, fullEpisodeCdnUrl, segmentCount, totalDurationLabel
       FROM episodes
      WHERE \`date\` IN (${placeholders})`,
    blocks.map((block) => block.date),
  );
  const rowsByDate = new Map(rows.map((row) => [row.date, row]));
  const comparisons = blocks.map((legacy) => {
    const current = rowsByDate.get(legacy.date);
    return {
      date: legacy.date,
      legacy,
      current: current ?? null,
      matches: Boolean(current)
        && current.day === legacy.day
        && current.fullEpisodeCdnUrl === legacy.fullEpisodeCdnUrl
        && Number(current.segmentCount) === legacy.segmentCount
        && current.totalDurationLabel === legacy.totalDurationLabel,
    };
  });
  const report = {
    generated_at: new Date().toISOString(),
    original_static_dates: uniqueDates,
    compared_records: comparisons,
    all_original_records_preserved: comparisons.length === uniqueDates.length && comparisons.every((comparison) => comparison.matches),
  };
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await db.end();
}

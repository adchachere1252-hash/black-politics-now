import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { episodeSegments } from "../drizzle/schema";

type SourceLink = { title: string; source: string; url: string };

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const segments = await db.select().from(episodeSegments).where(eq(episodeSegments.segmentKey, "03_meta_news"));
  let updated = 0;
  for (const segment of segments) {
    const found = Array.from((segment.script ?? "").matchAll(/\[REF:([^|\]]+)\|([^\]]+)\]/g));
    const sources: SourceLink[] = [];
    const seen = new Set<string>();
    for (const match of found) {
      const source = match[1]?.trim();
      const url = match[2]?.trim();
      if (!source || !url || !/^https:\/\//.test(url) || seen.has(url)) continue;
      seen.add(url);
      sources.push({ title: `${source} reporting`, source, url });
      if (sources.length === 6) break;
    }
    if (!sources.length) continue;
    await db.update(episodeSegments).set({ sourceLinks: JSON.stringify(sources), sourceVerifiedAt: new Date() }).where(eq(episodeSegments.id, segment.id));
    updated += 1;
  }
  console.log(JSON.stringify({ updated, examined: segments.length }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

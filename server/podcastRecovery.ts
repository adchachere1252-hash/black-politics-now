import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { podcastRecoveryRequests } from "../drizzle/schema";

const ACTIVE_RECOVERY_STATUSES = ["queued", "running"] as const;

export async function getPodcastRecoveryRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(podcastRecoveryRequests).orderBy(desc(podcastRecoveryRequests.requestedAt)).limit(12);
}

export async function queuePodcastRecoveryRequest(input: { episodeDate: string; requestedBy: string; note?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const existing = await db.select().from(podcastRecoveryRequests)
    .where(and(eq(podcastRecoveryRequests.episodeDate, input.episodeDate), inArray(podcastRecoveryRequests.status, [...ACTIVE_RECOVERY_STATUSES])))
    .orderBy(desc(podcastRecoveryRequests.requestedAt)).limit(1);
  if (existing[0]) return { request: existing[0], reused: true };
  await db.insert(podcastRecoveryRequests).values({
    episodeDate: input.episodeDate,
    requestedBy: input.requestedBy,
    note: input.note?.trim() || "Admin requested a safe dual-full-episode audio repair.",
  });
  const created = await db.select().from(podcastRecoveryRequests).where(eq(podcastRecoveryRequests.episodeDate, input.episodeDate)).orderBy(desc(podcastRecoveryRequests.requestedAt)).limit(1);
  return { request: created[0], reused: false };
}

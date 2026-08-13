import { createHash } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { agentRecommendations, agentRuns, worldElectionWatches, worldElections } from "../drizzle/schema";
import { getDb } from "./db";

export const COOK_ISLANDS_WATCH_SOURCES = [
  "https://stats.gov.ck/parliamentary-general-election-2026-public-notice-no-15/",
  "https://www.cookislandsnews.com/internal/election-2026/bad-weather-delays-voting-in-nassau-as-nation-heads-to-polls/",
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function captureSource(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "follow", headers: { "User-Agent": "BlackPoliticsNow-VerifiedWatch/1.0" } });
    const html = await response.text();
    return { url, status: response.status, text: stripHtml(html).slice(0, 5000) };
  } catch (error) {
    return { url, status: 0, text: `Fetch error: ${error instanceof Error ? error.message : "unknown"}` };
  } finally {
    clearTimeout(timer);
  }
}

export async function getCookIslandsWatch() {
  const db = await getDb();
  if (!db) return null;
  const [watch] = await db.select().from(worldElectionWatches)
    .innerJoin(worldElections, eq(worldElectionWatches.worldElectionId, worldElections.id))
    .where(eq(worldElections.countryCode, "COK"))
    .orderBy(desc(worldElectionWatches.id))
    .limit(1);
  return watch ?? null;
}

/**
 * Idempotent source monitor. It records a changed source snapshot as a high-priority
 * Agent Desk recommendation but deliberately never updates the public election row.
 */
export async function runCookIslandsVerifiedWatch(taskUid: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const joined = await getCookIslandsWatch();
  if (!joined) return { ok: true, skipped: "watch-not-configured" };
  const watch = joined.world_election_watches;
  const election = joined.world_elections;
  if (!watch.enabled || watch.scheduleCronTaskUid !== taskUid) return { ok: true, skipped: "watch-disabled-or-task-mismatch" };

  const captured = await Promise.all(COOK_ISLANDS_WATCH_SOURCES.map(captureSource));
  const snapshot = JSON.stringify({ checkedAt: new Date().toISOString(), election: election.electionName, sources: captured });
  const fingerprint = createHash("sha256").update(captured.map((item) => `${item.url}|${item.status}|${item.text}`).join("\n")).digest("hex");
  const now = new Date();

  if (!watch.lastFingerprint) {
    await db.update(worldElectionWatches).set({ lastCheckedAt: now, lastFingerprint: fingerprint, lastSourceSnapshot: snapshot }).where(eq(worldElectionWatches.id, watch.id));
    return { ok: true, baseline: true };
  }

  if (watch.lastFingerprint === fingerprint) {
    await db.update(worldElectionWatches).set({ lastCheckedAt: now, lastSourceSnapshot: snapshot }).where(eq(worldElectionWatches.id, watch.id));
    return { ok: true, changed: false };
  }

  await db.insert(agentRuns).values({
    trigger: "scheduled",
    mode: "routine",
    status: "success",
    model: "verified-source-watch",
    sourceSnapshot: snapshot,
    summary: "Cook Islands source watch detected a change; editorial review is required before any public result update.",
    recommendationCount: 1,
    completedAt: now,
  });
  const [run] = await db.select().from(agentRuns).orderBy(desc(agentRuns.id)).limit(1);
  if (!run) throw new Error("Unable to create watch run");
  await db.insert(agentRecommendations).values({
    runId: run.id,
    category: "source_watch",
    priority: "high",
    title: "Review Cook Islands election source change",
    summary: "The verified source watch detected changed reporting for the Cook Islands general election. No public calendar record has been changed.",
    proposedAction: "Open the linked source evidence, confirm whether a final or preliminary result is authoritative, then manually update the World Elections record if warranted.",
    evidence: JSON.stringify(captured),
    assignedTo: "Data Desk",
    assignedBy: "Cook Islands Verified Watch",
    assignedAt: now,
  });
  const [recommendation] = await db.select().from(agentRecommendations).orderBy(desc(agentRecommendations.id)).limit(1);
  await db.update(worldElectionWatches).set({
    lastCheckedAt: now,
    lastFingerprint: fingerprint,
    lastSourceSnapshot: snapshot,
    lastReviewRecommendationId: recommendation?.id ?? null,
    lastDetectedAt: now,
  }).where(eq(worldElectionWatches.id, watch.id));
  return { ok: true, changed: true, recommendationId: recommendation?.id ?? null };
}

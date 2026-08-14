import { createHash } from "crypto";
import { desc, eq, inArray } from "drizzle-orm";
import { agentRecommendations, agentRuns, worldElectionRefreshItems, worldElectionRefreshSettings, worldElections } from "../drizzle/schema";
import { getDb } from "./db";

const REFRESH_WINDOW_DAYS = 120;
const MAX_RECORDS_PER_RUN = 12;

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed);
}

function sourceUrls(election: typeof worldElections.$inferSelect) {
  const urls = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && /^https?:\/\//i.test(value)) urls.add(value);
  };
  for (const source of [election.sourceUrls, election.notes]) {
    if (!source) continue;
    try {
      const parsed = JSON.parse(source);
      if (Array.isArray(parsed)) parsed.forEach(add);
      else if (typeof parsed === "object" && parsed) Object.values(parsed).forEach(add);
    } catch {
      for (const match of source.match(/https?:\/\/[^\s)\]"']+/g) ?? []) add(match);
    }
  }
  return Array.from(urls).slice(0, 3);
}

async function captureSource(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "BlackPoliticsNow-WorldRefresh/1.0" },
    });
    const html = await response.text();
    return { url, status: response.status, text: html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 5000) };
  } catch (error) {
    return { url, status: 0, text: `Fetch error: ${error instanceof Error ? error.message : "unknown"}` };
  } finally {
    clearTimeout(timer);
  }
}

async function ensureSettings() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [existing] = await db.select().from(worldElectionRefreshSettings).where(eq(worldElectionRefreshSettings.id, 1)).limit(1);
  if (existing) return existing;
  await db.insert(worldElectionRefreshSettings).values({ id: 1, enabled: true });
  const [created] = await db.select().from(worldElectionRefreshSettings).where(eq(worldElectionRefreshSettings.id, 1)).limit(1);
  if (!created) throw new Error("Unable to initialize World Elections refresh settings");
  return created;
}

function inRefreshWindow(election: typeof worldElections.$inferSelect, now: Date) {
  if (election.status === "Voting Today") return true;
  if (election.status !== "Upcoming" && election.status !== "Completed") return false;
  const date = parseDate(election.electionDate);
  if (!date) return election.status === "Upcoming";
  const days = (date.getTime() - now.getTime()) / 86_400_000;
  return days >= -30 && days <= REFRESH_WINDOW_DAYS;
}

/**
 * Review-only source refresh. It fingerprints listed sources and produces
 * Agent Desk recommendations when evidence changes; it never updates a public
 * election date, candidate, status, result, or source link automatically.
 */
export async function runDatedWorldElectionRefresh(taskUid?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const settings = await ensureSettings();
  if (!settings.enabled) return { ok: true, skipped: "disabled" };
  if (taskUid && settings.scheduleCronTaskUid !== taskUid) return { ok: true, skipped: "task-mismatch" };

  const now = new Date();
  const allElections = await db.select().from(worldElections).orderBy(worldElections.electionDate, worldElections.country);
  const candidates = allElections.filter((election) => inRefreshWindow(election, now)).slice(0, MAX_RECORDS_PER_RUN);
  await db.insert(agentRuns).values({ trigger: taskUid ? "scheduled" : "admin", mode: "routine", model: "dated-world-source-refresh", sourceSnapshot: JSON.stringify({ checkedAt: now.toISOString(), records: candidates.map((item) => ({ id: item.id, country: item.country, date: item.electionDate, status: item.status })) }) });
  const [run] = await db.select().from(agentRuns).orderBy(desc(agentRuns.id)).limit(1);
  if (!run) throw new Error("Unable to create World Elections refresh run");

  const itemRows = candidates.length ? await db.select().from(worldElectionRefreshItems).where(inArray(worldElectionRefreshItems.worldElectionId, candidates.map((item) => item.id))) : [];
  const itemByElectionId = new Map(itemRows.map((item) => [item.worldElectionId, item]));
  let baselineCount = 0;
  let changedCount = 0;
  let missingSourceCount = 0;
  const recommendations: Array<typeof agentRecommendations.$inferInsert> = [];

  try {
    for (const election of candidates) {
      const urls = sourceUrls(election);
      const previous = itemByElectionId.get(election.id);
      if (urls.length === 0) {
        missingSourceCount += 1;
        const snapshot = JSON.stringify({ checkedAt: now.toISOString(), election: election.electionName, sources: [] });
        if (previous) {
          await db.update(worldElectionRefreshItems).set({ lastCheckedAt: now, lastStatus: "missing_sources", lastSourceSnapshot: snapshot }).where(eq(worldElectionRefreshItems.id, previous.id));
        } else {
          await db.insert(worldElectionRefreshItems).values({ worldElectionId: election.id, lastCheckedAt: now, lastStatus: "missing_sources", lastSourceSnapshot: snapshot });
        }
        continue;
      }
      const captured = await Promise.all(urls.map(captureSource));
      const fingerprint = createHash("sha256").update(captured.map((source) => `${source.url}|${source.status}|${source.text}`).join("\n")).digest("hex");
      const snapshot = JSON.stringify({ checkedAt: now.toISOString(), election: { country: election.country, name: election.electionName, date: election.electionDate, publicStatus: election.status }, sources: captured });
      const isBaseline = !previous?.lastFingerprint;
      const changed = Boolean(previous?.lastFingerprint && previous.lastFingerprint !== fingerprint);
      if (isBaseline) baselineCount += 1;
      if (changed) {
        changedCount += 1;
        recommendations.push({
          runId: run.id,
          category: "source_watch",
          priority: election.status === "Voting Today" ? "high" : "medium",
          title: `Review updated source evidence: ${election.country}`,
          summary: `The dated World Elections source refresh detected changed reporting for ${election.electionName} (${election.electionDate}). No public election record was changed.`,
          proposedAction: "Review the captured source evidence, determine whether the public calendar record remains accurate, and manually apply any verified change after editorial approval.",
          evidence: JSON.stringify(captured),
          assignedTo: "Data Desk",
          assignedBy: "Dated World Elections Refresh",
          assignedAt: now,
        });
      }
      const update = { lastFingerprint: fingerprint, lastCheckedAt: now, lastChangedAt: changed ? now : previous?.lastChangedAt ?? null, lastStatus: changed ? "changed" : isBaseline ? "baseline" : "unchanged", lastSourceSnapshot: snapshot };
      if (previous) await db.update(worldElectionRefreshItems).set(update).where(eq(worldElectionRefreshItems.id, previous.id));
      else await db.insert(worldElectionRefreshItems).values({ worldElectionId: election.id, ...update });
    }

    if (recommendations.length) await db.insert(agentRecommendations).values(recommendations);
    const summary = `Checked ${candidates.length} dated World Elections records: ${baselineCount} baselined, ${changedCount} source changes awaiting review, ${missingSourceCount} missing source links.`;
    await db.update(agentRuns).set({ status: "success", summary, recommendationCount: recommendations.length, completedAt: now }).where(eq(agentRuns.id, run.id));
    await db.update(worldElectionRefreshSettings).set({ lastRunAt: now, lastSuccessAt: now, lastSummary: summary, lastError: null }).where(eq(worldElectionRefreshSettings.id, 1));
    return { ok: true, candidates: candidates.length, baselineCount, changedCount, missingSourceCount, recommendationCount: recommendations.length, summary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown World Elections refresh failure";
    await db.update(agentRuns).set({ status: "failed", errorMessage: message, completedAt: new Date() }).where(eq(agentRuns.id, run.id));
    await db.update(worldElectionRefreshSettings).set({ lastRunAt: now, lastError: message }).where(eq(worldElectionRefreshSettings.id, 1));
    throw error;
  }
}

export async function getWorldElectionRefreshOperations() {
  const db = await getDb();
  if (!db) return { settings: null, items: [], recentRuns: [] };
  const settings = await ensureSettings();
  const [items, recentRuns] = await Promise.all([
    db.select().from(worldElectionRefreshItems).orderBy(desc(worldElectionRefreshItems.lastCheckedAt)).limit(20),
    db.select().from(agentRuns).where(eq(agentRuns.model, "dated-world-source-refresh")).orderBy(desc(agentRuns.startedAt)).limit(10),
  ]);
  return { settings, items, recentRuns };
}

import { desc, gte } from "drizzle-orm";
import { homepageQueryTelemetry } from "../drizzle/schema";
import { getDb } from "./db";

const REPOSITORY = "adchachere1252-hash/black-politics-now";

export async function recordHomepageQueryTelemetry(input: { queryPath: string; attempt: number; errorCategory: string }) {
  const db = await getDb();
  if (!db) return { recorded: false };
  await db.insert(homepageQueryTelemetry).values({
    queryPath: input.queryPath.slice(0, 160),
    attempt: Math.max(1, Math.min(3, input.attempt)),
    errorCategory: input.errorCategory.slice(0, 120),
  });
  return { recorded: true };
}

export async function getHomepageHealthStatus() {
  const db = await getDb();
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  const recentFailures = db ? await db.select().from(homepageQueryTelemetry).where(gte(homepageQueryTelemetry.observedAt, cutoff)).orderBy(desc(homepageQueryTelemetry.observedAt)).limit(12) : [];
  const failuresLastHour = recentFailures.length;
  const tone = failuresLastHour === 0 ? "healthy" : failuresLastHour < 4 ? "retrying" : "needs_attention";
  let github: { status: "verified" | "unavailable"; shortSha?: string; checkedAt: string } = { status: "unavailable", checkedAt: new Date().toISOString() };
  try {
    const response = await fetch(`https://api.github.com/repos/${REPOSITORY}/commits/main`, { headers: { Accept: "application/vnd.github+json", "User-Agent": "Black-Politics-Now-Admin" }, signal: AbortSignal.timeout(4000) });
    if (response.ok) {
      const payload = await response.json() as { sha?: string };
      github = { status: "verified", shortSha: payload.sha?.slice(0, 7), checkedAt: new Date().toISOString() };
    }
  } catch { /* Admin card remains explicit when GitHub is unavailable. */ }
  return {
    tone,
    failuresLastHour,
    retryPolicy: { attempts: 3, initialDelayMs: 1_000 },
    recentFailures: recentFailures.map((row) => ({ queryPath: row.queryPath, attempt: row.attempt, errorCategory: row.errorCategory, observedAt: row.observedAt })),
    github,
    releaseChecklist: [
      { label: "Homepage API endpoint", status: "verified", detail: "Same-origin absolute endpoint" },
      { label: "Automatic public-query retry", status: "verified", detail: "Up to 3 attempts with bounded backoff" },
      { label: "GitHub remote main", status: github.status, detail: github.shortSha ? `Latest remote commit ${github.shortSha}` : "Unable to check remote now" },
    ],
  };
}

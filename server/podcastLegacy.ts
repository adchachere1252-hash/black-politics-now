import { createHash } from "crypto";
import { desc, eq, gte, sql } from "drizzle-orm";
import { episodeSegments, episodes, podcastPlayEvents, podcastShowNotes } from "../drizzle/schema";
import { getDb } from "./db";

const asNumber = (value: unknown) => Number(value ?? 0);

function startOfWindow(days: number) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() - (days - 1));
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

export const hashPodcastSession = (sessionToken: string) => createHash("sha256").update(sessionToken).digest("hex");

export async function recordPodcastPlay(input: {
  episodeDate: string;
  segmentKey?: string | null;
  segmentLabel?: string | null;
  playbackKind: "episode" | "segment";
  voice: "andrew" | "jenny";
  sessionToken: string;
}) {
  const db = await getDb();
  if (!db) return { recorded: false } as const;
  await db.insert(podcastPlayEvents).values({
    episodeDate: input.episodeDate,
    segmentKey: input.segmentKey || null,
    segmentLabel: input.segmentLabel || null,
    playbackKind: input.playbackKind,
    voice: input.voice,
    sessionHash: hashPodcastSession(input.sessionToken),
  });
  return { recorded: true } as const;
}

export async function getPodcastAnalytics(days = 30) {
  const db = await getDb();
  const empty = { days, totalPlays: 0, uniqueSessions: 0, fullEpisodePlays: 0, segmentPlays: 0, dailyTrend: [] as Array<{ day: string; plays: number }>, topEpisodes: [] as Array<{ episodeDate: string; plays: number }>, topSegments: [] as Array<{ segmentKey: string; segmentLabel: string; plays: number }> };
  if (!db) return empty;
  const since = startOfWindow(days);
  const plays = sql<number>`count(*)`;
  const sessions = sql<number>`count(distinct ${podcastPlayEvents.sessionHash})`;
  const day = sql<string>`DATE(played_at)`;
  const [totals, kindRows, dailyTrend, topEpisodes, topSegments] = await Promise.all([
    db.select({ plays, sessions }).from(podcastPlayEvents).where(gte(podcastPlayEvents.playedAt, since)),
    db.select({ playbackKind: podcastPlayEvents.playbackKind, plays }).from(podcastPlayEvents).where(gte(podcastPlayEvents.playedAt, since)).groupBy(podcastPlayEvents.playbackKind),
    db.select({ day, plays }).from(podcastPlayEvents).where(gte(podcastPlayEvents.playedAt, since)).groupBy(day).orderBy(day),
    db.select({ episodeDate: podcastPlayEvents.episodeDate, plays }).from(podcastPlayEvents).where(gte(podcastPlayEvents.playedAt, since)).groupBy(podcastPlayEvents.episodeDate).orderBy(desc(plays)).limit(8),
    db.select({ segmentKey: podcastPlayEvents.segmentKey, segmentLabel: podcastPlayEvents.segmentLabel, plays }).from(podcastPlayEvents).where(gte(podcastPlayEvents.playedAt, since)).groupBy(podcastPlayEvents.segmentKey, podcastPlayEvents.segmentLabel).orderBy(desc(plays)).limit(8),
  ]);
  const byKind = new Map(kindRows.map((row) => [row.playbackKind, asNumber(row.plays)]));
  return {
    days,
    totalPlays: asNumber(totals[0]?.plays),
    uniqueSessions: asNumber(totals[0]?.sessions),
    fullEpisodePlays: byKind.get("episode") ?? 0,
    segmentPlays: byKind.get("segment") ?? 0,
    dailyTrend: dailyTrend.map((row) => ({ day: String(row.day), plays: asNumber(row.plays) })),
    topEpisodes: topEpisodes.map((row) => ({ episodeDate: row.episodeDate, plays: asNumber(row.plays) })),
    topSegments: topSegments.filter((row) => Boolean(row.segmentKey)).map((row) => ({ segmentKey: row.segmentKey!, segmentLabel: row.segmentLabel || row.segmentKey!, plays: asNumber(row.plays) })),
  };
}

function sourceNames(sourceLinks: string | null) {
  try {
    const sources = JSON.parse(sourceLinks || "[]");
    return Array.isArray(sources) ? sources.map((source) => typeof source === "string" ? source : source?.source).filter(Boolean) : [];
  } catch { return []; }
}

export async function getPodcastShowNotes(episodeDate: string) {
  const db = await getDb();
  if (!db) return null;
  return (await db.select().from(podcastShowNotes).where(eq(podcastShowNotes.episodeDate, episodeDate)).limit(1))[0] ?? null;
}

export async function buildPodcastShowNotes(episodeDate: string, updatedBy: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const episode = (await db.select().from(episodes).where(eq(episodes.date, episodeDate)).limit(1))[0];
  if (!episode) throw new Error("Episode not found");
  const segments = await db.select().from(episodeSegments).where(eq(episodeSegments.episodeDate, episodeDate)).orderBy(episodeSegments.sortOrder);
  const editorial = segments.filter((segment) => segment.script && segment.label).slice(0, 13);
  const labels = editorial.map((segment) => segment.label!).filter(Boolean);
  const sources = Array.from(new Set(editorial.flatMap((segment) => sourceNames(segment.sourceLinks)))).slice(0, 8);
  const title = `Daily Intelligence Brief — ${episode.friendlyDate || episode.date}`;
  const summary = `${episode.segmentCount || segments.length} sourced segments covering ${labels.slice(0, 4).join(", ") || "the day’s political, civic, global, and technology developments"}.`;
  const showNotes = [
    `This verified Daily Intelligence Brief for ${episode.friendlyDate || episode.date} contains ${episode.segmentCount || segments.length} segments and runs ${episode.totalDurationLabel || "at its recorded duration"}.`,
    labels.length ? `Topics in this briefing: ${labels.join("; ")}.` : "Topics are listed in the episode segment record.",
    sources.length ? `Source context referenced in the episode record includes: ${sources.join("; ")}.` : "Source context is available from the episode’s cited segment records.",
    "This publication note is a source-grounded draft generated from the stored episode record. An editor may revise it before reuse on external platforms.",
  ].join("\n\n");
  const keywords = labels.slice(0, 12).join(", ");
  const values = { episodeDate, title, summary, showNotes, keywords, updatedBy };
  await db.insert(podcastShowNotes).values(values).onDuplicateKeyUpdate({ set: { title, summary, showNotes, keywords, updatedBy } });
  return getPodcastShowNotes(episodeDate);
}

export async function savePodcastShowNotes(input: { episodeDate: string; title: string; summary: string; showNotes: string; keywords: string; updatedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const { episodeDate, title, summary, showNotes, keywords, updatedBy } = input;
  await db.insert(podcastShowNotes).values({ episodeDate, title, summary, showNotes, keywords, updatedBy }).onDuplicateKeyUpdate({ set: { title, summary, showNotes, keywords, updatedBy } });
  return getPodcastShowNotes(episodeDate);
}

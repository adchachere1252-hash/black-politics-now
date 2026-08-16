import { createHash } from "node:crypto";
import { desc, gte, sql } from "drizzle-orm";
import { siteAnalyticsEvents } from "../drizzle/schema";
import { getDb } from "./db";

export type DeviceType = "desktop" | "tablet" | "mobile";

function sinceDate(days: number) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function asNumber(value: unknown) {
  return Number(value ?? 0);
}

export function hashAnalyticsSession(sessionToken: string) {
  return createHash("sha256").update(sessionToken).digest("hex");
}

export async function recordAnonymousPageView(input: {
  pagePath: string;
  sessionToken: string;
  deviceType: DeviceType;
  referrerHost?: string | null;
}) {
  const db = await getDb();
  if (!db) return { recorded: false } as const;
  await db.insert(siteAnalyticsEvents).values({
    pagePath: input.pagePath,
    sessionHash: hashAnalyticsSession(input.sessionToken),
    deviceType: input.deviceType,
    referrerHost: input.referrerHost || null,
  });
  return { recorded: true } as const;
}

export async function getEngagementSummary(days: number) {
  const db = await getDb();
  const empty = {
    days,
    totalVisits: 0,
    uniqueSessions: 0,
    todayVisits: 0,
    todayUniqueSessions: 0,
    daily: [] as Array<{ day: string; visits: number; uniqueSessions: number }>,
    topPages: [] as Array<{ pagePath: string; visits: number; uniqueSessions: number }>,
    devices: [] as Array<{ deviceType: DeviceType; visits: number; uniqueSessions: number }>,
    referrers: [] as Array<{ referrerHost: string; visits: number }>,
    recentActivity: [] as Array<{ id: number; pagePath: string; deviceType: DeviceType; referrerHost: string | null; visitedAt: Date }>,
  };
  if (!db) return empty;

  const since = sinceDate(days);
  const today = sinceDate(1);
  // Keep the exact same expression in SELECT, GROUP BY, and ORDER BY. Drizzle
  // otherwise qualifies only the grouping expression, which MySQL strict mode
  // treats as a different non-aggregated select expression.
  const dayExpression = sql<string>`DATE(visited_at)`;
  const visits = sql<number>`count(*)`;
  const uniqueSessions = sql<number>`count(distinct ${siteAnalyticsEvents.sessionHash})`;

  const [totalRows, todayRows, dailyRows, pageRows, deviceRows, referrerRows, recentActivity] = await Promise.all([
    db.select({ visits, uniqueSessions }).from(siteAnalyticsEvents).where(gte(siteAnalyticsEvents.visitedAt, since)),
    db.select({ visits, uniqueSessions }).from(siteAnalyticsEvents).where(gte(siteAnalyticsEvents.visitedAt, today)),
    db.select({ day: dayExpression, visits, uniqueSessions }).from(siteAnalyticsEvents).where(gte(siteAnalyticsEvents.visitedAt, since)).groupBy(dayExpression).orderBy(dayExpression),
    db.select({ pagePath: siteAnalyticsEvents.pagePath, visits, uniqueSessions }).from(siteAnalyticsEvents).where(gte(siteAnalyticsEvents.visitedAt, since)).groupBy(siteAnalyticsEvents.pagePath).orderBy(desc(visits)).limit(8),
    db.select({ deviceType: siteAnalyticsEvents.deviceType, visits, uniqueSessions }).from(siteAnalyticsEvents).where(gte(siteAnalyticsEvents.visitedAt, since)).groupBy(siteAnalyticsEvents.deviceType).orderBy(desc(visits)),
    db.select({ referrerHost: siteAnalyticsEvents.referrerHost, visits }).from(siteAnalyticsEvents).where(gte(siteAnalyticsEvents.visitedAt, since)).groupBy(siteAnalyticsEvents.referrerHost).orderBy(desc(visits)).limit(6),
    db.select({ id: siteAnalyticsEvents.id, pagePath: siteAnalyticsEvents.pagePath, deviceType: siteAnalyticsEvents.deviceType, referrerHost: siteAnalyticsEvents.referrerHost, visitedAt: siteAnalyticsEvents.visitedAt }).from(siteAnalyticsEvents).orderBy(desc(siteAnalyticsEvents.visitedAt)).limit(12),
  ]);

  return {
    days,
    totalVisits: asNumber(totalRows[0]?.visits),
    uniqueSessions: asNumber(totalRows[0]?.uniqueSessions),
    todayVisits: asNumber(todayRows[0]?.visits),
    todayUniqueSessions: asNumber(todayRows[0]?.uniqueSessions),
    daily: dailyRows.map((row) => ({ day: String(row.day), visits: asNumber(row.visits), uniqueSessions: asNumber(row.uniqueSessions) })),
    topPages: pageRows.map((row) => ({ pagePath: row.pagePath, visits: asNumber(row.visits), uniqueSessions: asNumber(row.uniqueSessions) })),
    devices: deviceRows.map((row) => ({ deviceType: row.deviceType as DeviceType, visits: asNumber(row.visits), uniqueSessions: asNumber(row.uniqueSessions) })),
    referrers: referrerRows.filter((row) => Boolean(row.referrerHost)).map((row) => ({ referrerHost: row.referrerHost!, visits: asNumber(row.visits) })),
    recentActivity,
  };
}

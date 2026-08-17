import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { episodes, episodeSegments, emailSubscribers, pipelineRuns, podcastGateAlerts, podcastPreflights } from "../drizzle/schema";
import { getPodcastRecoveryRequests } from "./podcastRecovery";
import type { Episode, EpisodeSegment } from "../drizzle/schema";
import { assessDailyBriefGate, getEasternDate } from "./dailyBriefSafeguards";

const TOPIC_ACCENTS: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  "_greeting": { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: "Greeting", emoji: "🎙️" },
  "00_weekend_brief": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Weekend Brief", emoji: "🗓️" },
  "00_memorial_day": { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Memorial Day Special", emoji: "🇺🇸" },
  "01_juneteenth": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Juneteenth Special", emoji: "✊" },
  "01_independence_day": { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Independence Day Special", emoji: "🇺🇸" },
  "01_ai_trends": { color: "#22d3ee", bg: "rgba(34,211,238,0.12)", label: "AI Trends", emoji: "🤖" },
  "02_american_political_briefs": { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "American Political Briefs", emoji: "🇺🇸" },
  "03_meta_news": { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", label: "Tech News", emoji: "💻" },
  "04_ai_legal_briefs": { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "AI Legal Briefs", emoji: "⚖️" },
  "05_global_economy_briefs": { color: "#4ade80", bg: "rgba(74,222,128,0.12)", label: "Global Economy Briefs", emoji: "💹" },
  "06_global_ai_updates": { color: "#2dd4bf", bg: "rgba(45,212,191,0.12)", label: "Global AI Updates", emoji: "🌐" },
  "07_global_political_briefs": { color: "#fb923c", bg: "rgba(251,146,60,0.12)", label: "Global Political Briefs", emoji: "🌍" },
  "08_eu_ai_act_updates": { color: "#818cf8", bg: "rgba(129,140,248,0.12)", label: "EU AI Act Updates", emoji: "🇪🇺" },
  "09_health_ai_briefs": { color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Health & AI Briefs", emoji: "🧬" },
  "10_australian_online_safety": { color: "#facc15", bg: "rgba(250,204,21,0.12)", label: "Australian Online Safety Act Briefs", emoji: "🦘" },
  "11_dsa_briefs": { color: "#c084fc", bg: "rgba(192,132,252,0.12)", label: "European Commission DSA Briefs", emoji: "📋" },
  "12_space_exploration": { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "Space Exploration", emoji: "🚀" },
  "13_closing": { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: "Closing", emoji: "🎙️" },
  "13_natural_disasters": { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Natural Disasters", emoji: "🌋" },
  "14_week_in_review": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "This Week in Review", emoji: "📰" },
  "09_australian_online_safety": { color: "#facc15", bg: "rgba(250,204,21,0.12)", label: "Australian Online Safety Act Briefs", emoji: "🦘" },
  "10_dsa_briefs": { color: "#c084fc", bg: "rgba(192,132,252,0.12)", label: "European Commission DSA Briefs", emoji: "📋" },
  "11_space_exploration": { color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "Space Exploration", emoji: "🚀" },
  "12_closing": { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: "Closing", emoji: "🎙️" },
  "12_weekend_brief": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Weekend Brief", emoji: "🗓️" },
};

function secsToLabel(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = Math.round(totalSec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function parseSegmentSources(value: string | null): Array<{ title: string; source: string; url: string; pubDate?: string }> {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.url === "string" && /^https:\/\//.test(item.url))
      .slice(0, 6)
      .map((item) => ({ title: String(item.title || "Source reporting"), source: String(item.source || "News source"), url: item.url, ...(item.pubDate ? { pubDate: String(item.pubDate) } : {}) }));
  } catch {
    return [];
  }
}

export async function getEpisodesFormatted() {
  const db = await getDb();
  if (!db) return [];
  const allEpisodes = await db.select().from(episodes).orderBy(desc(episodes.date));
  if (!allEpisodes.length) return [];
  const publishedEpisodes = allEpisodes.filter((episode) => episode.verificationStatus === "passed" && Boolean(episode.fullEpisodeCdnUrl));
  if (!publishedEpisodes.length) return [];
  const allSegments = await db.select().from(episodeSegments).orderBy(episodeSegments.episodeDate, episodeSegments.sortOrder);
  const segmentsByDate: Record<string, EpisodeSegment[]> = {};
  for (const seg of allSegments) {
    if (!segmentsByDate[seg.episodeDate]) segmentsByDate[seg.episodeDate] = [];
    segmentsByDate[seg.episodeDate].push(seg);
  }
  return publishedEpisodes.map((ep) => {
    const segs = segmentsByDate[ep.date] ?? [];
    const builtSegments = segs.map((seg) => {
      const accent = TOPIC_ACCENTS[seg.segmentKey] ?? TOPIC_ACCENTS["13_closing"];
      return {
        key: seg.segmentKey, label: seg.label ?? accent.label,
        emoji: seg.emoji || accent.emoji, accent: accent.color, accentBg: accent.bg,
        audioPath: seg.andrewCdnUrl ?? "", jennyAudioPath: seg.jennyCdnUrl ?? "",
        script: seg.script ?? "",
        durationLabel: seg.durationLabel ?? (seg.durationSec ? secsToLabel(Math.round(seg.durationSec)) : ""),
        durationSec: seg.durationSec ?? 0,
        sourceLinks: parseSegmentSources(seg.sourceLinks),
        sourceVerifiedAt: seg.sourceVerifiedAt ? seg.sourceVerifiedAt.toISOString() : null,
        isBreaking: seg.isBreaking === 1, breakingReason: seg.breakingReason ?? "",
      };
    });
    const totalSec = ep.totalDurationSec ?? builtSegments.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
    return {
      date: ep.date, day: ep.day ?? "", friendlyDate: ep.friendlyDate ?? "",
      fullEpisodeCdnUrl: ep.fullEpisodeCdnUrl ?? "",
      jennyFullEpisodeCdnUrl: ep.jennyFullEpisodeCdnUrl ?? "",
      segmentCount: ep.segmentCount ?? builtSegments.length,
      totalDurationSec: totalSec,
      totalDurationLabel: ep.totalDurationLabel ?? (totalSec > 0 ? secsToLabel(totalSec) : ""),
      segments: builtSegments,
      verificationStatus: ep.verificationStatus ?? "pending",
    };
  });
}

/** Archive-only listing: deliberately includes incomplete records so each stored
 * Daily Brief date can disclose whether audio is verified, preparing, or needs review. */
export async function getArchiveEpisodesFormatted() {
  const db = await getDb();
  if (!db) return [];
  const allEpisodes = await db.select().from(episodes).orderBy(desc(episodes.date));
  return allEpisodes.map((ep) => ({
    date: ep.date,
    day: ep.day ?? "",
    friendlyDate: ep.friendlyDate ?? "",
    fullEpisodeCdnUrl: ep.fullEpisodeCdnUrl ?? "",
    jennyFullEpisodeCdnUrl: ep.jennyFullEpisodeCdnUrl ?? "",
    segmentCount: ep.segmentCount ?? 0,
    totalDurationSec: ep.totalDurationSec ?? 0,
    totalDurationLabel: ep.totalDurationLabel ?? (ep.totalDurationSec ? secsToLabel(ep.totalDurationSec) : ""),
    verificationStatus: ep.verificationStatus ?? "pending",
  }));
}

export async function subscribeEmail(input: { email: string; name?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(emailSubscribers).values({ email: input.email, name: input.name ?? null }).onDuplicateKeyUpdate({ set: { active: true } });
}

export async function unsubscribeEmail(email: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailSubscribers).set({ active: false }).where(eq(emailSubscribers.email, email));
}

export async function getPipelineRuns() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pipelineRuns).orderBy(desc(pipelineRuns.startedAt)).limit(20);
}

export async function getPodcastOperations() {
  const db = await getDb();
  if (!db) return { latest: null, recentEpisodes: [], recentRuns: [], preflights: [], recoveryRequests: [], today: null };

  const [recentEpisodes, recentRuns, preflights, recoveryRequests] = await Promise.all([
    db.select().from(episodes).orderBy(desc(episodes.date)).limit(7),
    db.select().from(pipelineRuns).orderBy(desc(pipelineRuns.startedAt)).limit(12),
    db.select().from(podcastPreflights).orderBy(desc(podcastPreflights.checkedAt)).limit(7),
    getPodcastRecoveryRequests(),
  ]);
  const latest = recentEpisodes[0] ?? null;
  const todayDate = getEasternDate();
  const [[todayEpisode], [todayPreflightForDate], [todayAlert]] = await Promise.all([
    db.select().from(episodes).where(eq(episodes.date, todayDate)).limit(1),
    db.select().from(podcastPreflights).where(eq(podcastPreflights.episodeDate, todayDate)).limit(1),
    db.select().from(podcastGateAlerts).where(eq(podcastGateAlerts.episodeDate, todayDate)).limit(1),
  ]);
  if (!latest) return { latest: null, recentEpisodes, recentRuns, preflights, recoveryRequests, today: { date: todayDate, preflight: todayPreflightForDate ?? null, alert: todayAlert ?? null } };

  const segments = await db.select().from(episodeSegments).where(eq(episodeSegments.episodeDate, latest.date)).orderBy(episodeSegments.sortOrder);
  const keyCounts = new Map<string, number>();
  for (const segment of segments) keyCounts.set(segment.segmentKey, (keyCounts.get(segment.segmentKey) ?? 0) + 1);
  const expectedSegments = latest.day === "Friday" || latest.day === "Monday" ? 16 : 15;
  const andrewReady = segments.filter((segment) => Boolean(segment.andrewCdnUrl)).length;
  const jennyReady = segments.filter((segment) => Boolean(segment.jennyCdnUrl)).length;
  const scriptsReady = segments.filter((segment) => Boolean(segment.script?.trim())).length;
  const duplicateKeys = Array.from(keyCounts.entries()).filter(([, count]) => count > 1).map(([key]) => key);
  const andrewFullAudioReady = Boolean(latest.fullEpisodeCdnUrl);
  const jennyFullAudioReady = Boolean(latest.jennyFullEpisodeCdnUrl);
  const fullAudioReady = latest.verificationStatus === "passed" && andrewFullAudioReady && jennyFullAudioReady;
  const todayPreflight = preflights.find((preflight) => preflight.episodeDate === latest.date) ?? null;
  const todayGate = assessDailyBriefGate({
    verificationStatus: todayEpisode?.verificationStatus,
    andrewFullReady: Boolean(todayEpisode?.fullEpisodeCdnUrl),
    jennyFullReady: Boolean(todayEpisode?.jennyFullEpisodeCdnUrl),
    preflightStatus: todayPreflightForDate?.status,
  });

  return {
    latest: {
      date: latest.date,
      day: latest.day ?? "",
      friendlyDate: latest.friendlyDate ?? latest.date,
      durationLabel: latest.totalDurationLabel ?? "Awaiting verification",
      durationSec: latest.totalDurationSec ?? 0,
      verificationStatus: latest.verificationStatus ?? "pending",
      verificationWarnings: latest.verificationWarnings ?? null,
      updatedAt: latest.updatedAt,
      expectedSegments,
      segmentCount: segments.length,
      scriptsReady,
      andrewReady,
      jennyReady,
      duplicateKeys,
      fullAudioReady,
      andrewFullAudioReady,
      jennyFullAudioReady,
      segments: segments.map((segment) => ({
        key: segment.segmentKey,
        label: segment.label ?? segment.segmentKey,
        durationLabel: segment.durationLabel ?? "",
        hasScript: Boolean(segment.script?.trim()),
        hasAndrewAudio: Boolean(segment.andrewCdnUrl),
        hasJennyAudio: Boolean(segment.jennyCdnUrl),
      })),
    },
    recentEpisodes: recentEpisodes.map((episode) => ({
      date: episode.date,
      friendlyDate: episode.friendlyDate ?? episode.date,
      durationLabel: episode.totalDurationLabel ?? "",
      segmentCount: episode.segmentCount ?? 0,
      verificationStatus: episode.verificationStatus ?? "pending",
      hasFullAudio: Boolean(episode.fullEpisodeCdnUrl),
      hasJennyFullAudio: Boolean(episode.jennyFullEpisodeCdnUrl),
      updatedAt: episode.updatedAt,
    })),
    recentRuns,
    preflights: preflights.map((preflight) => ({
      episodeDate: preflight.episodeDate,
      status: preflight.status,
      topicCount: preflight.topicCount,
      readyCount: preflight.readyCount,
      report: preflight.report,
      checkedAt: preflight.checkedAt,
    })),
    recoveryRequests: recoveryRequests.map((request) => ({
      id: request.id,
      episodeDate: request.episodeDate,
      recoveryMode: request.recoveryMode,
      status: request.status,
      requestedBy: request.requestedBy,
      note: request.note,
      resultMessage: request.resultMessage,
      requestedAt: request.requestedAt,
      handledAt: request.handledAt,
    })),
    latestPreflight: todayPreflight ? {
      episodeDate: todayPreflight.episodeDate,
      status: todayPreflight.status,
      topicCount: todayPreflight.topicCount,
      readyCount: todayPreflight.readyCount,
      report: todayPreflight.report,
      checkedAt: todayPreflight.checkedAt,
    } : null,
    today: {
      date: todayDate,
      gate: todayGate,
      preflight: todayPreflightForDate ? { status: todayPreflightForDate.status, topicCount: todayPreflightForDate.topicCount, readyCount: todayPreflightForDate.readyCount, checkedAt: todayPreflightForDate.checkedAt } : null,
      alert: todayAlert ? { gateStatus: todayAlert.gateStatus, message: todayAlert.message, notificationSent: todayAlert.notificationSent, notifiedAt: todayAlert.notifiedAt, checkedAt: todayAlert.checkedAt } : null,
    },
  };
}

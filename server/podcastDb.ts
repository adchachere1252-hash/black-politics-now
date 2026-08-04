import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { episodes, episodeSegments, emailSubscribers, pipelineRuns } from "../drizzle/schema";
import type { Episode, EpisodeSegment } from "../drizzle/schema";

const TOPIC_ACCENTS: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  "_greeting": { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: "Greeting", emoji: "🎙️" },
  "00_weekend_brief": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Weekend Brief", emoji: "🗓️" },
  "00_memorial_day": { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", label: "Memorial Day Special", emoji: "🇺🇸" },
  "01_juneteenth": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "Juneteenth Special", emoji: "✊" },
  "01_independence_day": { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Independence Day Special", emoji: "🇺🇸" },
  "01_ai_trends": { color: "#22d3ee", bg: "rgba(34,211,238,0.12)", label: "AI Trends", emoji: "🤖" },
  "02_american_political_briefs": { color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "American Political Briefs", emoji: "🇺🇸" },
  "03_meta_news": { color: "#60a5fa", bg: "rgba(96,165,250,0.12)", label: "Meta News", emoji: "📘" },
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

export async function getEpisodesFormatted() {
  const db = await getDb();
  if (!db) return [];
  const allEpisodes = await db.select().from(episodes).orderBy(desc(episodes.date));
  if (!allEpisodes.length) return [];
  const allSegments = await db.select().from(episodeSegments).orderBy(episodeSegments.episodeDate, episodeSegments.sortOrder);
  const segmentsByDate: Record<string, EpisodeSegment[]> = {};
  for (const seg of allSegments) {
    if (!segmentsByDate[seg.episodeDate]) segmentsByDate[seg.episodeDate] = [];
    segmentsByDate[seg.episodeDate].push(seg);
  }
  return allEpisodes.map((ep) => {
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
        isBreaking: seg.isBreaking === 1, breakingReason: seg.breakingReason ?? "",
      };
    });
    const totalSec = ep.totalDurationSec ?? builtSegments.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
    return {
      date: ep.date, day: ep.day ?? "",
      fullEpisodeCdnUrl: ep.fullEpisodeCdnUrl ?? "",
      segmentCount: ep.segmentCount ?? builtSegments.length,
      totalDurationSec: totalSec,
      totalDurationLabel: ep.totalDurationLabel ?? (totalSec > 0 ? secsToLabel(totalSec) : ""),
      segments: builtSegments,
      verificationStatus: ep.verificationStatus ?? "pending",
    };
  });
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

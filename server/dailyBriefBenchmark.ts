import { desc, eq } from "drizzle-orm";
import { episodeSegments, episodes } from "../drizzle/schema";
import { getDb } from "./db";

export type BenchmarkSegment = {
  key: string;
  script?: string | null;
  sourceLinks?: string | null;
  durationSec?: number | null;
  hasAndrewAudio?: boolean;
  hasJennyAudio?: boolean;
};

export type BenchmarkEpisode = {
  date: string;
  day?: string | null;
  verificationStatus?: string | null;
  totalDurationSec?: number | null;
  hasAndrewFull?: boolean;
  hasJennyFull?: boolean;
  segments: BenchmarkSegment[];
};

export type DailyBriefBenchmarkScore = {
  date: string;
  day: string;
  baseline: boolean;
  score: number | null;
  status: "verified" | "held" | "baseline";
  checks: {
    flow: boolean;
    spokenStructure: boolean;
    topics: boolean;
    sources: boolean;
    scripts: boolean;
    duration: boolean;
    pairedSegments: boolean;
    fullVoices: boolean;
  };
  editorialSegments: number;
  sourceBackedEditorialSegments: number;
  holdReasons: string[];
};

const BASELINE_CUTOFF = "2026-07-28";

function sourcePackagePresent(segment: BenchmarkSegment) {
  if (segment.script?.includes("[REF:")) return true;
  try {
    const sources = JSON.parse(segment.sourceLinks || "[]");
    return Array.isArray(sources) && sources.some((source) => {
      if (typeof source === "string") return /^https:\/\//.test(source);
      return typeof source?.url === "string" && /^https:\/\//.test(source.url);
    });
  } catch {
    return false;
  }
}

function audibleWordCount(script?: string | null) {
  return (script || "").replace(/\[REF:[^\]]+\]/g, " ").trim().split(/\s+/).filter(Boolean).length;
}

function isEditorial(segment: BenchmarkSegment) {
  return !segment.key.includes("greeting") && !segment.key.includes("closing");
}

function hasDetailedGreeting(script?: string | null) {
  const normalized = (script || "").trim();
  return audibleWordCount(normalized) >= 35 && /Daily Intelligence Brief/i.test(normalized);
}

function hasSpokenEditorialLead(script?: string | null) {
  return /^(We begin with|Next,|Our next briefing is|This is your)/i.test((script || "").trim());
}

export function scoreDailyBriefAgainstBenchmark(episode: BenchmarkEpisode): DailyBriefBenchmarkScore {
  const segments = [...episode.segments];
  const editorial = segments.filter(isEditorial);
  const firstIsGreeting = segments[0]?.key.includes("greeting") ?? false;
  const lastIsClosing = segments.at(-1)?.key.includes("closing") ?? false;
  const flow = firstIsGreeting && lastIsClosing && editorial.length >= 13;
  const spokenStructure = hasDetailedGreeting(segments[0]?.script) && editorial.length >= 13 && editorial.every((segment) => hasSpokenEditorialLead(segment.script));
  const keys = segments.map((segment) => segment.key);
  const hasDuplicates = new Set(keys).size !== keys.length;
  const weekdaySpecial = episode.day === "Monday"
    ? editorial.some((segment) => segment.key.includes("weekend_brief"))
    : episode.day === "Friday"
      ? editorial.some((segment) => segment.key.includes("week_in_review"))
      : true;
  const topics = !hasDuplicates && weekdaySpecial;
  const sourceBackedEditorialSegments = editorial.filter(sourcePackagePresent).length;
  const sources = editorial.length >= 13 && sourceBackedEditorialSegments === editorial.length;
  const scripts = editorial.length >= 13 && editorial.every((segment) => audibleWordCount(segment.script) >= 50);
  const pairedSegments = segments.length > 0 && segments.every((segment) => segment.hasAndrewAudio && segment.hasJennyAudio);
  const recordedDuration = Number(episode.totalDurationSec || 0);
  const summedDuration = segments.reduce((total, segment) => total + Number(segment.durationSec || 0), 0);
  const duration = recordedDuration > 0 && summedDuration > 0 && Math.abs(recordedDuration - summedDuration) <= 20;
  const fullVoices = episode.verificationStatus === "passed" && Boolean(episode.hasAndrewFull) && Boolean(episode.hasJennyFull);
  const baseline = episode.date < BASELINE_CUTOFF;
  const checks = { flow, spokenStructure, topics, sources, scripts, duration, pairedSegments, fullVoices };
  const holdReasons = [
    !flow ? "opening, closing, or editorial count does not meet the benchmark" : null,
    !spokenStructure ? "full episode requires a detailed greeting and an audible topic introduction for every editorial segment" : null,
    !topics ? "topic sequence has a duplicate or is missing its weekday special" : null,
    !sources ? "one or more editorial segments lack source evidence" : null,
    !scripts ? "one or more editorial scripts are too short for the benchmark" : null,
    !duration ? "recorded duration does not reconcile with segment durations" : null,
    !pairedSegments ? "one or more paired Andrew/Jenny segment assets are missing" : null,
    !fullVoices ? "verified Andrew and Jenny continuous mixes are both required" : null,
  ].filter((reason): reason is string => Boolean(reason));
  const score = baseline ? null :
    (flow ? 15 : 0) +
    (spokenStructure ? 5 : 0) +
    (topics ? 10 : 0) +
    (sources ? 25 : 0) +
    (scripts ? 10 : 0) +
    (duration ? 5 : 0) +
    (pairedSegments ? 15 : 0) +
    (fullVoices ? 15 : 0);

  return {
    date: episode.date,
    day: episode.day || "",
    baseline,
    score,
    status: baseline ? "baseline" : holdReasons.length === 0 ? "verified" : "held",
    checks,
    editorialSegments: editorial.length,
    sourceBackedEditorialSegments,
    holdReasons,
  };
}

export async function getDailyBriefQAScorecard(limit = 35) {
  const db = await getDb();
  const empty = { baselineCount: 0, verifiedCount: 0, heldCount: 0, latestScore: null as number | null, scores: [] as DailyBriefBenchmarkScore[] };
  if (!db) return empty;
  const episodeRows = await db.select().from(episodes).orderBy(desc(episodes.date)).limit(limit);
  const dates = episodeRows.map((episode) => episode.date);
  const segmentRows = await Promise.all(dates.map((date) => db.select().from(episodeSegments).where(eq(episodeSegments.episodeDate, date)).orderBy(episodeSegments.sortOrder)));
  const scores = episodeRows.map((episode, index) => scoreDailyBriefAgainstBenchmark({
    date: episode.date,
    day: episode.day,
    verificationStatus: episode.verificationStatus,
    totalDurationSec: episode.totalDurationSec,
    hasAndrewFull: Boolean(episode.fullEpisodeCdnUrl),
    hasJennyFull: Boolean(episode.jennyFullEpisodeCdnUrl),
    segments: segmentRows[index].map((segment) => ({
      key: segment.segmentKey,
      script: segment.script,
      sourceLinks: segment.sourceLinks,
      durationSec: segment.durationSec,
      hasAndrewAudio: Boolean(segment.andrewCdnUrl),
      hasJennyAudio: Boolean(segment.jennyCdnUrl),
    })),
  }));
  const current = scores.filter((score) => !score.baseline);
  return {
    baselineCount: scores.filter((score) => score.baseline).length,
    verifiedCount: current.filter((score) => score.status === "verified").length,
    heldCount: current.filter((score) => score.status === "held").length,
    latestScore: current[0]?.score ?? null,
    scores,
  };
}

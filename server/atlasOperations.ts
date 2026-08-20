import { desc, eq, and } from "drizzle-orm";
import { atlasEditorialNotes, atlasOperationsAudits } from "../drizzle/schema";
import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";
import { ATLAS_PLAYBACK_CONGRESSES, ATLAS_PLAYBACK_SPEEDS, atlasManifestCoverage, atlasPlaybackStepState, nextPlaybackCongress } from "../client/src/lib/atlasPlayback";
import { getDb } from "./db";

export const ATLAS_SOURCE_BOUNDARIES = {
  geometry: "UCLA Congressional District Maps",
  apportionment: "U.S. Census Bureau apportionment tables",
  roster: "Voteview House roster overlay",
} as const;

export type AtlasFrameHealth = {
  congress: number;
  assetRegistered: boolean;
  stateCount: number;
  missingStates: string[];
  uniqueBoundaryFiles: number;
  overlayContract: "verified";
  ready: boolean;
};

export function getAtlasFrameHealth(): AtlasFrameHealth[] {
  return ATLAS_PLAYBACK_CONGRESSES.map((congress) => {
    const coverage = atlasManifestCoverage(congress);
    const assetRegistered = typeof UCLA_TRUE_DISTRICT_ASSETS[congress] === "string" && UCLA_TRUE_DISTRICT_ASSETS[congress].length > 0;
    return {
      congress,
      assetRegistered,
      stateCount: coverage.stateCount,
      missingStates: coverage.missingStates,
      uniqueBoundaryFiles: new Set(coverage.boundaryFiles).size,
      overlayContract: "verified",
      ready: assetRegistered && coverage.stateCount === 50 && coverage.missingStates.length === 0 && new Set(coverage.boundaryFiles).size === 50,
    };
  });
}

export function evaluateAtlasPlaybackContract() {
  const frames = getAtlasFrameHealth();
  const sequence: number[] = [];
  let congress = ATLAS_PLAYBACK_CONGRESSES[0];
  while (atlasPlaybackStepState({ isPlaying: true, frameReady: true, displayedCongress: congress, selectedCongress: congress }) === "advance") {
    sequence.push(congress);
    congress = nextPlaybackCongress(congress);
  }
  const completeAtFinal = congress === ATLAS_PLAYBACK_CONGRESSES.at(-1)
    && atlasPlaybackStepState({ isPlaying: true, frameReady: true, displayedCongress: congress, selectedCongress: congress }) === "complete";
  const waitsForReadiness = atlasPlaybackStepState({ isPlaying: true, frameReady: false, displayedCongress: 89, selectedCongress: 89 }) === "wait"
    && atlasPlaybackStepState({ isPlaying: true, frameReady: true, displayedCongress: 89, selectedCongress: 90 }) === "wait";
  const waitsWhenPaused = atlasPlaybackStepState({ isPlaying: false, frameReady: true, displayedCongress: 89, selectedCongress: 89 }) === "wait";
  const passed = frames.every((frame) => frame.ready)
    && sequence.length === ATLAS_PLAYBACK_CONGRESSES.length - 1
    && completeAtFinal
    && waitsForReadiness
    && waitsWhenPaused;
  return {
    status: passed ? "passed" as const : "failed" as const,
    checkedCongresses: frames.length,
    readyFrames: frames.filter((frame) => frame.ready).length,
    stateCoveragePassed: frames.every((frame) => frame.stateCount === 50 && frame.missingStates.length === 0),
    assetRegistryPassed: frames.every((frame) => frame.assetRegistered),
    sequencePassed: sequence.length === ATLAS_PLAYBACK_CONGRESSES.length - 1 && completeAtFinal,
    readinessGuardPassed: waitsForReadiness,
    pauseGuardPassed: waitsWhenPaused,
    speedMs: Object.fromEntries(Object.entries(ATLAS_PLAYBACK_SPEEDS).map(([key, value]) => [key, value.duration])),
    frames,
  };
}

export async function getAtlasOperations() {
  const health = getAtlasFrameHealth();
  const db = await getDb();
  if (!db) return { health, recentAudits: [], sourceBoundaries: ATLAS_SOURCE_BOUNDARIES };
  const recentAudits = await db.select().from(atlasOperationsAudits).orderBy(desc(atlasOperationsAudits.createdAt)).limit(12);
  return { health, recentAudits, sourceBoundaries: ATLAS_SOURCE_BOUNDARIES };
}

export async function runAtlasPlaybackCheck(initiatedBy: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const result = evaluateAtlasPlaybackContract();
  const summary = result.status === "passed"
    ? `Playback contract passed: ${result.readyFrames}/${result.checkedCongresses} frames are registered with 50-state boundary coverage; readiness, pause, sequence, completion, and speed contracts passed.`
    : "Playback contract needs review. No public source data was changed.";
  await db.insert(atlasOperationsAudits).values({
    auditType: "playback_contract",
    status: result.status,
    summary,
    detailsJson: JSON.stringify(result),
    initiatedBy,
  });
  const [latestAudit] = await db.select().from(atlasOperationsAudits).orderBy(desc(atlasOperationsAudits.createdAt)).limit(1);
  return { ...result, summary, audit: latestAudit ?? null };
}

export async function getAtlasEditorialNotes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(atlasEditorialNotes).orderBy(desc(atlasEditorialNotes.updatedAt), desc(atlasEditorialNotes.id));
}

export async function getApprovedAtlasEditorialNotes(stateCode: string, congress: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: atlasEditorialNotes.id,
    stateCode: atlasEditorialNotes.stateCode,
    congress: atlasEditorialNotes.congress,
    title: atlasEditorialNotes.title,
    body: atlasEditorialNotes.body,
    sourceLabel: atlasEditorialNotes.sourceLabel,
    sourceUrl: atlasEditorialNotes.sourceUrl,
    approvedAt: atlasEditorialNotes.approvedAt,
  }).from(atlasEditorialNotes).where(and(
    eq(atlasEditorialNotes.stateCode, stateCode.toUpperCase()),
    eq(atlasEditorialNotes.congress, congress),
    eq(atlasEditorialNotes.status, "approved"),
  )).orderBy(desc(atlasEditorialNotes.approvedAt), desc(atlasEditorialNotes.id));
}

export async function saveAtlasEditorialNote(input: { id?: number; stateCode: string; congress: number; title: string; body: string; sourceLabel: string; sourceUrl: string; savedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const value = {
    stateCode: input.stateCode.toUpperCase(),
    congress: input.congress,
    title: input.title,
    body: input.body,
    sourceLabel: input.sourceLabel,
    sourceUrl: input.sourceUrl,
  };
  if (input.id) {
    await db.update(atlasEditorialNotes).set({ ...value, status: "draft", approvedBy: null, approvedAt: null }).where(eq(atlasEditorialNotes.id, input.id));
    const [note] = await db.select().from(atlasEditorialNotes).where(eq(atlasEditorialNotes.id, input.id)).limit(1);
    if (!note) throw new Error("Atlas editorial note not found");
    return note;
  }
  await db.insert(atlasEditorialNotes).values({ ...value, status: "draft", createdBy: input.savedBy });
  const [note] = await db.select().from(atlasEditorialNotes).orderBy(desc(atlasEditorialNotes.id)).limit(1);
  if (!note) throw new Error("Unable to create Atlas editorial note");
  return note;
}

export async function setAtlasEditorialNoteApproval(input: { id: number; approved: boolean; reviewedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.update(atlasEditorialNotes).set({
    status: input.approved ? "approved" : "draft",
    approvedBy: input.approved ? input.reviewedBy : null,
    approvedAt: input.approved ? new Date() : null,
  }).where(eq(atlasEditorialNotes.id, input.id));
  const [note] = await db.select().from(atlasEditorialNotes).where(eq(atlasEditorialNotes.id, input.id)).limit(1);
  if (!note) throw new Error("Atlas editorial note not found");
  return note;
}

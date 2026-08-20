import { eq, desc, like, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { senateRaces, houseRaces, governorRaces, governorCandidateEdits, referendums, electionDayStatus } from "../drizzle/schema";
import { photoWithRepositoryFallback } from "./candidatePhotoResolver";

function withSenatePhotoFallback(race: any) {
  return {
    ...race,
    candidate1Photo: photoWithRepositoryFallback(race.candidate1Name, race.candidate1Photo),
    candidate2Photo: photoWithRepositoryFallback(race.candidate2Name, race.candidate2Photo),
  };
}

function withHousePhotoFallback(race: any) {
  return {
    ...race,
    candidate1Photo: photoWithRepositoryFallback(race.candidate1Name, race.candidate1Photo),
    candidate2Photo: photoWithRepositoryFallback(race.candidate2Name, race.candidate2Photo),
  };
}

function withGovernorPhotoFallback(race: any) {
  return {
    ...race,
    demPhoto: photoWithRepositoryFallback(race.demCandidate, race.demPhoto),
    repPhoto: photoWithRepositoryFallback(race.repCandidate, race.repPhoto),
  };
}

export async function getAllSenateRaces() {
  const db = await getDb();
  if (!db) return [];
  return (await db.select().from(senateRaces)).map(withSenatePhotoFallback);
}

export async function getAllHouseRaces() {
  const db = await getDb();
  if (!db) return [];
  return (await db.select().from(houseRaces)).map(withHousePhotoFallback);
}

export async function getHouseRacesByState(stateCode: string) {
  const db = await getDb();
  if (!db) return [];
  return (await db.select().from(houseRaces).where(eq(houseRaces.stateCode, stateCode))).map(withHousePhotoFallback);
}

export async function getAllGovernorRaces() {
  const db = await getDb();
  if (!db) return [];
  return (await db.select().from(governorRaces)).map(withGovernorPhotoFallback);
}

export async function getAllReferendums() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referendums);
}

export async function getScoreboard() {
  const db = await getDb();
  if (!db) return { senate: { dem: 0, rep: 0, ind: 0 }, house: { dem: 0, rep: 0 } };
  const senateRows = await db.select().from(senateRaces);
  const houseRows = await db.select().from(houseRaces);
  // Count called seats
  let senateDem = 0, senateRep = 0, senateInd = 0;
  for (const r of senateRows) {
    if (r.calledParty === "D") senateDem++;
    else if (r.calledParty === "R") senateRep++;
    else if (r.calledParty === "I") senateInd++;
  }
  let houseDem = 0, houseRep = 0;
  for (const r of houseRows) {
    if (r.calledParty === "D") houseDem++;
    else if (r.calledParty === "R") houseRep++;
  }
  return { senate: { dem: senateDem, rep: senateRep, ind: senateInd }, house: { dem: houseDem, rep: houseRep } };
}

/**
 * A deliberately minimal, read-only status summary for public map freshness.
 * It exposes operational timing and source health, never private runbook data,
 * credentials, or any ability to change an election record.
 */
export async function getPublicElectionFreshness() {
  const db = await getDb();
  if (!db) return null;
  const [status] = await db
    .select({
      mode: electionDayStatus.mode,
      sourceName: electionDayStatus.sourceName,
      sourceHealth: electionDayStatus.sourceHealth,
      heartbeatAt: electionDayStatus.heartbeatAt,
      lastPollAt: electionDayStatus.lastPollAt,
      mappedRaces: electionDayStatus.mappedRaces,
      updatedRaces: electionDayStatus.updatedRaces,
      failedPolls: electionDayStatus.failedPolls,
      newCalls: electionDayStatus.newCalls,
    })
    .from(electionDayStatus)
    .orderBy(desc(electionDayStatus.updatedAt))
    .limit(1);
  return status ?? null;
}

export async function searchRaces(query: string) {
  const db = await getDb();
  if (!db) return { senate: [], house: [], governor: [] };
  const pattern = `%${query}%`;
  const senateResults = await db.select().from(senateRaces).where(
    or(like(senateRaces.stateName, pattern), like(senateRaces.candidate1Name, pattern), like(senateRaces.candidate2Name, pattern))
  ).limit(10);
  const houseResults = await db.select().from(houseRaces).where(
    or(like(houseRaces.stateName, pattern), like(houseRaces.candidate1Name, pattern), like(houseRaces.candidate2Name, pattern))
  ).limit(10);
  const govResults = await db.select().from(governorRaces).where(
    or(like(governorRaces.stateName, pattern), like(governorRaces.demCandidate, pattern), like(governorRaces.repCandidate, pattern))
  ).limit(10);
  return {
    senate: senateResults.map(withSenatePhotoFallback),
    house: houseResults.map(withHousePhotoFallback),
    governor: govResults.map(withGovernorPhotoFallback),
  };
}

export async function updateSenateRace(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(senateRaces).set(data as any).where(eq(senateRaces.id, id));
}

export async function updateHouseRace(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(houseRaces).set(data as any).where(eq(houseRaces.id, id));
}

export async function updateGovernorRace(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(governorRaces).set(data as any).where(eq(governorRaces.id, id));
}

export type GovernorCandidateLogInput = {
  id: number;
  demCandidate: string;
  repCandidate: string;
  demPreviousOffice?: string | null;
  repPreviousOffice?: string | null;
  candidateSourceUrl: string;
  candidateSourceLabel: string;
  editorName: string;
  editorNote?: string | null;
};

export async function updateGovernorCandidateLog(input: GovernorCandidateLogInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [existing] = await db.select().from(governorRaces).where(eq(governorRaces.id, input.id)).limit(1);
  if (!existing) throw new Error("Governor race not found");
  const prior = {
    demCandidate: existing.demCandidate,
    repCandidate: existing.repCandidate,
    demPreviousOffice: existing.demPreviousOffice,
    repPreviousOffice: existing.repPreviousOffice,
    candidateSourceUrl: existing.candidateSourceUrl,
    candidateSourceLabel: existing.candidateSourceLabel,
  };
  await db.update(governorRaces).set({
    demCandidate: input.demCandidate,
    repCandidate: input.repCandidate,
    demPreviousOffice: input.demPreviousOffice || null,
    repPreviousOffice: input.repPreviousOffice || null,
    candidateSourceUrl: input.candidateSourceUrl,
    candidateSourceLabel: input.candidateSourceLabel,
    notes: input.editorNote || existing.notes,
  }).where(eq(governorRaces.id, input.id));
  await db.insert(governorCandidateEdits).values({
    governorRaceId: existing.id,
    stateCode: existing.stateCode,
    demCandidate: input.demCandidate,
    repCandidate: input.repCandidate,
    sourceUrl: input.candidateSourceUrl,
    sourceLabel: input.candidateSourceLabel,
    editorName: input.editorName,
    editorNote: input.editorNote || null,
    previousValue: JSON.stringify(prior),
  });
}

export async function getGovernorCandidateLogHistory(id: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governorCandidateEdits).where(eq(governorCandidateEdits.governorRaceId, id)).orderBy(desc(governorCandidateEdits.createdAt), desc(governorCandidateEdits.id)).limit(12);
}

export async function updateReferendum(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(referendums).set(data as any).where(eq(referendums.id, id));
}

import { and, eq, desc, like, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { senateRaces, houseRaces, governorRaces, governorCandidateEdits, electionCandidateEdits, referendums, electionDayStatus } from "../drizzle/schema";
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

export type RaceCandidateLogInput = {
  id: number;
  candidate1Name: string;
  candidate1Party: "D" | "R" | "I" | "L" | "G";
  candidate2Name: string;
  candidate2Party: "D" | "R" | "I" | "L" | "G";
  candidateSourceUrl: string;
  candidateSourceLabel: string;
  editorName: string;
  editorNote?: string | null;
};

async function updateRaceCandidateLog(input: RaceCandidateLogInput, contestType: "senate" | "house") {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const table: any = contestType === "senate" ? senateRaces : houseRaces;
  const [existing] = await db.select().from(table).where(eq(table.id, input.id)).limit(1);
  if (!existing) throw new Error(`${contestType === "senate" ? "Senate" : "House"} race not found`);
  const prior = {
    candidate1Name: existing.candidate1Name,
    candidate1Party: existing.candidate1Party,
    candidate2Name: existing.candidate2Name,
    candidate2Party: existing.candidate2Party,
    candidateSourceUrl: existing.candidateSourceUrl,
    candidateSourceLabel: existing.candidateSourceLabel,
  };
  await db.update(table).set({
    candidate1Name: input.candidate1Name,
    candidate1Party: input.candidate1Party,
    candidate2Name: input.candidate2Name,
    candidate2Party: input.candidate2Party,
    candidateSourceUrl: input.candidateSourceUrl,
    candidateSourceLabel: input.candidateSourceLabel,
    notes: input.editorNote || existing.notes,
  }).where(eq(table.id, input.id));
  await db.insert(electionCandidateEdits).values({
    contestType,
    contestId: existing.id,
    stateCode: existing.stateCode,
    districtLabel: contestType === "house" ? existing.districtLabel : null,
    candidate1Name: input.candidate1Name,
    candidate1Party: input.candidate1Party,
    candidate2Name: input.candidate2Name,
    candidate2Party: input.candidate2Party,
    sourceUrl: input.candidateSourceUrl,
    sourceLabel: input.candidateSourceLabel,
    editorName: input.editorName,
    editorNote: input.editorNote || null,
    previousValue: JSON.stringify(prior),
  });
}

export async function updateSenateCandidateLog(input: RaceCandidateLogInput) {
  return updateRaceCandidateLog(input, "senate");
}

export async function updateHouseCandidateLog(input: RaceCandidateLogInput) {
  return updateRaceCandidateLog(input, "house");
}

export async function getRaceCandidateLogHistory(contestType: "senate" | "house", id: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(electionCandidateEdits).where(and(eq(electionCandidateEdits.contestType, contestType), eq(electionCandidateEdits.contestId, id))).orderBy(desc(electionCandidateEdits.createdAt), desc(electionCandidateEdits.id)).limit(12);
}

export type NewRaceInput = {
  stateCode: string;
  stateName: string;
  district?: number;
  districtLabel?: string;
  candidate1Name: string;
  candidate1Party: "D" | "R" | "I" | "L" | "G";
  candidate2Name: string;
  candidate2Party: "D" | "R" | "I" | "L" | "G";
  rating: "Solid D" | "Likely D" | "Lean D" | "Toss-up" | "Lean R" | "Likely R" | "Solid R" | "Safe D" | "Safe R";
  sourceUrl: string;
  sourceLabel: string;
  editorNote?: string | null;
  editorName: string;
};

function normalizedNewRace(input: NewRaceInput) {
  const stateCode = input.stateCode.trim().toUpperCase();
  if (stateCode.length !== 2) throw new Error("State code must have two letters.");
  const sourceUrl = new URL(input.sourceUrl);
  if (sourceUrl.protocol !== "https:" && sourceUrl.protocol !== "http:") throw new Error("Source URL must use HTTP or HTTPS.");
  return { ...input, stateCode, stateName: input.stateName.trim(), candidate1Name: input.candidate1Name.trim(), candidate2Name: input.candidate2Name.trim(), sourceUrl: sourceUrl.toString(), sourceLabel: input.sourceLabel.trim() };
}

export async function createSenateRace(input: NewRaceInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const value = normalizedNewRace(input);
  return db.transaction(async (tx) => {
    const result = await tx.insert(senateRaces).values({ stateCode: value.stateCode, stateName: value.stateName, candidate1Name: value.candidate1Name, candidate1Party: value.candidate1Party, candidate2Name: value.candidate2Name, candidate2Party: value.candidate2Party, rating: value.rating, candidateSourceUrl: value.sourceUrl, candidateSourceLabel: value.sourceLabel, notes: value.editorNote || null });
    const id = Number((Array.isArray(result) ? result[0] : result as any)?.insertId ?? 0);
    await tx.insert(electionCandidateEdits).values({ contestType: "senate", contestId: id, stateCode: value.stateCode, districtLabel: null, candidate1Name: value.candidate1Name, candidate1Party: value.candidate1Party, candidate2Name: value.candidate2Name, candidate2Party: value.candidate2Party, sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel, editorName: value.editorName, editorNote: value.editorNote || "Initial contest creation", previousValue: JSON.stringify({}) });
    return { id };
  });
}

export async function createHouseRace(input: NewRaceInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const value = normalizedNewRace(input);
  const district = Number(input.district);
  if (!Number.isInteger(district) || district < 0 || district > 99) throw new Error("House district must be between 0 and 99.");
  const districtLabel = input.districtLabel?.trim() || (district === 0 ? "At-large" : `District ${district}`);
  return db.transaction(async (tx) => {
    const result = await tx.insert(houseRaces).values({ stateCode: value.stateCode, stateName: value.stateName, district, districtLabel, candidate1Name: value.candidate1Name, candidate1Party: value.candidate1Party, candidate2Name: value.candidate2Name, candidate2Party: value.candidate2Party, rating: value.rating, candidateSourceUrl: value.sourceUrl, candidateSourceLabel: value.sourceLabel, notes: value.editorNote || null });
    const id = Number((Array.isArray(result) ? result[0] : result as any)?.insertId ?? 0);
    await tx.insert(electionCandidateEdits).values({ contestType: "house", contestId: id, stateCode: value.stateCode, districtLabel, candidate1Name: value.candidate1Name, candidate1Party: value.candidate1Party, candidate2Name: value.candidate2Name, candidate2Party: value.candidate2Party, sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel, editorName: value.editorName, editorNote: value.editorNote || "Initial contest creation", previousValue: JSON.stringify({}) });
    return { id };
  });
}

export async function createGovernorRace(input: NewRaceInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const value = normalizedNewRace(input);
  if (value.candidate1Party !== "D" || value.candidate2Party !== "R") throw new Error("Governor creation requires the Democratic candidate first and Republican candidate second.");
  return db.transaction(async (tx) => {
    const result = await tx.insert(governorRaces).values({ stateCode: value.stateCode, stateName: value.stateName, previousParty: "I", rating: value.rating === "Safe D" ? "Solid D" : value.rating === "Safe R" ? "Solid R" : value.rating as any, demCandidate: value.candidate1Name, repCandidate: value.candidate2Name, candidateSourceUrl: value.sourceUrl, candidateSourceLabel: value.sourceLabel, notes: value.editorNote || null });
    const id = Number((Array.isArray(result) ? result[0] : result as any)?.insertId ?? 0);
    await tx.insert(governorCandidateEdits).values({ governorRaceId: id, stateCode: value.stateCode, demCandidate: value.candidate1Name, repCandidate: value.candidate2Name, sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel, editorName: value.editorName, editorNote: value.editorNote || "Initial contest creation", previousValue: JSON.stringify({}) });
    return { id };
  });
}

export async function updateReferendum(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(referendums).set(data as any).where(eq(referendums.id, id));
}

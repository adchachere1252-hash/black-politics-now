import { eq, desc, like, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { senateRaces, houseRaces, governorRaces, referendums } from "../drizzle/schema";

export async function getAllSenateRaces() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(senateRaces);
}

export async function getAllHouseRaces() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(houseRaces);
}

export async function getHouseRacesByState(stateCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(houseRaces).where(eq(houseRaces.stateCode, stateCode));
}

export async function getAllGovernorRaces() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(governorRaces);
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
  return { senate: senateResults, house: houseResults, governor: govResults };
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

export async function updateReferendum(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(referendums).set(data as any).where(eq(referendums.id, id));
}

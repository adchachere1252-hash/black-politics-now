import { getDb } from "./db";
import { blackRepresentationElections, cbcMembers, redistrictingStates } from "../drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";
import { photoWithRepositoryFallback } from "./candidatePhotoResolver";

export async function getAllCbcMembers() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(cbcMembers).orderBy(asc(cbcMembers.state), asc(cbcMembers.district));
  return rows.map((member) => ({ ...member, photo: photoWithRepositoryFallback(member.member, member.photo) }));
}

export async function getAllRedistrictingStates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(redistrictingStates).orderBy(asc(redistrictingStates.stateName));
}

export async function updateCbcMember(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(cbcMembers).set(data as any).where(eq(cbcMembers.id, id));
}

export async function getBlackRepresentationElections(stateCode?: string) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(blackRepresentationElections);
  if (stateCode) {
    return query.where(eq(blackRepresentationElections.stateCode, stateCode.toUpperCase()))
      .orderBy(asc(blackRepresentationElections.state), asc(blackRepresentationElections.district), desc(blackRepresentationElections.createdAt));
  }
  return query.orderBy(asc(blackRepresentationElections.state), asc(blackRepresentationElections.district), desc(blackRepresentationElections.createdAt));
}

export async function updateBlackRepresentationElection(id: number, data: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.update(blackRepresentationElections).set(data as any).where(eq(blackRepresentationElections.id, id));
}

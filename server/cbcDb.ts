import { getDb } from "./db";
import { blackRepresentationElections, candidateRemovalAudit, cbcMembers, redistrictingStates } from "../drizzle/schema";
import { and, asc, desc, eq } from "drizzle-orm";
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

function snapshot(value: Record<string, unknown>) {
  return JSON.stringify(value, (_key, current) => typeof current === "bigint" ? Number(current) : current);
}

function validateRemovalSource(sourceUrl?: string) {
  if (!sourceUrl) return null;
  const url = new URL(sourceUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Removal source must use HTTP or HTTPS.");
  return url.toString();
}

export async function removeBlackRepresentationProfile(input: { id: number; reason: string; sourceUrl?: string; removedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [member] = await db.select().from(cbcMembers).where(eq(cbcMembers.id, input.id)).limit(1);
  if (!member) throw new Error("Black Representation profile was not found.");
  const linkedContests = await db.select({ id: blackRepresentationElections.id }).from(blackRepresentationElections)
    .where(and(eq(blackRepresentationElections.stateCode, member.stateCode), eq(blackRepresentationElections.district, member.district))).limit(1);
  if (linkedContests.length) throw new Error("This profile has a linked contest record. Remove or correct the contest separately before removing the profile.");
  const sourceUrl = validateRemovalSource(input.sourceUrl);
  await db.transaction(async (tx) => {
    await tx.insert(candidateRemovalAudit).values({
      targetType: "black_representation_profile",
      targetId: member.id,
      displayName: member.member,
      stateCode: member.stateCode,
      district: member.district,
      reason: input.reason,
      sourceUrl,
      removedBy: input.removedBy,
      snapshotJson: snapshot(member as unknown as Record<string, unknown>),
    });
    await tx.delete(cbcMembers).where(eq(cbcMembers.id, member.id));
  });
  return { removed: true, displayName: member.member };
}

export async function removeBlackRepresentationElection(input: { id: number; reason: string; sourceUrl?: string; removedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const [contest] = await db.select().from(blackRepresentationElections).where(eq(blackRepresentationElections.id, input.id)).limit(1);
  if (!contest) throw new Error("Black Representation contest was not found.");
  const sourceUrl = validateRemovalSource(input.sourceUrl);
  await db.transaction(async (tx) => {
    await tx.insert(candidateRemovalAudit).values({
      targetType: "black_representation_contest",
      targetId: contest.id,
      displayName: contest.winnerName ?? `${contest.state} ${contest.district} contest`,
      stateCode: contest.stateCode,
      district: contest.district,
      reason: input.reason,
      sourceUrl,
      removedBy: input.removedBy,
      snapshotJson: snapshot(contest as unknown as Record<string, unknown>),
    });
    await tx.delete(blackRepresentationElections).where(eq(blackRepresentationElections.id, contest.id));
  });
  return { removed: true, displayName: contest.winnerName ?? `${contest.state} ${contest.district} contest` };
}

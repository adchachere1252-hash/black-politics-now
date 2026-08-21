import { getDb } from "./db";
import { blackRepresentationAdditionAudit, blackRepresentationElections, candidateRemovalAudit, cbcMembers, redistrictingStates } from "../drizzle/schema";
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
  if (!db) throw new Error("Database is unavailable.");
  const [existing] = await db.select({ id: cbcMembers.id }).from(cbcMembers).where(eq(cbcMembers.id, id)).limit(1);
  if (!existing) throw new Error("Black Representation profile was not found.");
  const update: Record<string, unknown> = {};
  const allowedStatuses = new Set(["running", "retiring", "resigned", "withdrawn", "deceased", "lost_primary", "running_for_governor", "running_for_senate", "not_up_2026", "challenger", "advanced_to_general", "in_runoff", "too_close_to_call", "elected", "won_general", "lost_general"]);
  if (data.status !== undefined) {
    if (typeof data.status !== "string" || !allowedStatuses.has(data.status)) throw new Error("Black Representation status is not supported.");
    update.status = data.status;
  }
  if (data.primaryResult !== undefined) {
    if (data.primaryResult !== null && typeof data.primaryResult !== "string") throw new Error("Primary result must be text or empty.");
    update.primaryResult = typeof data.primaryResult === "string" ? data.primaryResult.trim() || null : null;
  }
  if (data.notes !== undefined) {
    if (data.notes !== null && typeof data.notes !== "string") throw new Error("Profile notes must be text or empty.");
    update.notes = typeof data.notes === "string" ? data.notes.trim() || null : null;
  }
  if (!Object.keys(update).length) throw new Error("Choose at least one supported profile field to save.");
  await db.update(cbcMembers).set(update as any).where(eq(cbcMembers.id, id));
  return { updated: true };
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
  if (!db) throw new Error("Database is unavailable.");
  const [existing] = await db.select({ id: blackRepresentationElections.id }).from(blackRepresentationElections).where(eq(blackRepresentationElections.id, id)).limit(1);
  if (!existing) throw new Error("Black Representation contest was not found.");
  const update: Record<string, unknown> = {};
  const allowedStatuses = new Set(["called", "too_close_to_call", "upcoming", "uncontested", "withdrawn"]);
  if (data.resultStatus !== undefined) {
    if (typeof data.resultStatus !== "string" || !allowedStatuses.has(data.resultStatus)) throw new Error("Contest result status is not supported.");
    update.resultStatus = data.resultStatus;
  }
  for (const field of ["winnerName", "generalOpponent"] as const) {
    if (data[field] !== undefined) {
      if (data[field] !== null && typeof data[field] !== "string") throw new Error(`${field} must be text or empty.`);
      update[field] = typeof data[field] === "string" ? data[field].trim() || null : null;
    }
  }
  if (data.winnerVotes !== undefined) {
    if (data.winnerVotes !== null && (!Number.isInteger(data.winnerVotes) || Number(data.winnerVotes) < 0)) throw new Error("Winner votes must be a non-negative whole number.");
    update.winnerVotes = data.winnerVotes;
  }
  if (data.winnerVotePct !== undefined) {
    if (data.winnerVotePct !== null && (typeof data.winnerVotePct !== "number" || !Number.isFinite(data.winnerVotePct) || data.winnerVotePct < 0 || data.winnerVotePct > 100)) throw new Error("Winner percentage must be between 0 and 100.");
    update.winnerVotePct = data.winnerVotePct;
  }
  if (data.sourceUrl !== undefined) {
    if (data.sourceUrl !== null && typeof data.sourceUrl !== "string") throw new Error("Contest source must be text or empty.");
    update.sourceUrl = data.sourceUrl ? validateAdditionSource(data.sourceUrl) : null;
  }
  if (!Object.keys(update).length) throw new Error("Choose at least one supported contest field to save.");
  await db.update(blackRepresentationElections).set(update as any).where(eq(blackRepresentationElections.id, id));
  return { updated: true };
}

function insertedId(result: unknown) {
  return Number((Array.isArray(result) ? result[0] : result as any)?.insertId ?? 0);
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

function validateAdditionSource(sourceUrl: string) {
  const url = new URL(sourceUrl);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("A source URL must use HTTP or HTTPS.");
  return url.toString();
}

export type BlackRepresentationProfileInput = {
  district: string;
  member: string;
  party: "D" | "R" | "I";
  state: string;
  stateCode: string;
  chamber: "house" | "senate" | "governor";
  status: "running" | "retiring" | "resigned" | "withdrawn" | "deceased" | "lost_primary" | "running_for_governor" | "running_for_senate" | "not_up_2026" | "challenger" | "advanced_to_general" | "in_runoff" | "too_close_to_call" | "elected" | "won_general" | "lost_general";
  roleType: "incumbent" | "nominee" | "challenger" | "former_member" | "delegate";
  isCurrentMember: boolean;
  upIn2026: boolean;
  raceStage: "pre_primary" | "primary" | "runoff" | "general" | "special" | "called" | "not_up";
  sourceUrl: string;
  sourceLabel: string;
  additionNote?: string | null;
  addedBy: string;
};

export async function createBlackRepresentationProfile(input: BlackRepresentationProfileInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const sourceUrl = validateAdditionSource(input.sourceUrl);
  const stateCode = input.stateCode.trim().toUpperCase();
  if (stateCode.length !== 2) throw new Error("State code must have two letters.");
  return db.transaction(async (tx) => {
    const insert = await tx.insert(cbcMembers).values({
      district: input.district.trim(), member: input.member.trim(), party: input.party, state: input.state.trim(), stateCode,
      chamber: input.chamber, status: input.status, roleType: input.roleType, isCurrentMember: input.isCurrentMember,
      upIn2026: input.upIn2026, raceStage: input.raceStage, sourceUrl, sourceLabel: input.sourceLabel.trim(), notes: input.additionNote?.trim() || null,
    });
    const id = insertedId(insert);
    await tx.insert(blackRepresentationAdditionAudit).values({
      targetType: "black_representation_profile", targetId: id, displayName: input.member.trim(), stateCode, district: input.district.trim(),
      sourceUrl, sourceLabel: input.sourceLabel.trim(), addedBy: input.addedBy, additionNote: input.additionNote?.trim() || null,
      snapshotJson: snapshot({ ...input, sourceUrl, stateCode }),
    });
    return { id };
  });
}

export type BlackRepresentationContestInput = {
  district: string;
  state: string;
  stateCode: string;
  chamber: "house" | "senate" | "governor";
  electionType: "primary" | "runoff" | "general" | "special";
  resultStatus: "called" | "too_close_to_call" | "upcoming" | "uncontested" | "withdrawn";
  winnerName?: string | null;
  winnerParty?: string | null;
  runnerUpName?: string | null;
  runnerUpParty?: string | null;
  generalOpponent?: string | null;
  electionDate?: string | null;
  sourceUrl: string;
  sourceLabel: string;
  additionNote?: string | null;
  addedBy: string;
};

export async function createBlackRepresentationContest(input: BlackRepresentationContestInput) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable.");
  const sourceUrl = validateAdditionSource(input.sourceUrl);
  const stateCode = input.stateCode.trim().toUpperCase();
  if (stateCode.length !== 2) throw new Error("State code must have two letters.");
  return db.transaction(async (tx) => {
    const insert = await tx.insert(blackRepresentationElections).values({
      district: input.district.trim(), state: input.state.trim(), stateCode, chamber: input.chamber, electionType: input.electionType,
      resultStatus: input.resultStatus, winnerName: input.winnerName?.trim() || null, winnerParty: input.winnerParty?.trim() || null,
      runnerUpName: input.runnerUpName?.trim() || null, runnerUpParty: input.runnerUpParty?.trim() || null,
      generalOpponent: input.generalOpponent?.trim() || null, electionDate: input.electionDate?.trim() || null,
      sourceUrl, sourceLabel: input.sourceLabel.trim(), notes: input.additionNote?.trim() || null,
    });
    const id = insertedId(insert);
    await tx.insert(blackRepresentationAdditionAudit).values({
      targetType: "black_representation_contest", targetId: id, displayName: input.winnerName?.trim() || `${input.state.trim()} ${input.district.trim()} contest`,
      stateCode, district: input.district.trim(), sourceUrl, sourceLabel: input.sourceLabel.trim(), addedBy: input.addedBy,
      additionNote: input.additionNote?.trim() || null, snapshotJson: snapshot({ ...input, sourceUrl, stateCode }),
    });
    return { id };
  });
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

import { getDb } from "./db";
import { cbcMembers, redistrictingStates } from "../drizzle/schema";
import { asc, eq } from "drizzle-orm";

export async function getAllCbcMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cbcMembers).orderBy(asc(cbcMembers.state), asc(cbcMembers.district));
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

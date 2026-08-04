import { getDb } from "./db";
import { cbcMembers, redistrictingStates } from "../drizzle/schema";
import { asc } from "drizzle-orm";

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

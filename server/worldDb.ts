import { asc, eq } from "drizzle-orm";
import { worldElections } from "../drizzle/schema";
import { getDb } from "./db";

export async function getWorldElections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(worldElections).orderBy(asc(worldElections.electionDate), asc(worldElections.country));
}

export async function getWorldElectionsByCountry(countryCode: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(worldElections)
    .where(eq(worldElections.countryCode, countryCode.toUpperCase()))
    .orderBy(asc(worldElections.electionDate));
}

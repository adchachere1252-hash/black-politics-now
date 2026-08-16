import { desc } from "drizzle-orm";
import { getDb } from "./db";
import { dailyOperationalSnapshots } from "../drizzle/schema";

/** Returns the newest durable morning automation snapshot for the Admin Overview. */
export async function getLatestDailyOperationalSnapshot() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(dailyOperationalSnapshots).orderBy(desc(dailyOperationalSnapshots.snapshotDate)).limit(1);
  return rows[0] ?? null;
}

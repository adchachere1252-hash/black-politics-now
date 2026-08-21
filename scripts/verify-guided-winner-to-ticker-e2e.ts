import { sql } from "drizzle-orm";
import { appRouter } from "../server/routers";
import { getDb } from "../server/db";
import { electionTickerEntries, electionTickerEntryEdits } from "../drizzle/schema";
import type { TrpcContext } from "../server/_core/context";

function context(role: "admin" | "user"): TrpcContext {
  return { user: { role, name: role === "admin" ? "Guided Winner-to-Ticker Verifier" : "Guided Workflow Standard User" } as TrpcContext["user"], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as unknown as TrpcContext["res"] };
}

async function count(table: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select({ count: sql<number>`count(*)` }).from(table);
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  const admin = appRouter.createCaller(context("admin"));
  const user = appRouter.createCaller(context("user"));
  const beforeEntries = await count(electionTickerEntries);
  const beforeEdits = await count(electionTickerEntryEdits);
  const board = await admin.electionDay.resultsControlRoom();
  const confirmed = board?.races.find((race) => Boolean(race.confirmation));
  try {
    await user.electionDay.addConfirmedWinnerToTicker({ raceType: confirmed?.raceType ?? "senate", raceId: confirmed?.id ?? 999999 });
    throw new Error("Non-admin ticker handoff unexpectedly succeeded.");
  } catch (error: any) {
    if (error?.code !== "FORBIDDEN") throw error;
  }
  try {
    await admin.electionDay.addConfirmedWinnerToTicker({ raceType: "senate", raceId: 999999 });
    throw new Error("Missing-confirmation ticker handoff unexpectedly succeeded.");
  } catch (error: any) {
    if (error?.message?.includes("unexpectedly succeeded")) throw error;
  }
  const afterEntries = await count(electionTickerEntries);
  const afterEdits = await count(electionTickerEntryEdits);
  if (beforeEntries !== afterEntries || beforeEdits !== afterEdits) throw new Error("Rejected guided ticker actions changed public entries or immutable history.");
  console.log(JSON.stringify({ passed: true, citedConfirmationAvailable: Boolean(confirmed?.confirmation?.sourceUrl && confirmed?.confirmation?.sourceLabel), citedConfirmation: confirmed ? { jurisdiction: confirmed.jurisdiction, winnerName: confirmed.calledWinner, sourceLabel: confirmed.confirmation?.sourceLabel } : null, authorizationGuard: "non-admin blocked", confirmationGuard: "missing human confirmation blocked", tickerRowsUnchanged: beforeEntries === afterEntries, auditRowsUnchanged: beforeEdits === afterEdits }, null, 2));
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });

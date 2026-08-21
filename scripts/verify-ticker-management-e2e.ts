import { eq, sql } from "drizzle-orm";
import { appRouter } from "../server/routers";
import { getDb } from "../server/db";
import { electionTickerEntries, electionTickerEntryEdits } from "../drizzle/schema";
import type { TrpcContext } from "../server/_core/context";

function context(role: "admin" | "user"): TrpcContext {
  return { user: { role, name: role === "admin" ? "Ticker E2E Verifier" : "Ticker E2E Standard User" } as TrpcContext["user"], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as unknown as TrpcContext["res"] };
}

async function countRows(table: any) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const rows = await db.select({ count: sql<number>`count(*)` }).from(table);
  return Number(rows[0]?.count ?? 0);
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const admin = appRouter.createCaller(context("admin"));
  const user = appRouter.createCaller(context("user"));
  const beforeEntries = await countRows(electionTickerEntries);
  const beforeAudits = await countRows(electionTickerEntryEdits);
  const publicEntries = await user.election.tickerEntries();
  const adminEntries = await admin.election.tickerEntriesAdmin();
  if (!Array.isArray(publicEntries) || !Array.isArray(adminEntries)) throw new Error("Ticker entry queries did not return lists.");
  if (publicEntries.some((entry: any) => !entry.isActive)) throw new Error("Public ticker returned an inactive entry.");
  try {
    await user.election.createTickerEntry({ jurisdiction: "E2E-1", chamber: "House", winnerName: "Unauthorized Candidate", winnerParty: "D", sourceLabel: "E2E guard", sourceUrl: "https://evidence.example/e2e" });
    throw new Error("Non-admin ticker creation unexpectedly succeeded.");
  } catch (error: any) {
    if (error?.code !== "FORBIDDEN") throw error;
  }
  try {
    await admin.election.createTickerEntry({ jurisdiction: "E2E-1", chamber: "House", winnerName: "Invalid Evidence Candidate", winnerParty: "D", sourceLabel: "E2E guard", sourceUrl: "ftp://evidence.example/e2e" });
    throw new Error("FTP ticker evidence unexpectedly succeeded.");
  } catch (error: any) {
    if (error?.message?.includes("unexpectedly succeeded")) throw error;
  }
  const afterEntries = await countRows(electionTickerEntries);
  const afterAudits = await countRows(electionTickerEntryEdits);
  if (beforeEntries !== afterEntries || beforeAudits !== afterAudits) throw new Error("Rejected ticker tests changed public entries or immutable audit history.");
  const activeRows = await db.select().from(electionTickerEntries).where(eq(electionTickerEntries.isActive, true));
  if (activeRows.length !== publicEntries.length) throw new Error("Public ticker list does not match active persisted ticker entries.");
  console.log(JSON.stringify({ passed: true, publicTickerEntries: publicEntries.length, adminTickerEntries: adminEntries.length, entryRowsUnchanged: beforeEntries === afterEntries, auditRowsUnchanged: beforeAudits === afterAudits, sourceGuard: "HTTP/HTTPS enforced", authorizationGuard: "non-admin blocked" }, null, 2));
}

main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });

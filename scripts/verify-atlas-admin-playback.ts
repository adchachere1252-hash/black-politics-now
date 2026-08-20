import { desc } from "drizzle-orm";
import { appRouter } from "../server/routers";
import { getDb } from "../server/db";
import { atlasOperationsAudits } from "../drizzle/schema";
import type { TrpcContext } from "../server/_core/context";

async function main() {
  const context: TrpcContext = {
    user: { role: "admin", name: "Atlas Verification" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
  const caller = appRouter.createCaller(context);
  const before = await caller.atlasOperations.health();
  const result = await caller.atlasOperations.runPlaybackCheck();
  const after = await caller.atlasOperations.health();
  const db = await getDb();
  const [durableAudit] = db ? await db.select().from(atlasOperationsAudits).orderBy(desc(atlasOperationsAudits.createdAt)).limit(1) : [];
  const payload = {
    status: result.status,
    summary: result.summary,
    readyFrames: result.readyFrames,
    checkedCongresses: result.checkedCongresses,
    sequencePassed: result.sequencePassed,
    readinessGuardPassed: result.readinessGuardPassed,
    pauseGuardPassed: result.pauseGuardPassed,
    previousAuditCount: before.recentAudits.length,
    refreshedAuditCount: after.recentAudits.length,
    latestAuditMatchesResult: after.recentAudits[0]?.id === result.audit?.id,
    durableAuditId: durableAudit?.id ?? null,
    durableAuditStatus: durableAudit?.status ?? null,
    durableAuditInitiatedBy: durableAudit?.initiatedBy ?? null,
  };
  const passed = payload.status === "passed"
    && payload.readyFrames === 31
    && payload.checkedCongresses === 31
    && payload.sequencePassed
    && payload.readinessGuardPassed
    && payload.pauseGuardPassed
    && payload.refreshedAuditCount === payload.previousAuditCount + 1
    && payload.latestAuditMatchesResult
    && payload.durableAuditStatus === "passed";
  console.log(JSON.stringify({ passed, ...payload }, null, 2));
  if (!passed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

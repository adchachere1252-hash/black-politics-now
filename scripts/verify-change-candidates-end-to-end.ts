import { and, isNotNull } from "drizzle-orm";
import { houseRaces, governorRaces, senateRaces } from "../drizzle/schema";
import { getDb } from "../server/db";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function adminContext(): TrpcContext {
  return {
    user: { role: "admin", name: "Candidate Save Verification" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const senate = (await db.select().from(senateRaces).where(and(isNotNull(senateRaces.candidate1Name), isNotNull(senateRaces.candidate2Name), isNotNull(senateRaces.candidateSourceUrl))).limit(1))[0];
  const house = (await db.select().from(houseRaces).where(and(isNotNull(houseRaces.candidate1Name), isNotNull(houseRaces.candidate2Name), isNotNull(houseRaces.candidateSourceUrl))).limit(1))[0];
  const governor = (await db.select().from(governorRaces).where(and(isNotNull(governorRaces.demCandidate), isNotNull(governorRaces.repCandidate), isNotNull(governorRaces.candidateSourceUrl))).limit(1))[0];
  if (!senate && !house && !governor) throw new Error("No source-backed contest available for end-to-end verification.");
  const caller = appRouter.createCaller(adminContext());
  const auditNote = "End-to-end save verification; candidate fields intentionally unchanged.";

  if (senate) await caller.election.updateSenateCandidateLog({ id: senate.id, candidate1Name: senate.candidate1Name!, candidate1Party: senate.candidate1Party as "D" | "R" | "I" | "L" | "G", candidate2Name: senate.candidate2Name!, candidate2Party: senate.candidate2Party as "D" | "R" | "I" | "L" | "G", candidateSourceUrl: senate.candidateSourceUrl!, candidateSourceLabel: senate.candidateSourceLabel ?? "Verification source", editorNote: auditNote });
  if (house) await caller.election.updateHouseCandidateLog({ id: house.id, candidate1Name: house.candidate1Name!, candidate1Party: house.candidate1Party as "D" | "R" | "I" | "L" | "G", candidate2Name: house.candidate2Name!, candidate2Party: house.candidate2Party as "D" | "R" | "I" | "L" | "G", candidateSourceUrl: house.candidateSourceUrl!, candidateSourceLabel: house.candidateSourceLabel ?? "Verification source", editorNote: auditNote });
  if (governor) await caller.election.updateGovernorCandidateLog({ id: governor.id, demCandidate: governor.demCandidate!, repCandidate: governor.repCandidate!, demPreviousOffice: governor.demPreviousOffice, repPreviousOffice: governor.repPreviousOffice, candidateSourceUrl: governor.candidateSourceUrl!, candidateSourceLabel: governor.candidateSourceLabel ?? "Verification source", editorNote: auditNote });

  const [publicSenate, publicHouse, publicGovernors, senateHistory, houseHistory, governorHistory] = await Promise.all([
    caller.election.senate(),
    caller.election.house(),
    caller.election.governors(),
    senate ? caller.election.senateCandidateHistory({ id: senate.id }) : Promise.resolve([]),
    house ? caller.election.houseCandidateHistory({ id: house.id }) : Promise.resolve([]),
    governor ? caller.election.governorCandidateHistory({ id: governor.id }) : Promise.resolve([]),
  ]);
  const verified = {
    senate: senate ? publicSenate.some((race) => race.id === senate.id && race.candidate1Name === senate.candidate1Name && race.candidate2Name === senate.candidate2Name) && senateHistory.some((item) => item.editorNote === auditNote) : "no reviewed source-backed record available",
    house: house ? publicHouse.some((race) => race.id === house.id && race.candidate1Name === house.candidate1Name && race.candidate2Name === house.candidate2Name) && houseHistory.some((item) => item.editorNote === auditNote) : "no reviewed source-backed record available",
    governor: governor ? publicGovernors.some((race) => race.id === governor.id && race.demCandidate === governor.demCandidate && race.repCandidate === governor.repCandidate) && governorHistory.some((item) => item.editorNote === auditNote) : "no reviewed source-backed record available",
  };
  if (Object.values(verified).some((value) => value === false)) throw new Error(`Candidate save verification failed: ${JSON.stringify(verified)}`);
  console.log(JSON.stringify({ verified, contestIds: { senate: senate?.id ?? null, house: house?.id ?? null, governor: governor?.id ?? null } }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

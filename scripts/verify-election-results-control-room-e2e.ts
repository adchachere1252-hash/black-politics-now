import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function createContext(role: "admin" | "user" | "public"): TrpcContext {
  return {
    user: role === "public" ? null : { role, name: role === "admin" ? "Election Results E2E Verifier" : "Standard User" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const admin = appRouter.createCaller(createContext("admin"));
const user = appRouter.createCaller(createContext("user"));
const publicCaller = appRouter.createCaller(createContext("public"));

const board = await admin.electionDay.resultsControlRoom();
if (!board) throw new Error("The control-room board did not return a snapshot.");
if (board.summary.total !== board.races.length) throw new Error("Control-room total does not match returned race rows.");
if (!board.races.every((race) => ["senate", "house", "governor"].includes(race.raceType) && typeof race.reportingPct === "number" && Array.isArray(race.candidates) && Array.isArray(race.confirmableCandidates))) {
  throw new Error("One or more control-room race rows failed the expected data contract.");
}
await user.electionDay.resultsControlRoom().then(() => { throw new Error("A non-admin user reached the control room."); }).catch((error: any) => {
  if (error?.code !== "FORBIDDEN") throw error;
});

const [senate, house, governors] = await Promise.all([publicCaller.election.senate(), publicCaller.election.house(), publicCaller.election.governors()]);
const publicCount = senate.length + house.length + governors.length;
if (publicCount !== board.summary.total) throw new Error(`Public race count ${publicCount} does not match control-room count ${board.summary.total}.`);

const confirmationCandidate = board.races.find((race) => race.confirmableCandidates.length > 0);
if (!confirmationCandidate) throw new Error("No mapped race was available for the invalid-confirmation guard check.");
const activityCountBeforeInvalidAttempt = board.activity.length;
await admin.electionDay.confirmResult({
  raceType: confirmationCandidate.raceType,
  raceId: confirmationCandidate.id,
  winnerName: "Unmapped Candidate",
  winnerParty: "D",
  sourceLabel: "E2E guardrail verification",
  sourceUrl: "https://evidence.example/e2e-guardrail",
}).then(() => { throw new Error("An unmapped candidate was accepted as a winner."); }).catch((error: any) => {
  if (!String(error?.message ?? error).includes("Choose a currently mapped Democratic, Republican, or Independent candidate")) throw error;
});
const boardAfterInvalidAttempt = await admin.electionDay.resultsControlRoom();
if (!boardAfterInvalidAttempt || boardAfterInvalidAttempt.activity.length !== activityCountBeforeInvalidAttempt) throw new Error("The invalid confirmation attempt changed the immutable operator ledger.");
const invalidAttemptRaceAfter = boardAfterInvalidAttempt.races.find((race) => race.raceType === confirmationCandidate.raceType && race.id === confirmationCandidate.id);
if (!invalidAttemptRaceAfter || invalidAttemptRaceAfter.calledWinner !== confirmationCandidate.calledWinner || invalidAttemptRaceAfter.status !== confirmationCandidate.status) throw new Error("The invalid confirmation attempt changed a public race record.");

const publicRecordsByType = { senate, house, governor: governors } as const;
const calledRace = board.races.find((race) => race.calledWinner);
if (!calledRace) throw new Error("No existing public called result was available for consistency verification.");
const matchingPublicCalledRace = (publicRecordsByType[calledRace.raceType] as any[]).find((race) => race.id === calledRace.id);
if (!matchingPublicCalledRace || matchingPublicCalledRace.calledWinner !== calledRace.calledWinner || matchingPublicCalledRace.calledParty !== calledRace.calledParty) {
  throw new Error("A stored called result does not match the control-room view.");
}

console.log(JSON.stringify({
  passed: true,
  generatedAt: board.generatedAt,
  heartbeat: board.heartbeat,
  summary: board.summary,
  rows: {
    senate: board.races.filter((race) => race.raceType === "senate").length,
    house: board.races.filter((race) => race.raceType === "house").length,
    governor: board.races.filter((race) => race.raceType === "governor").length,
    publicTotal: publicCount,
  },
  sourceConflicts: board.sourceConflicts.length,
  confirmationLedgerEntries: board.activity.length,
  invalidConfirmationGuard: { race: confirmationCandidate.jurisdiction, activityCountBeforeInvalidAttempt, activityCountAfterInvalidAttempt: boardAfterInvalidAttempt.activity.length, publicRaceUnchanged: true },
  publicCalledResult: { race: calledRace.jurisdiction, winner: calledRace.calledWinner, party: calledRace.calledParty, matchesPublicQuery: true },
  note: "No result was written. This verifies the Admin board against public race counts, confirms non-admin blocking, rejects an unmapped winner without mutation, and checks a stored called result against the public query.",
}, null, 2));

process.exit(0);

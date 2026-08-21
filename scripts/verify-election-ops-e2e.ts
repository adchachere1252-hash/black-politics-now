import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function createContext(role: "admin" | "user" | "public"): TrpcContext {
  return {
    user: role === "public" ? null : { role, name: role === "admin" ? "Election Ops E2E Verifier" : "Standard User" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const admin = appRouter.createCaller(createContext("admin"));
const user = appRouter.createCaller(createContext("user"));
const publicCaller = appRouter.createCaller(createContext("public"));

const [senateBefore, houseBefore, governorBefore, sourceConflicts, commandCenter] = await Promise.all([
  publicCaller.election.senate(),
  publicCaller.election.house(),
  publicCaller.election.governors(),
  admin.electionDay.sourceConflicts(),
  admin.electionDay.commandCenter(),
]);
if (!senateBefore.length || !houseBefore.length || !governorBefore.length) throw new Error("Election Ops public chamber data is incomplete.");

const senate = senateBefore.find((race) => race.candidate1Name && race.candidate2Name && race.candidate1Party && race.candidate2Party && race.candidateSourceUrl) as any;
const house = houseBefore.find((race) => race.candidate1Name && race.candidate2Name && race.candidate1Party && race.candidate2Party && race.candidateSourceUrl) as any;
const governor = governorBefore.find((race) => race.demCandidate && race.repCandidate && race.candidateSourceUrl) as any;
if (!senate || !house || !governor) throw new Error("A source-backed Senate, House, or Governor record was unavailable for verification.");

const senateHistoryBefore = await admin.election.senateCandidateHistory({ id: senate.id });
const houseHistoryBefore = await admin.election.houseCandidateHistory({ id: house.id });
const governorHistoryBefore = await admin.election.governorCandidateHistory({ id: governor.id });

const senateInput = { id: senate.id, candidate1Name: senate.candidate1Name, candidate1Party: senate.candidate1Party, candidate2Name: senate.candidate2Name, candidate2Party: senate.candidate2Party, candidateSourceUrl: "https://evidence.example/senate", candidateSourceLabel: "Election Ops E2E evidence" } as const;
await user.election.updateSenateCandidateLog(senateInput).then(() => { throw new Error("A non-admin user changed a Senate candidate log."); }).catch((error: any) => {
  if (error?.code !== "FORBIDDEN") throw error;
});

const attempts = [
  admin.election.updateSenateCandidateLog({ ...senateInput, candidateSourceUrl: "ftp://invalid.example/senate" }),
  admin.election.updateHouseCandidateLog({ id: house.id, candidate1Name: house.candidate1Name, candidate1Party: house.candidate1Party, candidate2Name: house.candidate2Name, candidate2Party: house.candidate2Party, candidateSourceUrl: "ftp://invalid.example/house", candidateSourceLabel: "Election Ops E2E evidence" }),
  admin.election.updateGovernorCandidateLog({ id: governor.id, demCandidate: governor.demCandidate, repCandidate: governor.repCandidate, demPreviousOffice: governor.demPreviousOffice ?? null, repPreviousOffice: governor.repPreviousOffice ?? null, candidateSourceUrl: "ftp://invalid.example/governor", candidateSourceLabel: "Election Ops E2E evidence" }),
];
for (const attempt of attempts) {
  await attempt.then(() => { throw new Error("An FTP candidate source was accepted by Election Ops."); }).catch((error: any) => {
    if (!String(error?.message ?? error).includes("Source URL must use HTTP or HTTPS")) throw error;
  });
}

const [senateAfter, houseAfter, governorAfter, senateHistoryAfter, houseHistoryAfter, governorHistoryAfter] = await Promise.all([
  publicCaller.election.senate(),
  publicCaller.election.house(),
  publicCaller.election.governors(),
  admin.election.senateCandidateHistory({ id: senate.id }),
  admin.election.houseCandidateHistory({ id: house.id }),
  admin.election.governorCandidateHistory({ id: governor.id }),
]);
const findPublic = (rows: any[], id: number) => rows.find((row) => row.id === id);
const senateAfterRecord = findPublic(senateAfter, senate.id);
const houseAfterRecord = findPublic(houseAfter, house.id);
const governorAfterRecord = findPublic(governorAfter, governor.id);
if (!senateAfterRecord || !houseAfterRecord || !governorAfterRecord) throw new Error("A verified Election Ops race disappeared from its public query.");
if (senateAfterRecord.candidate1Name !== senate.candidate1Name || senateAfterRecord.candidate2Name !== senate.candidate2Name || houseAfterRecord.candidate1Name !== house.candidate1Name || houseAfterRecord.candidate2Name !== house.candidate2Name || governorAfterRecord.demCandidate !== governor.demCandidate || governorAfterRecord.repCandidate !== governor.repCandidate) throw new Error("An invalid source attempt changed public candidate data.");
if (senateHistoryAfter.length !== senateHistoryBefore.length || houseHistoryAfter.length !== houseHistoryBefore.length || governorHistoryAfter.length !== governorHistoryBefore.length) throw new Error("An invalid source attempt changed private candidate audit history.");

console.log(JSON.stringify({
  passed: true,
  publicBoard: { senate: senateAfter.length, house: houseAfter.length, governor: governorAfter.length },
  protectedAccess: { nonAdminCandidateChangeBlocked: true },
  sourceGuards: { senateFtpBlocked: true, houseFtpBlocked: true, governorFtpBlocked: true, publicRecordsUnchanged: true, privateHistoriesUnchanged: true },
  sourceBackedRecords: {
    senate: { id: senate.id, stateCode: senate.stateCode, sourceRetained: Boolean(senate.candidateSourceUrl) },
    house: { id: house.id, stateCode: house.stateCode, district: house.districtLabel, sourceRetained: Boolean(house.candidateSourceUrl) },
    governor: { id: governor.id, stateCode: governor.stateCode, sourceRetained: Boolean(governor.candidateSourceUrl), historyCount: governorHistoryAfter.length },
  },
  operationalReview: { sourceConflictCount: Array.isArray(sourceConflicts) ? sourceConflicts.length : 0, commandCenterAvailable: Boolean(commandCenter) },
  note: "No candidate, race, vote total, call, conflict, or audit record was created or altered during verification.",
}, null, 2));

process.exit(0);

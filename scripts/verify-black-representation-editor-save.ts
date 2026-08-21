import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: { role: "admin", name: "Black Representation Save Verifier" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const admin = appRouter.createCaller(createAdminContext());
const publicCaller = appRouter.createCaller(createPublicContext());
const profiles = await publicCaller.election.cbc() as any[];
const contests = await publicCaller.election.blackRepresentationElections() as any[];
const profile = profiles.find((record) => record.member === "Maxwell Frost" && record.district === "FL-10") ?? profiles[0];
const contest = contests.find((record) => record.district === "FL-10") ?? contests[0];

if (!profile || !contest) throw new Error("No existing Black Representation profile and contest were available for non-destructive verification.");

await admin.election.updateCbc({
  id: profile.id,
  data: { status: profile.status, primaryResult: profile.primaryResult ?? null, notes: profile.notes ?? null },
});
await admin.election.updateBlackRepresentationElection({
  id: contest.id,
  data: {
    resultStatus: contest.resultStatus,
    winnerName: contest.winnerName ?? null,
    winnerVotes: contest.winnerVotes ?? null,
    winnerVotePct: contest.winnerVotePct === null || contest.winnerVotePct === undefined ? null : Number(contest.winnerVotePct),
    generalOpponent: contest.generalOpponent ?? null,
    sourceUrl: contest.sourceUrl ?? null,
  },
});

const refreshedProfiles = await publicCaller.election.cbc() as any[];
const refreshedContests = await publicCaller.election.blackRepresentationElections() as any[];
const refreshedProfile = refreshedProfiles.find((record) => record.id === profile.id);
const refreshedContest = refreshedContests.find((record) => record.id === contest.id);

if (!refreshedProfile || refreshedProfile.status !== profile.status || refreshedProfile.primaryResult !== (profile.primaryResult ?? null)) {
  throw new Error("Profile save did not persist to the public Black Representation query.");
}
if (!refreshedContest || refreshedContest.resultStatus !== contest.resultStatus || refreshedContest.winnerName !== (contest.winnerName ?? null)) {
  throw new Error("Contest save did not persist to the public Black Representation query.");
}

console.log(JSON.stringify({
  passed: true,
  profile: { id: refreshedProfile.id, member: refreshedProfile.member, district: refreshedProfile.district, status: refreshedProfile.status },
  contest: { id: refreshedContest.id, district: refreshedContest.district, resultStatus: refreshedContest.resultStatus, winnerName: refreshedContest.winnerName },
  note: "Existing records were re-saved unchanged through protected procedures; no fabricated public data was created.",
}, null, 2));

process.exit(0);

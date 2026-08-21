import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function createContext(role: "admin" | "user" | "public"): TrpcContext {
  return {
    user: role === "public" ? null : { role, name: role === "admin" ? "Portrait Workflow E2E Verifier" : "Standard User" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const admin = appRouter.createCaller(createContext("admin"));
const user = appRouter.createCaller(createContext("user"));
const publicCaller = appRouter.createCaller(createContext("public"));

const [missingTargets, managementTargets, allSubmissions] = await Promise.all([
  admin.portraits.targets(),
  admin.portraits.managementTargets(),
  admin.portraits.submissions(),
]);
if (!managementTargets.length) throw new Error("Portrait management target discovery returned no candidates.");
if (!missingTargets.every((missing) => managementTargets.some((target) => target.targetType === missing.targetType && target.targetRecordId === missing.targetRecordId && target.targetPhotoField === missing.targetPhotoField && target.candidateName === missing.candidateName))) {
  throw new Error("A missing-photo target was not available in the all-candidate management directory.");
}

await user.portraits.targets().then(() => { throw new Error("A non-admin reached Portrait Review targets."); }).catch((error: any) => {
  if (error?.code !== "FORBIDDEN") throw error;
});

const invalidTarget = managementTargets[0]!;
await user.portraits.researchNow({
  targetType: invalidTarget.targetType,
  targetRecordId: invalidTarget.targetRecordId,
  targetPhotoField: invalidTarget.targetPhotoField,
  candidateName: invalidTarget.candidateName,
}).then(() => { throw new Error("A non-admin was able to queue candidate portrait research."); }).catch((error: any) => {
  if (error?.code !== "FORBIDDEN") throw error;
});
const submissionCountBeforeInvalid = allSubmissions.length;
await admin.portraits.submit({
  ...invalidTarget,
  candidateName: "Unmatched Candidate",
  imageUrl: "https://example.com/nonexistent-portrait.jpg",
  sourceUrl: "https://example.com/provenance",
  provenanceType: "official_campaign",
  submissionNote: "Non-destructive guardrail verification",
}).then(() => { throw new Error("A mismatched candidate name was accepted for a portrait target."); }).catch((error: any) => {
  if (!String(error?.message ?? error).includes("Candidate name does not match")) throw error;
});
const submissionsAfterInvalid = await admin.portraits.submissions();
if (submissionsAfterInvalid.length !== submissionCountBeforeInvalid) throw new Error("The invalid submission created a portrait queue item.");

const pending = allSubmissions.find((submission) => submission.status === "pending");
if (pending) {
  await admin.portraits.review({ id: pending.id, decision: "rejected" }).then(() => { throw new Error("A denial without a reason was accepted."); }).catch((error: any) => {
    if (!String(error?.message ?? error).includes("A rejection reason is required")) throw error;
  });
  const pendingAfterInvalidDenial = (await admin.portraits.submissions({ status: "pending" })).find((submission) => submission.id === pending.id);
  if (!pendingAfterInvalidDenial || pendingAfterInvalidDenial.status !== "pending") throw new Error("A denial without a reason altered the pending portrait submission.");
}

const approved = allSubmissions.find((submission) => submission.status === "approved" && submission.appliedPhotoUrl);
if (!approved) throw new Error("No approved portrait submission was available to verify public application.");
const publicRecords = {
  senate: await publicCaller.election.senate(),
  house: await publicCaller.election.house(),
  governor: await publicCaller.election.governors(),
  black_representation: await publicCaller.election.cbc(),
} as const;
const matchingPublicRecord = (publicRecords[approved.targetType] as any[]).find((record) => record.id === approved.targetRecordId);
if (!matchingPublicRecord) throw new Error("The approved portrait target is absent from the public query.");
const publicPhoto = approved.targetType === "senate" || approved.targetType === "house"
  ? approved.targetPhotoField === "candidate1" ? matchingPublicRecord.candidate1Photo : matchingPublicRecord.candidate2Photo
  : approved.targetType === "governor"
    ? approved.targetPhotoField === "dem" ? matchingPublicRecord.demPhoto : matchingPublicRecord.repPhoto
    : matchingPublicRecord.photo;
if (publicPhoto !== approved.appliedPhotoUrl) throw new Error("The approved portrait does not match the public candidate record.");

console.log(JSON.stringify({
  passed: true,
  discovery: { missingPhotoTargets: missingTargets.length, managementTargets: managementTargets.length, missingTargetsIncludedInDirectory: true },
  guardrails: { nonAdminBlocked: true, nonAdminResearchBlocked: true, mismatchedCandidateSubmissionBlocked: true, invalidSubmissionCreatedNoRecord: true, rejectionWithoutReasonBlocked: Boolean(pending), pendingItemUnchanged: Boolean(pending) },
  approvedPublicApplication: { submissionId: approved.id, candidateName: approved.candidateName, targetType: approved.targetType, targetRecordId: approved.targetRecordId, appliedPhotoMatchesPublicRecord: true, reviewSourceRetained: Boolean(approved.sourceUrl), reviewedBy: approved.reviewedBy },
  queue: { total: allSubmissions.length, pending: allSubmissions.filter((item) => item.status === "pending").length, approved: allSubmissions.filter((item) => item.status === "approved").length, rejected: allSubmissions.filter((item) => item.status === "rejected").length },
  note: "No new portrait, candidate, or review decision was written during this verification.",
}, null, 2));

process.exit(0);

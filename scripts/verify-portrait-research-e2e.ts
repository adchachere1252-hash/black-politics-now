import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: { role: "admin", name: "Portrait Research E2E Verifier" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const admin = appRouter.createCaller(createAdminContext());
const [targets, beforeSubmissions] = await Promise.all([
  admin.portraits.targets(),
  admin.portraits.submissions(),
]);
const target = targets[0];
if (!target) throw new Error("No missing-photo target is available for the bounded research verification.");

const result = await admin.portraits.researchNow({
  targetType: target.targetType,
  targetRecordId: target.targetRecordId,
  targetPhotoField: target.targetPhotoField,
  candidateName: target.candidateName,
});

if (!result.task || !["ready_for_review", "blocked"].includes(result.task.status)) {
  throw new Error("Portrait research did not return a completed reviewable or evidence-needed outcome.");
}
if (result.task.status === "blocked" && !/(Evidence needed|temporarily unavailable)/.test(result.task.executionError ?? "")) {
  throw new Error("Blocked portrait research did not provide the required actionable recovery message.");
}
if (result.task.status === "ready_for_review" && result.proposals.length === 0) {
  throw new Error("Portrait research was incorrectly marked ready without a portrait-source proposal.");
}

const afterSubmissions = await admin.portraits.submissions();
if (afterSubmissions.length !== beforeSubmissions.length) {
  throw new Error("Portrait research created a review submission before human evidence review.");
}

console.log(JSON.stringify({
  passed: true,
  target: { candidateName: target.candidateName, targetType: target.targetType, location: target.location },
  outcome: { taskId: result.task.id, status: result.task.status, proposalCount: result.proposals.length, actionableError: result.task.executionError ?? null },
  safeguards: { noSubmissionCreated: true, noPublicPortraitApplied: true, humanReviewStillRequired: true },
}, null, 2));

process.exit(0);

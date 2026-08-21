import { desc, eq } from "drizzle-orm";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";
import { blackRepresentationAdditionAudit } from "../drizzle/schema";
import { getDb } from "../server/db";

function createContext(role: "admin" | "user" | "public"): TrpcContext {
  return {
    user: role === "public" ? null : { role, name: role === "admin" ? "Add Black Rep Profile E2E Verifier" : "Standard User" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

const admin = appRouter.createCaller(createContext("admin"));
const user = appRouter.createCaller(createContext("user"));
const publicCaller = appRouter.createCaller(createContext("public"));
const db = await getDb();
if (!db) throw new Error("Database unavailable for Black Rep Profile E2E verification.");

const [publicBefore, auditBefore] = await Promise.all([
  publicCaller.election.cbc(),
  db.select().from(blackRepresentationAdditionAudit).where(eq(blackRepresentationAdditionAudit.targetType, "black_representation_profile")).orderBy(desc(blackRepresentationAdditionAudit.addedAt)),
]);
if (!auditBefore.length) throw new Error("No existing Black Representation profile addition audit record was available for verification.");

const reference = auditBefore.find((item) => publicBefore.some((profile) => profile.id === item.targetId));
if (!reference) throw new Error("No audited Black Representation profile was visible through the public profile query.");
if (!reference.sourceUrl || !reference.sourceLabel || !reference.addedBy || !reference.snapshotJson) throw new Error("The existing Black Representation addition audit record is incomplete.");

const invalidInput = {
  district: "E2E District",
  member: "Example Verification Candidate",
  party: "D" as const,
  state: "Example State",
  stateCode: "EX",
  chamber: "house" as const,
  status: "running" as const,
  roleType: "challenger" as const,
  isCurrentMember: false,
  upIn2026: true,
  raceStage: "general" as const,
  sourceUrl: "ftp://invalid.example/profile",
  sourceLabel: "Guardrail verification source",
};

await user.election.createBlackRepresentationProfile({ ...invalidInput, sourceUrl: "https://evidence.example/profile" }).then(() => { throw new Error("A non-admin user created a Black Representation profile."); }).catch((error: any) => {
  if (error?.code !== "FORBIDDEN") throw error;
});
await admin.election.createBlackRepresentationProfile(invalidInput).then(() => { throw new Error("An invalid source protocol created a Black Representation profile."); }).catch((error: any) => {
  if (!String(error?.message ?? error).includes("A source URL must use HTTP or HTTPS")) throw error;
});

const [publicAfterInvalid, auditAfterInvalid] = await Promise.all([
  publicCaller.election.cbc(),
  db.select().from(blackRepresentationAdditionAudit).where(eq(blackRepresentationAdditionAudit.targetType, "black_representation_profile")).orderBy(desc(blackRepresentationAdditionAudit.addedAt)),
]);
if (publicAfterInvalid.length !== publicBefore.length) throw new Error("An invalid profile request changed the public Black Representation list.");
if (auditAfterInvalid.length !== auditBefore.length) throw new Error("An invalid profile request changed the immutable addition audit ledger.");

const verifiedPublicProfile = publicAfterInvalid.find((profile) => profile.id === reference.targetId);
if (!verifiedPublicProfile || verifiedPublicProfile.member !== reference.displayName || verifiedPublicProfile.stateCode !== reference.stateCode || verifiedPublicProfile.district !== reference.district) {
  throw new Error("The audited source-backed profile does not match the public Black Representation record.");
}

console.log(JSON.stringify({
  passed: true,
  publicProfileCount: publicAfterInvalid.length,
  profileAdditionAuditCount: auditAfterInvalid.length,
  protectedAccess: { nonAdminCreationBlocked: true },
  validation: { invalidSourceProtocolBlocked: true, publicListUnchanged: true, auditLedgerUnchanged: true },
  existingProfileAndAudit: { targetId: reference.targetId, member: reference.displayName, stateCode: reference.stateCode, district: reference.district, sourceRetained: true, addedBy: reference.addedBy, matchesPublicQuery: true },
  note: "No Black Representation profile was created, updated, or removed during verification.",
}, null, 2));

process.exit(0);

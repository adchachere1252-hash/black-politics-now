import { desc, eq } from "drizzle-orm";
import { cbcMembers, candidatePortraitSubmissions, governorRaces, houseRaces, senateRaces } from "../drizzle/schema";
import { getDb } from "./db";
import { photoWithRepositoryFallback } from "./candidatePhotoResolver";
import { storagePut } from "./storage";

export const portraitTargetTypes = ["senate", "house", "governor", "black_representation"] as const;
export const portraitPhotoFields = ["candidate1", "candidate2", "dem", "rep", "profile"] as const;
export const portraitProvenanceTypes = ["official_campaign", "official_government", "bioguide", "licensed_media", "other_verified"] as const;

type PortraitTargetType = typeof portraitTargetTypes[number];
type PortraitPhotoField = typeof portraitPhotoFields[number];

function assertHttpsUrl(value: string, label: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error("not-https");
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL`);
  }
}

function assertPortraitImageUrl(value: string) {
  if (value.startsWith("/manus-storage/candidate-portraits/")) return;
  assertHttpsUrl(value, "Portrait image URL");
}

function normalizeName(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

function matchesCandidate(expected: string | null | undefined, submitted: string) {
  return Boolean(expected && normalizeName(expected) === normalizeName(submitted));
}

export type PortraitSubmissionInput = {
  targetType: PortraitTargetType;
  targetRecordId: number;
  targetPhotoField: PortraitPhotoField;
  candidateName: string;
  imageUrl: string;
  sourceUrl: string;
  provenanceType: typeof portraitProvenanceTypes[number];
  submissionNote?: string;
};

export type PortraitUploadInput = {
  fileName: string;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  dataBase64: string;
};

const portraitContentTypes = new Set<PortraitUploadInput["contentType"]>(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const portraitExtensions: Record<PortraitUploadInput["contentType"], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function hasValidImageSignature(bytes: Buffer, contentType: PortraitUploadInput["contentType"]) {
  if (contentType === "image/jpeg") return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (contentType === "image/gif") return bytes.length > 6 && (bytes.subarray(0, 6).toString("ascii") === "GIF87a" || bytes.subarray(0, 6).toString("ascii") === "GIF89a");
  return bytes.length > 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
}

async function validateTarget(input: Pick<PortraitSubmissionInput, "targetType" | "targetRecordId" | "targetPhotoField" | "candidateName">) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  if (input.targetType === "senate" || input.targetType === "house") {
    if (input.targetPhotoField !== "candidate1" && input.targetPhotoField !== "candidate2") throw new Error("Senate and House portrait targets must select candidate one or candidate two");
    const table = input.targetType === "senate" ? senateRaces : houseRaces;
    const [record] = await db.select().from(table).where(eq(table.id, input.targetRecordId)).limit(1);
    if (!record) throw new Error("Target race not found");
    const expected = input.targetPhotoField === "candidate1" ? record.candidate1Name : record.candidate2Name;
    if (!matchesCandidate(expected, input.candidateName)) throw new Error("Candidate name does not match the selected race slot");
    return;
  }

  if (input.targetType === "governor") {
    if (input.targetPhotoField !== "dem" && input.targetPhotoField !== "rep") throw new Error("Governor portrait targets must select Democratic or Republican candidate");
    const [record] = await db.select().from(governorRaces).where(eq(governorRaces.id, input.targetRecordId)).limit(1);
    if (!record) throw new Error("Target governor race not found");
    const expected = input.targetPhotoField === "dem" ? record.demCandidate : record.repCandidate;
    if (!matchesCandidate(expected, input.candidateName)) throw new Error("Candidate name does not match the selected race slot");
    return;
  }

  if (input.targetPhotoField !== "profile") throw new Error("Black Representation portrait targets must select the profile field");
  const [profile] = await db.select().from(cbcMembers).where(eq(cbcMembers.id, input.targetRecordId)).limit(1);
  if (!profile) throw new Error("Target Black Representation profile not found");
  if (!matchesCandidate(profile.member, input.candidateName)) throw new Error("Candidate name does not match the selected Black Representation profile");
}

export async function getPortraitSubmissionTargets() {
  const db = await getDb();
  if (!db) return [];
  const [senate, house, governor, representation] = await Promise.all([
    db.select().from(senateRaces), db.select().from(houseRaces), db.select().from(governorRaces), db.select().from(cbcMembers),
  ]);
  const targets: Array<{ targetType: PortraitTargetType; targetRecordId: number; targetPhotoField: PortraitPhotoField; candidateName: string; location: string }> = [];
  const addIfMissing = (targetType: PortraitTargetType, targetRecordId: number, targetPhotoField: PortraitPhotoField, candidateName: string | null, storedPhoto: string | null, location: string) => {
    if (candidateName && !photoWithRepositoryFallback(candidateName, storedPhoto)) targets.push({ targetType, targetRecordId, targetPhotoField, candidateName, location });
  };
  senate.forEach((race) => {
    addIfMissing("senate", race.id, "candidate1", race.candidate1Name, race.candidate1Photo, `${race.stateName} Senate`);
    addIfMissing("senate", race.id, "candidate2", race.candidate2Name, race.candidate2Photo, `${race.stateName} Senate`);
  });
  house.forEach((race) => {
    addIfMissing("house", race.id, "candidate1", race.candidate1Name, race.candidate1Photo, `${race.stateName} ${race.districtLabel}`);
    addIfMissing("house", race.id, "candidate2", race.candidate2Name, race.candidate2Photo, `${race.stateName} ${race.districtLabel}`);
  });
  governor.forEach((race) => {
    addIfMissing("governor", race.id, "dem", race.demCandidate, race.demPhoto, `${race.stateName} Governor`);
    addIfMissing("governor", race.id, "rep", race.repCandidate, race.repPhoto, `${race.stateName} Governor`);
  });
  representation.forEach((profile) => addIfMissing("black_representation", profile.id, "profile", profile.member, profile.photo, `${profile.state} ${profile.district}`));
  return targets.sort((a, b) => a.candidateName.localeCompare(b.candidateName));
}

/** Returns every valid public portrait slot so an Administrator can replace an existing photo after source review. */
export async function getPortraitManagementTargets() {
  const db = await getDb();
  if (!db) return [];
  const [senate, house, governor, representation] = await Promise.all([
    db.select().from(senateRaces), db.select().from(houseRaces), db.select().from(governorRaces), db.select().from(cbcMembers),
  ]);
  const targets: Array<{ targetType: PortraitTargetType; targetRecordId: number; targetPhotoField: PortraitPhotoField; candidateName: string; location: string; currentPhotoUrl: string | null }> = [];
  const add = (targetType: PortraitTargetType, targetRecordId: number, targetPhotoField: PortraitPhotoField, candidateName: string | null, storedPhoto: string | null, location: string) => {
    if (!candidateName?.trim()) return;
    targets.push({ targetType, targetRecordId, targetPhotoField, candidateName, location, currentPhotoUrl: photoWithRepositoryFallback(candidateName, storedPhoto) ?? null });
  };
  senate.forEach((race) => { add("senate", race.id, "candidate1", race.candidate1Name, race.candidate1Photo, `${race.stateName} Senate`); add("senate", race.id, "candidate2", race.candidate2Name, race.candidate2Photo, `${race.stateName} Senate`); });
  house.forEach((race) => { add("house", race.id, "candidate1", race.candidate1Name, race.candidate1Photo, `${race.stateName} ${race.districtLabel}`); add("house", race.id, "candidate2", race.candidate2Name, race.candidate2Photo, `${race.stateName} ${race.districtLabel}`); });
  governor.forEach((race) => { add("governor", race.id, "dem", race.demCandidate, race.demPhoto, `${race.stateName} Governor`); add("governor", race.id, "rep", race.repCandidate, race.repPhoto, `${race.stateName} Governor`); });
  representation.forEach((profile) => add("black_representation", profile.id, "profile", profile.member, profile.photo, `${profile.state} ${profile.district}`));
  return targets.sort((a, b) => a.candidateName.localeCompare(b.candidateName));
}

export async function uploadPortraitImage(input: PortraitUploadInput, uploadedBy: string) {
  if (!portraitContentTypes.has(input.contentType)) throw new Error("Upload a JPG, PNG, WEBP, or GIF portrait image");
  const payload = input.dataBase64.includes(",") ? input.dataBase64.slice(input.dataBase64.indexOf(",") + 1) : input.dataBase64;
  if (!/^[A-Za-z0-9+/=]+$/.test(payload)) throw new Error("Portrait upload is not valid base64 image data");
  const bytes = Buffer.from(payload, "base64");
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error("Portrait image must be between 1 byte and 5 MB");
  if (!hasValidImageSignature(bytes, input.contentType)) throw new Error("Portrait file content does not match the selected image format");
  const safeActor = uploadedBy.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 48) || "administrator";
  const extension = portraitExtensions[input.contentType];
  return storagePut(`candidate-portraits/${safeActor}/portrait.${extension}`, bytes, input.contentType);
}

export async function getPortraitSubmissions(status?: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(candidatePortraitSubmissions);
  return status ? query.where(eq(candidatePortraitSubmissions.status, status)).orderBy(desc(candidatePortraitSubmissions.createdAt)) : query.orderBy(desc(candidatePortraitSubmissions.createdAt));
}

export async function submitPortraitSubmission(input: PortraitSubmissionInput, submittedBy: string) {
  assertPortraitImageUrl(input.imageUrl);
  assertHttpsUrl(input.sourceUrl, "Provenance source URL");
  await validateTarget(input);
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(candidatePortraitSubmissions).values({ ...input, submissionNote: input.submissionNote?.trim() || null, submittedBy });
  const [submission] = await db.select().from(candidatePortraitSubmissions).orderBy(desc(candidatePortraitSubmissions.id)).limit(1);
  if (!submission) throw new Error("Unable to create portrait submission");
  return submission;
}

export async function reviewPortraitSubmission(id: number, decision: "approved" | "rejected", reviewedBy: string, reviewNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [submission] = await db.select().from(candidatePortraitSubmissions).where(eq(candidatePortraitSubmissions.id, id)).limit(1);
  if (!submission) throw new Error("Portrait submission not found");
  if (submission.status !== "pending") throw new Error("Portrait submission has already been reviewed");
  const note = reviewNote?.trim() || null;
  if (decision === "rejected" && !note) throw new Error("A rejection reason is required");
  if (decision === "approved") {
    await validateTarget({ targetType: submission.targetType, targetRecordId: submission.targetRecordId, targetPhotoField: submission.targetPhotoField, candidateName: submission.candidateName });
    if (submission.targetType === "senate" || submission.targetType === "house") {
      const table = submission.targetType === "senate" ? senateRaces : houseRaces;
      await db.update(table).set(submission.targetPhotoField === "candidate1" ? { candidate1Photo: submission.imageUrl } : { candidate2Photo: submission.imageUrl }).where(eq(table.id, submission.targetRecordId));
    } else if (submission.targetType === "governor") {
      await db.update(governorRaces).set(submission.targetPhotoField === "dem" ? { demPhoto: submission.imageUrl } : { repPhoto: submission.imageUrl }).where(eq(governorRaces.id, submission.targetRecordId));
    } else {
      await db.update(cbcMembers).set({ photo: submission.imageUrl }).where(eq(cbcMembers.id, submission.targetRecordId));
    }
  }
  await db.update(candidatePortraitSubmissions).set({ status: decision, reviewedBy, reviewedAt: new Date(), reviewNote: note, appliedPhotoUrl: decision === "approved" ? submission.imageUrl : null }).where(eq(candidatePortraitSubmissions.id, id));
  const [reviewed] = await db.select().from(candidatePortraitSubmissions).where(eq(candidatePortraitSubmissions.id, id)).limit(1);
  if (!reviewed) throw new Error("Unable to retrieve reviewed portrait submission");
  return reviewed;
}

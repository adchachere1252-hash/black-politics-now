import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { certifiedResultArchiveEntries, certifiedResultArchives, governorRaces, houseRaces, referendums, senateRaces } from "../drizzle/schema";
import { getDb } from "./db";

export type CertificationArchiveInput = {
  archiveKey: string;
  title: string;
  certificationAuthority: string;
  certificationSourceUrl: string;
  certificationStatement: string;
  certifiedAt: Date;
  certifiedBy: string;
};

type ArchiveEntryDraft = {
  chamber: "Senate" | "House" | "Governor" | "Referendum";
  sourceRecordId: number;
  contestKey: string;
  jurisdiction: string;
  resultLabel: string;
  winnerOrResult: string;
  partyOrSide: string | null;
  sourceUrl: string;
  snapshotJson: string;
};

function isWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateCertificationArchiveInput(input: Omit<CertificationArchiveInput, "certifiedBy">) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.archiveKey)) throw new Error("Archive key must use lowercase letters, numbers, and single hyphens.");
  if (!isWebUrl(input.certificationSourceUrl)) throw new Error("Certification requires a valid HTTP or HTTPS authority source URL.");
  if (!input.certificationAuthority.trim()) throw new Error("Certification authority is required.");
  if (!input.certificationStatement.trim()) throw new Error("Certification statement is required.");
  if (Number.isNaN(input.certifiedAt.getTime())) throw new Error("Certification date is required.");
}

function snapshot(value: Record<string, unknown>) {
  return JSON.stringify(value, (_key, candidate) => typeof candidate === "bigint" ? Number(candidate) : candidate);
}

export function createCertifiedSnapshotDigest(entries: Array<Pick<ArchiveEntryDraft, "chamber" | "contestKey" | "winnerOrResult" | "partyOrSide" | "sourceUrl" | "snapshotJson">>) {
  return createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}

async function collectCertifiedEntries(certificationSourceUrl: string): Promise<ArchiveEntryDraft[]> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [senate, house, governors, measures] = await Promise.all([
    db.select().from(senateRaces).where(eq(senateRaces.status, "Certified")),
    db.select().from(houseRaces).where(eq(houseRaces.status, "Certified")),
    db.select().from(governorRaces).where(eq(governorRaces.status, "Certified")),
    db.select().from(referendums).where(eq(referendums.status, "Certified")),
  ]);
  const raceEntries = [
    ...senate.map((race) => ({ chamber: "Senate" as const, sourceRecordId: race.id, contestKey: `senate-${race.stateCode}`, jurisdiction: race.stateName, resultLabel: `${race.stateName} U.S. Senate`, winnerOrResult: race.calledWinner ?? "", partyOrSide: race.calledParty ?? null, sourceUrl: race.calledSourceUrl ?? "", snapshotJson: snapshot(race as any) })),
    ...house.map((race) => ({ chamber: "House" as const, sourceRecordId: race.id, contestKey: `house-${race.stateCode}-${race.district}`, jurisdiction: race.stateName, resultLabel: `${race.stateName}-${race.districtLabel} U.S. House`, winnerOrResult: race.calledWinner ?? "", partyOrSide: race.calledParty ?? null, sourceUrl: race.calledSourceUrl ?? "", snapshotJson: snapshot(race as any) })),
    ...governors.map((race) => ({ chamber: "Governor" as const, sourceRecordId: race.id, contestKey: `governor-${race.stateCode}`, jurisdiction: race.stateName, resultLabel: `${race.stateName} Governor`, winnerOrResult: race.calledWinner ?? "", partyOrSide: race.calledParty ?? null, sourceUrl: race.calledSourceUrl ?? "", snapshotJson: snapshot(race as any) })),
  ];
  for (const entry of raceEntries) {
    if (!entry.winnerOrResult || !isWebUrl(entry.sourceUrl)) throw new Error(`${entry.resultLabel} is marked Certified but lacks a winner and a valid authority result source.`);
  }
  const referendumEntries = measures.map((measure) => ({ chamber: "Referendum" as const, sourceRecordId: measure.id, contestKey: `referendum-${measure.stateCode}-${measure.id}`, jurisdiction: measure.stateName, resultLabel: measure.name, winnerOrResult: measure.calledResult ?? "", partyOrSide: null, sourceUrl: certificationSourceUrl, snapshotJson: snapshot(measure as any) }));
  for (const entry of referendumEntries) if (!entry.winnerOrResult) throw new Error(`${entry.resultLabel} is marked Certified but lacks a certified result.`);
  return [...raceEntries, ...referendumEntries];
}

export async function getCertificationArchivePreview() {
  const db = await getDb();
  if (!db) return { eligible: { Senate: 0, House: 0, Governor: 0, Referendum: 0, total: 0 }, blockers: ["Database unavailable"] };
  const entries = await collectCertifiedEntries("https://example.invalid/certification-preview").catch((error) => ({ error: error instanceof Error ? error.message : "Certification review failed" }));
  if (!Array.isArray(entries)) return { eligible: { Senate: 0, House: 0, Governor: 0, Referendum: 0, total: 0 }, blockers: [entries.error] };
  const eligible = { Senate: entries.filter((entry) => entry.chamber === "Senate").length, House: entries.filter((entry) => entry.chamber === "House").length, Governor: entries.filter((entry) => entry.chamber === "Governor").length, Referendum: entries.filter((entry) => entry.chamber === "Referendum").length, total: entries.length };
  return { eligible, blockers: entries.length ? [] : ["No election records are marked Certified. Preliminary and called results cannot enter the archive."] };
}

export async function createCertificationArchive(input: CertificationArchiveInput) {
  validateCertificationArchiveInput(input);
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const entries = await collectCertifiedEntries(input.certificationSourceUrl);
  if (!entries.length) throw new Error("No election records are marked Certified. An archive cannot be created from preliminary or called results.");
  const [existing] = await db.select({ id: certifiedResultArchives.id }).from(certifiedResultArchives).where(eq(certifiedResultArchives.archiveKey, input.archiveKey)).limit(1);
  if (existing) throw new Error("An archive already exists for this archive key.");
  const digest = createCertifiedSnapshotDigest(entries);
  return db.transaction(async (tx) => {
    const result = await tx.insert(certifiedResultArchives).values({ ...input, snapshotDigest: digest, entryCount: entries.length });
    const archiveId = Number((Array.isArray(result) ? result[0] : result)?.insertId ?? 0);
    if (!Number.isInteger(archiveId) || archiveId <= 0) throw new Error("Unable to create the certified results archive.");
    await tx.insert(certifiedResultArchiveEntries).values(entries.map((entry) => ({ archiveId, ...entry })));
    return { archiveId, archiveKey: input.archiveKey, entryCount: entries.length, snapshotDigest: digest };
  });
}

export async function getCertifiedResultArchives() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ archiveKey: certifiedResultArchives.archiveKey, title: certifiedResultArchives.title, certificationAuthority: certifiedResultArchives.certificationAuthority, certificationSourceUrl: certifiedResultArchives.certificationSourceUrl, certifiedAt: certifiedResultArchives.certifiedAt, entryCount: certifiedResultArchives.entryCount, snapshotDigest: certifiedResultArchives.snapshotDigest }).from(certifiedResultArchives).orderBy(desc(certifiedResultArchives.certifiedAt));
}

export async function getCertifiedResultArchiveDetail(archiveKey: string) {
  const db = await getDb();
  if (!db) return null;
  const [archive] = await db.select().from(certifiedResultArchives).where(eq(certifiedResultArchives.archiveKey, archiveKey)).limit(1);
  if (!archive) return null;
  const entries = await db.select().from(certifiedResultArchiveEntries).where(eq(certifiedResultArchiveEntries.archiveId, archive.id)).orderBy(certifiedResultArchiveEntries.chamber, certifiedResultArchiveEntries.jurisdiction, certifiedResultArchiveEntries.resultLabel);
  return { archive, entries };
}

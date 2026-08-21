import { asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { electionTickerEntries, electionTickerEntryEdits } from "../drizzle/schema";

export type TickerEntryInput = {
  jurisdiction: string;
  chamber: "Senate" | "House" | "Governor";
  winnerName: string;
  winnerParty: "D" | "R" | "I" | "L" | "G";
  sourceUrl: string;
  sourceLabel: string;
  editorName: string;
  editorNote?: string | null;
};

function normalizeInput(input: TickerEntryInput) {
  const url = new URL(input.sourceUrl.trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Ticker evidence must use an HTTP or HTTPS URL.");
  return {
    ...input,
    jurisdiction: input.jurisdiction.trim(),
    winnerName: input.winnerName.trim(),
    sourceUrl: url.toString(),
    sourceLabel: input.sourceLabel.trim(),
    editorNote: input.editorNote?.trim() || null,
  };
}

function snapshot(entry: any) {
  return JSON.stringify({
    jurisdiction: entry.jurisdiction,
    chamber: entry.chamber,
    winnerName: entry.winnerName,
    winnerParty: entry.winnerParty,
    sourceUrl: entry.sourceUrl,
    sourceLabel: entry.sourceLabel,
    sortOrder: entry.sortOrder,
    isActive: entry.isActive,
  });
}

export async function getActiveTickerEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(electionTickerEntries).where(eq(electionTickerEntries.isActive, true)).orderBy(asc(electionTickerEntries.sortOrder), asc(electionTickerEntries.id));
}

export async function getAllTickerEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(electionTickerEntries).orderBy(desc(electionTickerEntries.isActive), asc(electionTickerEntries.sortOrder), asc(electionTickerEntries.id));
}

export async function getTickerEntryHistory(id: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(electionTickerEntryEdits).where(eq(electionTickerEntryEdits.tickerEntryId, id)).orderBy(desc(electionTickerEntryEdits.createdAt), desc(electionTickerEntryEdits.id)).limit(20);
}

export async function createTickerEntry(input: TickerEntryInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const value = normalizeInput(input);
  return db.transaction(async (tx) => {
    const existing = await tx.select({ sortOrder: electionTickerEntries.sortOrder }).from(electionTickerEntries).where(eq(electionTickerEntries.isActive, true)).orderBy(desc(electionTickerEntries.sortOrder)).limit(1);
    const sortOrder = (existing[0]?.sortOrder ?? -1) + 1;
    const result = await tx.insert(electionTickerEntries).values({ jurisdiction: value.jurisdiction, chamber: value.chamber, winnerName: value.winnerName, winnerParty: value.winnerParty, sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel, sortOrder, isActive: true, createdBy: value.editorName });
    const id = Number((Array.isArray(result) ? result[0] : result as any)?.insertId ?? 0);
    await tx.insert(electionTickerEntryEdits).values({ tickerEntryId: id, action: "created", sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel, editorName: value.editorName, editorNote: value.editorNote || "Initial general-election ticker entry", previousValue: JSON.stringify({}) });
    return { id };
  });
}

export async function updateTickerEntry(id: number, input: TickerEntryInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const value = normalizeInput(input);
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(electionTickerEntries).where(eq(electionTickerEntries.id, id)).limit(1);
    if (!existing) throw new Error("Ticker entry not found");
    await tx.update(electionTickerEntries).set({ jurisdiction: value.jurisdiction, chamber: value.chamber, winnerName: value.winnerName, winnerParty: value.winnerParty, sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel }).where(eq(electionTickerEntries.id, id));
    await tx.insert(electionTickerEntryEdits).values({ tickerEntryId: id, action: "updated", sourceUrl: value.sourceUrl, sourceLabel: value.sourceLabel, editorName: value.editorName, editorNote: value.editorNote, previousValue: snapshot(existing) });
    return { id };
  });
}

export async function reorderTickerEntries(orderedIds: number[], editorName: string, editorNote?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  if (new Set(orderedIds).size !== orderedIds.length) throw new Error("Ticker ordering cannot contain duplicate entries.");
  return db.transaction(async (tx) => {
    const rows = await tx.select().from(electionTickerEntries).where(inArray(electionTickerEntries.id, orderedIds));
    if (rows.length !== orderedIds.length || rows.some((entry) => !entry.isActive)) throw new Error("Ticker ordering must include only existing active general-election entries.");
    const byId = new Map(rows.map((entry) => [entry.id, entry]));
    for (let sortOrder = 0; sortOrder < orderedIds.length; sortOrder += 1) {
      const id = orderedIds[sortOrder];
      const entry = byId.get(id)!;
      if (entry.sortOrder === sortOrder) continue;
      await tx.update(electionTickerEntries).set({ sortOrder }).where(eq(electionTickerEntries.id, id));
      await tx.insert(electionTickerEntryEdits).values({ tickerEntryId: id, action: "reordered", sourceUrl: entry.sourceUrl, sourceLabel: entry.sourceLabel, editorName, editorNote: editorNote?.trim() || null, previousValue: snapshot(entry) });
    }
    return { updated: orderedIds.length };
  });
}

export async function removeTickerEntry(id: number, editorName: string, editorNote?: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  return db.transaction(async (tx) => {
    const [existing] = await tx.select().from(electionTickerEntries).where(eq(electionTickerEntries.id, id)).limit(1);
    if (!existing) throw new Error("Ticker entry not found");
    if (!existing.isActive) throw new Error("Ticker entry is already removed.");
    await tx.update(electionTickerEntries).set({ isActive: false }).where(eq(electionTickerEntries.id, id));
    await tx.insert(electionTickerEntryEdits).values({ tickerEntryId: id, action: "removed", sourceUrl: existing.sourceUrl, sourceLabel: existing.sourceLabel, editorName, editorNote: editorNote?.trim() || null, previousValue: snapshot(existing) });
    return { id };
  });
}

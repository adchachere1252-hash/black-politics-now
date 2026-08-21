import { and, desc, eq, inArray } from "drizzle-orm";
import { agentChangeProposals, agentRecommendations, electionDayRehearsals, electionDayStatus, electionResultConfirmations, governorRaces, houseRaces, senateRaces } from "../drizzle/schema";
import { getDb } from "./db";

const REHEARSAL_STEPS = ["heartbeat", "triage", "research", "review"] as const;
type RehearsalStep = typeof REHEARSAL_STEPS[number];
type RehearsalProgress = Record<RehearsalStep, boolean>;

function emptyRehearsalSteps(): RehearsalProgress {
  return { heartbeat: false, triage: false, research: false, review: false };
}

function parseRehearsalSteps(raw: string | null | undefined): RehearsalProgress {
  try {
    const parsed = JSON.parse(raw ?? "{}") as Partial<RehearsalProgress>;
    return REHEARSAL_STEPS.reduce((steps, key) => ({ ...steps, [key]: Boolean(parsed[key]) }), emptyRehearsalSteps());
  } catch {
    return emptyRehearsalSteps();
  }
}

export async function startElectionDayRehearsal(startedBy: string) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [running] = await db.select().from(electionDayRehearsals).where(eq(electionDayRehearsals.status, "running")).orderBy(desc(electionDayRehearsals.startedAt)).limit(1);
  if (running) return { ...running, progress: parseRehearsalSteps(running.steps) };
  await db.insert(electionDayRehearsals).values({
    scenario: "Protected Election Day readiness rehearsal",
    startedBy,
    steps: JSON.stringify(emptyRehearsalSteps()),
    notes: "Rehearsal only. No live race, source, alert, or publishing action is connected to these steps.",
  });
  const [rehearsal] = await db.select().from(electionDayRehearsals).orderBy(desc(electionDayRehearsals.id)).limit(1);
  if (!rehearsal) throw new Error("Unable to create Election Day rehearsal");
  return { ...rehearsal, progress: parseRehearsalSteps(rehearsal.steps) };
}

export async function advanceElectionDayRehearsal(id: number, step: RehearsalStep, notes: string | undefined) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const [rehearsal] = await db.select().from(electionDayRehearsals).where(eq(electionDayRehearsals.id, id)).limit(1);
  if (!rehearsal) throw new Error("Election Day rehearsal not found");
  if (rehearsal.status !== "running") throw new Error("This rehearsal is no longer active");
  const progress = { ...parseRehearsalSteps(rehearsal.steps), [step]: true };
  const complete = REHEARSAL_STEPS.every((key) => progress[key]);
  await db.update(electionDayRehearsals).set({
    steps: JSON.stringify(progress),
    notes: notes?.trim() || rehearsal.notes,
    status: complete ? "completed" : "running",
    completedAt: complete ? new Date() : null,
  }).where(eq(electionDayRehearsals.id, id));
  const [updated] = await db.select().from(electionDayRehearsals).where(eq(electionDayRehearsals.id, id)).limit(1);
  if (!updated) throw new Error("Unable to update Election Day rehearsal");
  return { ...updated, progress: parseRehearsalSteps(updated.steps) };
}

function isNamed(value: string | null | undefined) {
  return Boolean(value && value.trim() && !value.trim().toLowerCase().startsWith("tbd"));
}

function isReporting(value: unknown) {
  return Number(value ?? 0) > 0;
}

export async function getElectionDayCommandCenter() {
  const db = await getDb();
  if (!db) return null;
  const [heartbeatRows, senate, house, governor, highPriority, pendingChanges, rehearsalRows] = await Promise.all([
    db.select().from(electionDayStatus).where(eq(electionDayStatus.id, 1)).limit(1),
    db.select().from(senateRaces),
    db.select().from(houseRaces),
    db.select().from(governorRaces),
    db.select().from(agentRecommendations).where(and(eq(agentRecommendations.status, "pending"), eq(agentRecommendations.priority, "high"))).orderBy(desc(agentRecommendations.createdAt)).limit(8),
    db.select().from(agentChangeProposals).where(eq(agentChangeProposals.status, "pending_review")).orderBy(desc(agentChangeProposals.createdAt)).limit(8),
    db.select().from(electionDayRehearsals).orderBy(desc(electionDayRehearsals.startedAt)).limit(1),
  ]);
  const heartbeat = heartbeatRows[0];
  const rehearsal = rehearsalRows[0];

  const raceRows = [
    ...senate.map((race) => ({ chamber: "Senate", label: `${race.stateName} Senate`, reporting: isReporting(race.pctReporting), called: Boolean(race.calledWinner), candidateGap: !isNamed(race.candidate1Name) || !isNamed(race.candidate2Name) })),
    ...house.map((race) => ({ chamber: "House", label: `${race.stateName} ${race.districtLabel}`, reporting: isReporting(race.pctReporting), called: Boolean(race.calledWinner), candidateGap: !isNamed(race.candidate1Name) || !isNamed(race.candidate2Name) })),
    ...governor.map((race) => ({ chamber: "Governor", label: `${race.stateName} Governor`, reporting: isReporting(race.pctReporting), called: Boolean(race.calledWinner), candidateGap: !isNamed(race.demCandidate) || !isNamed(race.repCandidate) })),
  ];
  const toNumber = (value: unknown) => Number(value ?? 0);
  const pairPerformance = (input: { chamber: string; label: string; reporting: unknown; calledWinner?: string | null; calledParty?: string | null; demName?: string | null; demVotes?: unknown; demPct?: unknown; repName?: string | null; repVotes?: unknown; repPct?: unknown }) => {
    const demVotes = toNumber(input.demVotes);
    const repVotes = toNumber(input.repVotes);
    const totalVotes = demVotes + repVotes;
    const reporting = toNumber(input.reporting);
    if (reporting <= 0 && totalVotes <= 0) return null;
    const demPct = toNumber(input.demPct) > 0 ? toNumber(input.demPct) : totalVotes > 0 ? (demVotes / totalVotes) * 100 : 0;
    const repPct = toNumber(input.repPct) > 0 ? toNumber(input.repPct) : totalVotes > 0 ? (repVotes / totalVotes) * 100 : 0;
    const leader = demPct === repPct ? null : demPct > repPct ? { name: input.demName, party: "D" } : { name: input.repName, party: "R" };
    return { ...input, reporting, demVotes, repVotes, demPct, repPct, totalVotes, margin: Math.abs(demPct - repPct), leader, preliminary: !input.calledWinner };
  };
  const candidatePerformance = [
    ...senate.map((race) => {
      const candidates = [
        { name: race.candidate1Name, party: race.candidate1Party, votes: race.candidate1Votes, pct: race.candidate1VotePct },
        { name: race.candidate2Name, party: race.candidate2Party, votes: race.candidate2Votes, pct: race.candidate2VotePct },
      ];
      const dem = candidates.find((candidate) => candidate.party === "D");
      const rep = candidates.find((candidate) => candidate.party === "R");
      return pairPerformance({ chamber: "Senate", label: `${race.stateName} Senate`, reporting: race.pctReporting, calledWinner: race.calledWinner, calledParty: race.calledParty, demName: dem?.name, demVotes: dem?.votes, demPct: dem?.pct, repName: rep?.name, repVotes: rep?.votes, repPct: rep?.pct });
    }),
    ...house.map((race) => {
      const candidates = [
        { name: race.candidate1Name, party: race.candidate1Party, votes: race.candidate1Votes, pct: race.candidate1VotePct },
        { name: race.candidate2Name, party: race.candidate2Party, votes: race.candidate2Votes, pct: race.candidate2VotePct },
      ];
      const dem = candidates.find((candidate) => candidate.party === "D");
      const rep = candidates.find((candidate) => candidate.party === "R");
      return pairPerformance({ chamber: "House", label: `${race.stateName} ${race.districtLabel}`, reporting: race.pctReporting, calledWinner: race.calledWinner, calledParty: race.calledParty, demName: dem?.name, demVotes: dem?.votes, demPct: dem?.pct, repName: rep?.name, repVotes: rep?.votes, repPct: rep?.pct });
    }),
    ...governor.map((race) => pairPerformance({ chamber: "Governor", label: `${race.stateName} Governor`, reporting: race.pctReporting, calledWinner: race.calledWinner, calledParty: race.calledParty, demName: race.demCandidate, demVotes: race.demVotes, repName: race.repCandidate, repVotes: race.repVotes })),
  ].filter((race): race is NonNullable<typeof race> => Boolean(race)).sort((a, b) => b.reporting - a.reporting || b.totalVotes - a.totalVotes).slice(0, 12);
  const now = Date.now();
  const heartbeatAgeMinutes = heartbeat?.heartbeatAt ? Math.floor((now - new Date(heartbeat.heartbeatAt).getTime()) / 60000) : null;
  const staleHeartbeat = heartbeat?.mode === "active" && (heartbeatAgeMinutes === null || heartbeatAgeMinutes > 3);
  const triage = [
    ...(staleHeartbeat ? [{ type: "source", severity: "high", title: "DDHQ heartbeat is stale", detail: heartbeatAgeMinutes === null ? "No active polling heartbeat has been written." : `Last engine heartbeat was ${heartbeatAgeMinutes} minutes ago.`, action: "Check Election Engine and source availability" }] : []),
    ...(heartbeat?.sourceHealth === "degraded" ? [{ type: "source", severity: "high", title: "Source polling is degraded", detail: heartbeat.lastSummary ?? "The polling engine reported an unavailable or partial source response.", action: "Review source errors before publishing any correction" }] : []),
    ...raceRows.filter((race) => race.candidateGap).slice(0, 6).map((race) => ({ type: "coverage", severity: "medium", title: `${race.label} has an unresolved candidate slot`, detail: `${race.chamber} race requires editor-confirmed candidate context.`, action: "Send to Data Desk or create an agent task" })),
    ...highPriority.map((item) => ({ type: "agent", severity: item.priority, title: item.title, detail: item.summary, action: item.proposedAction })),
  ].slice(0, 12);

  return {
    heartbeat: heartbeat ? { ...heartbeat, ageMinutes: heartbeatAgeMinutes, stale: staleHeartbeat } : { mode: "standby", sourceName: "DDHQ", sourceHealth: "unknown", stale: false, ageMinutes: null, lastSummary: "No active election engine heartbeat has been recorded." },
    coverage: {
      mapped: raceRows.length,
      senate: senate.length,
      house: house.length,
      governor: governor.length,
      reporting: raceRows.filter((race) => race.reporting).length,
      called: raceRows.filter((race) => race.called).length,
      candidateGaps: raceRows.filter((race) => race.candidateGap).length,
      pendingChangeSets: pendingChanges.length,
    },
    candidatePerformance,
    triage,
    rehearsal: rehearsal ? { ...rehearsal, progress: parseRehearsalSteps(rehearsal.steps) } : null,
    runbook: [
      { step: "Open", title: "Confirm source heartbeat", detail: "Verify DDHQ health, polling cadence, and mapped-race coverage before results begin." },
      { step: "Monitor", title: "Work the triage queue", detail: "Assign source conflicts, coverage gaps, and high-priority evidence checks to an owner." },
      { step: "Verify", title: "Review proposed corrections", detail: "Use before/after evidence and a second source before any public correction." },
      { step: "Close", title: "Reconcile and archive", detail: "Compare final official outcomes, document exceptions, and retain the review log." },
    ],
  };
}

/**
 * Private, review-first source-conflict queue. It surfaces only durable
 * heartbeat signals and pending source/data recommendations. It cannot alter
 * a race, publish a result, or invoke an alert.
 */
export async function getElectionSourceConflictQueue() {
  const db = await getDb();
  if (!db) return [];
  const [heartbeatRows, recommendations] = await Promise.all([
    db.select().from(electionDayStatus).where(eq(electionDayStatus.id, 1)).limit(1),
    db.select().from(agentRecommendations)
      .where(and(eq(agentRecommendations.status, "pending"), inArray(agentRecommendations.category, ["source_watch", "data_quality"])))
      .orderBy(desc(agentRecommendations.createdAt))
      .limit(12),
  ]);
  const heartbeat = heartbeatRows[0];
  const sourceSignal = heartbeat && (heartbeat.sourceHealth === "degraded" || heartbeat.mode === "degraded" || Number(heartbeat.failedPolls) > 0)
    ? [{ id: "heartbeat", priority: "high", title: "DDHQ source health needs review", summary: heartbeat.lastSummary ?? "The election engine reported a degraded source signal.", evidence: `Source: ${heartbeat.sourceName}; failed polls: ${heartbeat.failedPolls}; heartbeat: ${heartbeat.heartbeatAt?.toISOString() ?? "unavailable"}.`, proposedAction: "Confirm the source condition before any manual result correction.", createdAt: heartbeat.updatedAt, origin: "engine" }]
    : [];
  const recommendationItems = recommendations.map((item) => ({ id: `recommendation-${item.id}`, priority: item.priority, title: item.title, summary: item.summary, evidence: item.evidence, proposedAction: item.proposedAction, createdAt: item.createdAt, origin: "review" }));
  const priorityWeight: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return [...sourceSignal, ...recommendationItems].sort((a, b) => (priorityWeight[a.priority] ?? 3) - (priorityWeight[b.priority] ?? 3) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
}

function reconcileChamber(chamber: string, rows: Array<{ status: string; calledWinner: string | null }>) {
  const byStatus = rows.reduce<Record<string, number>>((counts, row) => ({ ...counts, [row.status]: (counts[row.status] ?? 0) + 1 }), {});
  return { chamber, total: rows.length, called: rows.filter((row) => Boolean(row.calledWinner)).length, unresolved: rows.filter((row) => !row.calledWinner).length, byStatus };
}

/**
 * A protected live reconciliation view. It is intentionally a status report,
 * not a results-writing workflow: the source conflict queue remains private
 * and every public correction still requires evidence and an Admin decision.
 */
export async function getPostElectionReconciliationReport() {
  const db = await getDb();
  if (!db) return null;
  const [heartbeatRows, senate, house, governors, conflicts] = await Promise.all([
    db.select().from(electionDayStatus).where(eq(electionDayStatus.id, 1)).limit(1),
    db.select({ status: senateRaces.status, calledWinner: senateRaces.calledWinner }).from(senateRaces),
    db.select({ status: houseRaces.status, calledWinner: houseRaces.calledWinner }).from(houseRaces),
    db.select({ status: governorRaces.status, calledWinner: governorRaces.calledWinner }).from(governorRaces),
    getElectionSourceConflictQueue(),
  ]);
  const heartbeat = heartbeatRows[0] ?? null;
  return {
    generatedAt: new Date(),
    state: heartbeat?.mode === "active" ? "live_reconciliation" : heartbeat?.mode === "degraded" ? "source_review_needed" : "standing_reconciliation",
    heartbeat: heartbeat ? { mode: heartbeat.mode, sourceName: heartbeat.sourceName, sourceHealth: heartbeat.sourceHealth, lastPollAt: heartbeat.lastPollAt, mappedRaces: heartbeat.mappedRaces, updatedRaces: heartbeat.updatedRaces, failedPolls: heartbeat.failedPolls, newCalls: heartbeat.newCalls } : null,
    chambers: [reconcileChamber("Senate", senate), reconcileChamber("House", house), reconcileChamber("Governor", governors)],
    sourceConflicts: { open: conflicts.length, highPriority: conflicts.filter((item) => item.priority === "high").length },
    nextAction: conflicts.length ? "Review the cited source-conflict queue before any correction is approved." : "Continue ordinary source monitoring until final reconciliation can be closed.",
  };
}

type ResultRaceType = "senate" | "house" | "governor";

function sourceAgeMinutes(updatedAt: Date | null | undefined) {
  if (!updatedAt) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60_000));
}

function nameAndPartyCandidates(raceType: ResultRaceType, race: any) {
  if (raceType === "governor") return [
    { name: race.demCandidate, party: "D" },
    { name: race.repCandidate, party: "R" },
  ].filter((candidate) => isNamed(candidate.name));
  return [
    { name: race.candidate1Name, party: race.candidate1Party },
    { name: race.candidate2Name, party: race.candidate2Party },
  ].filter((candidate) => isNamed(candidate.name) && ["D", "R", "I"].includes(candidate.party));
}

function resultRoomRace(raceType: ResultRaceType, race: any, confirmation: any | undefined) {
  const candidates = nameAndPartyCandidates(raceType, race);
  const candidateVotes = raceType === "governor"
    ? [{ name: race.demCandidate, party: "D", votes: Number(race.demVotes ?? 0), pct: null }, { name: race.repCandidate, party: "R", votes: Number(race.repVotes ?? 0), pct: null }]
    : [{ name: race.candidate1Name, party: race.candidate1Party, votes: Number(race.candidate1Votes ?? 0), pct: Number(race.candidate1VotePct ?? 0) || null }, { name: race.candidate2Name, party: race.candidate2Party, votes: Number(race.candidate2Votes ?? 0), pct: Number(race.candidate2VotePct ?? 0) || null }];
  const totalVotes = candidateVotes.reduce((total, candidate) => total + candidate.votes, 0);
  const jurisdiction = raceType === "senate" ? `${race.stateName} Senate` : raceType === "house" ? `${race.stateName} ${race.districtLabel}` : `${race.stateName} Governor`;
  return {
    id: race.id,
    raceType,
    jurisdiction,
    stateCode: race.stateCode,
    reportingPct: Number(race.pctReporting ?? 0),
    totalVotes,
    status: race.status,
    calledWinner: race.calledWinner,
    calledParty: race.calledParty,
    calledSourceUrl: race.calledSourceUrl,
    candidates: candidateVotes,
    confirmableCandidates: candidates,
    updatedAt: race.updatedAt,
    sourceAgeMinutes: sourceAgeMinutes(race.updatedAt),
    confirmation: confirmation ? { id: confirmation.id, sourceUrl: confirmation.sourceUrl, sourceLabel: confirmation.sourceLabel, confirmedBy: confirmation.confirmedBy, confirmedAt: confirmation.confirmedAt, confirmationNote: confirmation.confirmationNote } : null,
  };
}

/**
 * Private control-room data consolidates existing election rows, durable source
 * conflicts, and immutable human result confirmations. It does not poll, call,
 * or publish any result simply by being read.
 */
export async function getElectionResultsControlRoom() {
  const db = await getDb();
  if (!db) return null;
  const [heartbeatRows, senate, house, governor, confirmations, sourceConflicts] = await Promise.all([
    db.select().from(electionDayStatus).where(eq(electionDayStatus.id, 1)).limit(1),
    db.select().from(senateRaces),
    db.select().from(houseRaces),
    db.select().from(governorRaces),
    db.select().from(electionResultConfirmations).orderBy(desc(electionResultConfirmations.confirmedAt)).limit(30),
    getElectionSourceConflictQueue(),
  ]);
  const confirmationByRace = new Map<string, typeof confirmations[number]>();
  for (const confirmation of confirmations) {
    const key = `${confirmation.raceType}:${confirmation.raceId}`;
    if (!confirmationByRace.has(key)) confirmationByRace.set(key, confirmation);
  }
  const races = [
    ...senate.map((race) => resultRoomRace("senate", race, confirmationByRace.get(`senate:${race.id}`))),
    ...house.map((race) => resultRoomRace("house", race, confirmationByRace.get(`house:${race.id}`))),
    ...governor.map((race) => resultRoomRace("governor", race, confirmationByRace.get(`governor:${race.id}`))),
  ].sort((a, b) => b.reportingPct - a.reportingPct || b.totalVotes - a.totalVotes || a.jurisdiction.localeCompare(b.jurisdiction));
  const heartbeat = heartbeatRows[0] ?? null;
  return {
    generatedAt: new Date(),
    heartbeat: heartbeat ? { mode: heartbeat.mode, sourceName: heartbeat.sourceName, sourceHealth: heartbeat.sourceHealth, heartbeatAt: heartbeat.heartbeatAt, lastPollAt: heartbeat.lastPollAt, lastSummary: heartbeat.lastSummary, failedPolls: heartbeat.failedPolls } : null,
    summary: {
      total: races.length,
      reporting: races.filter((race) => race.reportingPct > 0 || race.totalVotes > 0).length,
      called: races.filter((race) => Boolean(race.calledWinner)).length,
      humanConfirmed: confirmations.length,
      conflicts: sourceConflicts.length,
    },
    races,
    sourceConflicts,
    activity: confirmations,
  };
}

export async function confirmElectionResult(input: { raceType: ResultRaceType; raceId: number; winnerName: string; winnerParty: "D" | "R" | "I"; sourceUrl: string; sourceLabel: string; confirmationNote?: string | null; confirmedBy: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  const sourceUrl = input.sourceUrl.trim();
  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported protocol");
  } catch {
    throw new Error("A valid HTTPS or HTTP result source is required.");
  }
  if (!input.sourceLabel.trim()) throw new Error("A result source label is required.");

  const config = input.raceType === "senate" ? { table: senateRaces, label: (race: any) => `${race.stateName} Senate` }
    : input.raceType === "house" ? { table: houseRaces, label: (race: any) => `${race.stateName} ${race.districtLabel}` }
    : { table: governorRaces, label: (race: any) => `${race.stateName} Governor` };

  return db.transaction(async (tx) => {
    const [race] = await tx.select().from(config.table).where(eq(config.table.id, input.raceId)).limit(1);
    if (!race) throw new Error("Race was not found.");
    const candidate = nameAndPartyCandidates(input.raceType, race).find((item) => item.name?.trim() === input.winnerName.trim() && item.party === input.winnerParty);
    if (!candidate) throw new Error("Choose a currently mapped Democratic, Republican, or Independent candidate before confirming a result.");
    const jurisdiction = config.label(race);
    const priorValue = JSON.stringify({ status: race.status, calledWinner: race.calledWinner, calledParty: race.calledParty, calledAt: race.calledAt, calledSourceUrl: race.calledSourceUrl });
    await tx.update(config.table).set({ status: "Called", calledWinner: candidate.name, calledParty: candidate.party, calledAt: Date.now(), calledSourceUrl: sourceUrl } as any).where(eq(config.table.id, input.raceId));
    await tx.insert(electionResultConfirmations).values({
      raceType: input.raceType,
      raceId: input.raceId,
      jurisdiction,
      winnerName: candidate.name,
      winnerParty: candidate.party,
      sourceUrl,
      sourceLabel: input.sourceLabel.trim(),
      confirmationNote: input.confirmationNote?.trim() || null,
      confirmedBy: input.confirmedBy,
      priorValue,
    });
    return { success: true, jurisdiction, winnerName: candidate.name, winnerParty: candidate.party };
  });
}

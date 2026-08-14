import { and, desc, eq } from "drizzle-orm";
import { agentChangeProposals, agentRecommendations, electionDayRehearsals, electionDayStatus, governorRaces, houseRaces, senateRaces } from "../drizzle/schema";
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

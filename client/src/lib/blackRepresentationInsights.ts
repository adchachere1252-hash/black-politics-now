export type SourceReviewTone = "verified" | "article" | "review";

export type SourceReviewBadge = {
  tone: SourceReviewTone;
  label: string;
  detail: string;
};

export type StateComparison = {
  stateCode: string;
  stateName: string;
  trackedPeople: number;
  advanced: number;
  transitions: number;
  contests: number;
  sourceReviewed: number;
  needsReview: number;
  latestAt: number | null;
};

function toTimestamp(value: unknown) {
  if (!value) return null;
  const timestamp = new Date(value as string | number | Date).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getSourceReviewBadge(record: any): SourceReviewBadge {
  const sourceUrl = String(record?.sourceUrl ?? "").trim();
  const sourceLabel = String(record?.sourceLabel ?? "").trim();
  const articleUrl = String(record?.articleUrl ?? "").trim();
  const unresolved = record?.resultStatus === "too_close_to_call" || record?.status === "too_close_to_call";

  if (unresolved || !sourceUrl) {
    return { tone: "review", label: "Source review", detail: unresolved ? "Outcome remains unresolved" : "Evidence link required" };
  }
  if (articleUrl && sourceUrl === articleUrl || /Black Politics Now primary-results tracker/i.test(sourceLabel)) {
    return { tone: "article", label: "Article reference", detail: "Linked to the Black Politics Now tracker" };
  }
  return { tone: "verified", label: "Source reviewed", detail: sourceLabel || "Linked reporting available" };
}

export function buildStateComparisons(members: any[], elections: any[]): StateComparison[] {
  const byState = new Map<string, StateComparison>();
  const getState = (record: any) => {
    const stateCode = String(record?.stateCode ?? "").trim();
    if (!stateCode) return null;
    if (!byState.has(stateCode)) {
      byState.set(stateCode, {
        stateCode,
        stateName: record?.state ?? stateCode,
        trackedPeople: 0,
        advanced: 0,
        transitions: 0,
        contests: 0,
        sourceReviewed: 0,
        needsReview: 0,
        latestAt: null,
      });
    }
    return byState.get(stateCode)!;
  };
  const updateTimestamp = (state: StateComparison, record: any) => {
    const timestamp = toTimestamp(record?.updatedAt ?? record?.updated_at ?? record?.lastVerifiedAt ?? record?.last_verified_at);
    if (timestamp && (!state.latestAt || timestamp > state.latestAt)) state.latestAt = timestamp;
  };

  members.forEach((member) => {
    const state = getState(member);
    if (!state) return;
    state.trackedPeople += 1;
    if (member.status === "advanced_to_general") state.advanced += 1;
    if (["retiring", "resigned", "deceased", "lost_primary"].includes(member.status)) state.transitions += 1;
    const source = getSourceReviewBadge(member);
    if (source.tone === "review") state.needsReview += 1;
    else state.sourceReviewed += 1;
    updateTimestamp(state, member);
  });

  elections.forEach((election) => {
    const state = getState(election);
    if (!state) return;
    state.contests += 1;
    const source = getSourceReviewBadge(election);
    if (source.tone === "review") state.needsReview += 1;
    else state.sourceReviewed += 1;
    updateTimestamp(state, election);
  });

  return Array.from(byState.values()).sort((a, b) => b.contests - a.contests || b.trackedPeople - a.trackedPeople || a.stateName.localeCompare(b.stateName));
}

export type RepresentationTimelineItem = {
  id: string;
  stateCode: string;
  district: string;
  date: string;
  stage: "primary" | "runoff" | "general" | "certified" | "review";
  headline: string;
  detail: string;
  sourceUrl?: string | null;
  sourceBadge: SourceReviewBadge;
};

const stageOrder: Record<RepresentationTimelineItem["stage"], number> = { primary: 1, runoff: 2, general: 3, certified: 4, review: 0 };

export function buildRepresentationTimeline(members: any[], elections: any[], stateCode?: string | null): RepresentationTimelineItem[] {
  const matchesState = (record: any) => !stateCode || record?.stateCode === stateCode;
  const items: RepresentationTimelineItem[] = [];
  members.filter(matchesState).forEach((member) => {
    const stage = member.primaryResult ? "primary" : member.raceStage === "general" ? "general" : "review" as const;
    if (!member.primaryResult && member.raceStage !== "general") return;
    items.push({
      id: `member-${member.id}`,
      stateCode: member.stateCode,
      district: member.district,
      date: member.primaryDate ?? member.updatedAt ?? member.updated_at ?? "",
      stage,
      headline: member.member,
      detail: member.primaryResult ?? `General-election status: ${String(member.status ?? "tracking").replaceAll("_", " ")}`,
      sourceUrl: member.sourceUrl,
      sourceBadge: getSourceReviewBadge(member),
    });
  });
  elections.filter(matchesState).forEach((election) => {
    const stage = election.electionType === "runoff" ? "runoff" : election.electionType === "general" ? "general" : election.resultStatus === "too_close_to_call" ? "review" : "primary" as const;
    items.push({
      id: `contest-${election.id}`,
      stateCode: election.stateCode,
      district: election.district,
      date: election.electionDate ?? election.lastVerifiedAt ?? election.last_verified_at ?? "",
      stage,
      headline: election.winnerName ?? "Result pending",
      detail: `${election.electionType ?? "election"} · ${String(election.resultStatus ?? "tracking").replaceAll("_", " ")}${election.generalOpponent ? ` · General: ${election.generalOpponent}` : ""}`,
      sourceUrl: election.sourceUrl,
      sourceBadge: getSourceReviewBadge(election),
    });
  });
  return items.sort((a, b) => {
    const dateDifference = (toTimestamp(b.date) ?? 0) - (toTimestamp(a.date) ?? 0);
    return dateDifference || stageOrder[b.stage] - stageOrder[a.stage] || a.district.localeCompare(b.district);
  });
}

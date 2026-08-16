export type DailyBriefSegmentRole = "greeting" | "editorial" | "closing";

export type DailyBriefSegmentShape = {
  key?: string | null;
  sourceLinks?: string | null;
};

export function getDailyBriefSegmentRole(key?: string | null): DailyBriefSegmentRole {
  if (key?.includes("greeting")) return "greeting";
  if (key?.includes("closing")) return "closing";
  return "editorial";
}

export function validateDailyBriefStructure(segments: DailyBriefSegmentShape[]) {
  const firstRole = getDailyBriefSegmentRole(segments[0]?.key);
  const lastRole = getDailyBriefSegmentRole(segments.at(-1)?.key);
  const editorialCount = segments.filter((segment) => getDailyBriefSegmentRole(segment.key) === "editorial").length;
  const missingSources = segments.filter((segment) => !segment.sourceLinks || segment.sourceLinks === "[]").length;
  return {
    hasOpening: firstRole === "greeting",
    hasClosing: lastRole === "closing",
    editorialCount,
    missingSources,
    isPublishable: firstRole === "greeting" && lastRole === "closing" && editorialCount >= 13 && missingSources === 0,
  };
}

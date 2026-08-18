export const BLACK_POLITICAL_REPRESENTATION_RATING = "Black Political Representation";

type RepresentationMember = {
  stateCode?: string | null;
  state?: string | null;
};

type RepresentationMapRecord = {
  rating: typeof BLACK_POLITICAL_REPRESENTATION_RATING;
  candidate1: string;
  candidate2: string;
  calledWinner: null;
};

export function buildBlackPoliticalRepresentationMapData(
  members: RepresentationMember[],
  resolveStateCode: (member: RepresentationMember) => string | null | undefined = (member) => member.stateCode,
): Record<string, RepresentationMapRecord> {
  const counts: Record<string, number> = {};
  for (const member of members) {
    const stateCode = resolveStateCode(member);
    if (stateCode) counts[stateCode] = (counts[stateCode] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).map(([stateCode, count]) => [stateCode, {
      rating: BLACK_POLITICAL_REPRESENTATION_RATING,
      candidate1: `${count} Black member${count === 1 ? "" : "s"}`,
      candidate2: "Representation record",
      calledWinner: null,
    }]),
  );
}

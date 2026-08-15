export type AtlasVraMilestone = {
  year: number;
  congress: number;
  title: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
};

/**
 * Deliberately compact, source-linked milestones that explain changes to the
 * legal context for districting. These entries do not certify a state map or
 * claim that a single event caused a particular boundary change.
 */
export const ATLAS_VRA_TIMELINE: AtlasVraMilestone[] = [
  {
    year: 1965,
    congress: 89,
    title: "Voting Rights Act enacted",
    summary: "Section 2 established a nationwide prohibition on voting discrimination, while Section 5 required covered jurisdictions to obtain preclearance before implementing voting changes.",
    sourceLabel: "U.S. Department of Justice",
    sourceUrl: "https://www.justice.gov/crt/history-federal-voting-rights-laws",
  },
  {
    year: 1982,
    congress: 97,
    title: "Section 2 amended",
    summary: "Congress amended Section 2 so a plaintiff could establish a violation without proving discriminatory purpose, changing the legal context for vote-dilution challenges.",
    sourceLabel: "U.S. Department of Justice",
    sourceUrl: "https://www.justice.gov/crt/history-federal-voting-rights-laws",
  },
  {
    year: 1986,
    congress: 99,
    title: "Gingles framework",
    summary: "Thornburg v. Gingles supplied the framework used in Section 2 vote-dilution cases; the House Historian describes its role in the creation of majority-Black congressional districts in the South.",
    sourceLabel: "U.S. House Historian",
    sourceUrl: "https://history.house.gov/Exhibitions-and-Publications/BAIC/Historical-Essays/Permanent-Interest/Redistricting-Representation/",
  },
  {
    year: 2013,
    congress: 113,
    title: "Shelby County decision",
    summary: "Shelby County v. Holder invalidated the coverage formula in Section 4(b), changing how the Act’s preclearance provision could operate.",
    sourceLabel: "U.S. Department of Justice",
    sourceUrl: "https://www.justice.gov/crt/history-federal-voting-rights-laws",
  },
  {
    year: 2023,
    congress: 118,
    title: "Allen v. Milligan",
    summary: "The Supreme Court affirmed the finding that Alabama’s plan likely violated Section 2 and retained the established Gingles framework for the case before it.",
    sourceLabel: "U.S. Supreme Court",
    sourceUrl: "https://www.supremecourt.gov/opinions/22pdf/21-1086_1co6.pdf",
  },
  {
    year: 2026,
    congress: 119,
    title: "Louisiana v. Callais",
    summary: "The Supreme Court held that Section 2 did not require Louisiana’s additional majority-minority district at issue and that no compelling interest justified the State’s race-based map; this entry records a legal framework change, not an automatic map change or representation forecast.",
    sourceLabel: "U.S. Supreme Court",
    sourceUrl: "https://www.supremecourt.gov/opinions/25pdf/24-109_21o3.pdf",
  },
];

export function sourceCheckedBoundaryNote(stateName: string, congress: number, sourceFilename?: string) {
  if (!sourceFilename) return null;
  return `${stateName}'s ${congress}th Congress frame uses the UCLA archive file ${sourceFilename}. The file range identifies the historical geometry used here; it is not a legal certification or a finding about representation outcomes.`;
}

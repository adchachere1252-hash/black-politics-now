/**
 * Primary context is intentionally separate from the general-election map contract.
 * It informs readers about a reviewed primary without converting preliminary
 * returns into a general-election rating, call, or certification.
 */
export type ElectionPrimaryContext = {
  id: string;
  stateCode: string;
  stateName: string;
  primaryDate: string;
  reviewedAt: string;
  status: "preliminary" | "certified";
  title: string;
  summary: string;
  generalElectionBoundary: string;
  sourceLabel: string;
  sourceUrl: string;
};

const PRIMARY_CONTEXTS: ElectionPrimaryContext[] = [
  {
    id: "alaska-2026-primary",
    stateCode: "AK",
    stateName: "Alaska",
    primaryDate: "2026-08-18",
    reviewedAt: "2026-08-20",
    status: "preliminary",
    title: "Alaska primary context reviewed",
    summary: "Unofficial August 18 top-four primary results: Mary Peltola led the U.S. Senate field with 48.09%, followed by Dan Sullivan at 42.72%; Nick Begich led the U.S. House field with 46.12%, followed by Bill Hill at 30.89%. In the Governor/Lieutenant Governor field, Kreiss-Tomkins/Begich and Begich/Schuerch led, followed by Wilson/Shower and Bronson/Church. Counts remain election-stage context; this homepage map continues to show the general-election outlook only.",
    generalElectionBoundary: "No primary return changes a general-election rating, map call, ticker item, or certified-results archive until the relevant election-stage evidence supports it.",
    sourceLabel: "Alaska Division of Elections · 2026 Primary results",
    sourceUrl: "https://www.elections.alaska.gov/enr26/results/ElectionSummaryReportRPT.pdf",
  },
];

export function getPublicPrimaryContexts(): ElectionPrimaryContext[] {
  return PRIMARY_CONTEXTS;
}

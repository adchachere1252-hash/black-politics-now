export type PrimaryResultRecord = {
  stateCode: "AK" | "CA" | "FL" | "WY";
  stateName: string;
  electionLabel: string;
  resultStatus: "Projected primary result" | "Unofficial special-election result" | "Ongoing top-four count";
  summary: string;
  candidate1: string;
  candidate2: string;
  results: Array<{ label: string; outcome: string }>;
  sourceLabel: string;
  sourceUrl: string;
  updatedLabel: string;
};

export const AUGUST_18_PRIMARY_RESULTS: PrimaryResultRecord[] = [
  {
    stateCode: "FL",
    stateName: "Florida",
    electionLabel: "August 18 primary",
    resultStatus: "Projected primary result",
    summary: "Florida set its governor and U.S. Senate special-election matchups; Ryan Elijah also defeated incumbent Cory Mills in the Republican primary for the 7th District.",
    candidate1: "Donalds (R) · Moody (R)",
    candidate2: "Jolly (D) · Nixon (D)",
    results: [
      { label: "Governor", outcome: "Byron Donalds (R) and David Jolly (D) won nominations" },
      { label: "U.S. Senate special", outcome: "Ashley Moody (R) and Angie Nixon (D) won nominations" },
      { label: "U.S. House · FL-7", outcome: "Ryan Elijah (R) defeated incumbent Cory Mills" },
    ],
    sourceLabel: "NBC Miami primary recap",
    sourceUrl: "https://www.nbcmiami.com/news/politics/decision/live-updates-south-florida-primary-election-day-boward-miami-dade-today-august-18-2026/3847289/",
    updatedLabel: "Reported Aug. 18",
  },
  {
    stateCode: "AK",
    stateName: "Alaska",
    electionLabel: "August 18 top-four primary",
    resultStatus: "Ongoing top-four count",
    summary: "Alaska's nonpartisan top-four primary remains an ongoing count; the display identifies reported leaders and does not represent the count as certified.",
    candidate1: "Sullivan (R) · Peltola (D)",
    candidate2: "Governor top four pending",
    results: [
      { label: "U.S. Senate", outcome: "Dan S. Sullivan (R) and Mary Peltola (D) reported advancing" },
      { label: "U.S. House at-large", outcome: "Nick Begich III reported advancing" },
      { label: "Governor", outcome: "Kreiss-Tomkins, Begich, Wilson and Bronson led the top-four count" },
    ],
    sourceLabel: "Alaska Public Media count update",
    sourceUrl: "https://alaskapublic.org/news/politics/elections/2026-08-18/kreiss-tomkins-begich-wilson-and-bronson-lead-in-early-governor-primary-results",
    updatedLabel: "Count in progress",
  },
  {
    stateCode: "WY",
    stateName: "Wyoming",
    electionLabel: "August 18 primary",
    resultStatus: "Projected primary result",
    summary: "Wyoming selected its major-party nominees for the open U.S. Senate contest.",
    candidate1: "Hageman (R)",
    candidate2: "Byrd (D)",
    results: [
      { label: "U.S. Senate", outcome: "Harriet Hageman (R) and James Byrd (D) won nominations" },
    ],
    sourceLabel: "ABC News Wyoming results",
    sourceUrl: "https://abcnews.com/Politics/wyoming-2026-live-primary-election-results/story?id=134597860",
    updatedLabel: "Reported Aug. 18",
  },
  {
    stateCode: "CA",
    stateName: "California",
    electionLabel: "CA-14 special election",
    resultStatus: "Unofficial special-election result",
    summary: "Alameda County's unofficial final return covers California's 14th Congressional District special election, not a statewide primary result.",
    candidate1: "Aisha Wahab · 51.04%",
    candidate2: "Melissa Hernandez · 48.96%",
    results: [
      { label: "U.S. House · CA-14", outcome: "Aisha Wahab led Melissa Hernandez, 33,399 to 32,043" },
      { label: "Return status", outcome: "323 of 323 vote-center precincts partially reported; county labels the return preliminary/unofficial" },
    ],
    sourceLabel: "Alameda County official returns",
    sourceUrl: "https://alamedacountyca.gov/rovresults/262/",
    updatedLabel: "Unofficial final return",
  },
];

export function buildPrimaryResultsMapData(records = AUGUST_18_PRIMARY_RESULTS) {
  return Object.fromEntries(records.map((record) => [record.stateCode, {
    rating: "Primary Result" as const,
    candidate1: record.candidate1,
    candidate2: record.candidate2,
  }]));
}

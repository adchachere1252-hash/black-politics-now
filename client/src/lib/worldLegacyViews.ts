export type WorldElectionRecord = {
  id: number | string;
  country: string;
  countryCode: string;
  electionName: string;
  electionType: string;
  electionDate: string;
  status: string;
  winner?: string | null;
  winnerParty?: string | null;
  totalVotes?: number | null;
  turnoutPct?: string | number | null;
  notes?: string | null;
  sourceUrls?: string | null;
};

export const getCompletedWorldResults = (elections: WorldElectionRecord[]) => elections
  .filter((election) => election.status === "Completed")
  .sort((a, b) => b.electionDate.localeCompare(a.electionDate));

export const getWorldReferendums = (elections: WorldElectionRecord[]) => elections
  .filter((election) => election.electionType === "Referendum")
  .sort((a, b) => a.electionDate.localeCompare(b.electionDate));

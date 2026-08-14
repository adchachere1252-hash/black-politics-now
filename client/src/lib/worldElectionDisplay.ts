export type WorldElectionDisplayRecord = { id: number; status: string; electionDate: string; country: string };

function dateNumber(value: string) {
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function rankedWorldSignals<T extends WorldElectionDisplayRecord>(elections: T[]) {
  return elections
    .filter((election) => election.status === "Voting Today" || election.status === "Upcoming")
    .sort((left, right) => {
      const leftLive = left.status === "Voting Today";
      const rightLive = right.status === "Voting Today";
      if (leftLive !== rightLive) return leftLive ? -1 : 1;
      return leftLive ? dateNumber(right.electionDate) - dateNumber(left.electionDate) : dateNumber(left.electionDate) - dateNumber(right.electionDate);
    });
}

export function worldSignalLabel(election: Pick<WorldElectionDisplayRecord, "status" | "electionDate">, now = new Date()) {
  if (election.status !== "Voting Today") return "Next";
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return dateNumber(election.electionDate) < today ? "Results pending" : "Live now";
}

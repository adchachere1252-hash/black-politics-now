export type TickerEligibleRace = {
  calledWinner?: string | null;
  status?: string | null;
};

/**
 * A public ticker is intentionally stricter than the underlying operations
 * dashboard. Primary winners belong in race detail, not in the final-results
 * stream. A called winner is eligible unless the record is explicitly marked
 * as a primary or primary-runoff event.
 */
export function isFinalElectionTickerOutcome(race: TickerEligibleRace) {
  return Boolean(race.calledWinner)
    && race.status !== "Primary"
    && race.status !== "Primary Runoff";
}

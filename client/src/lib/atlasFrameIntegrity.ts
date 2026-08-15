import { APPORTIONMENT_HISTORY } from "@/data/atlasHistory";

export function historyIndexForAtlasCongress(congress: number) {
  if (congress <= 92) return 0;
  if (congress <= 97) return 1;
  if (congress <= 102) return 2;
  if (congress <= 107) return 3;
  if (congress <= 112) return 4;
  if (congress <= 117) return 5;
  return 6;
}

export function officialSeatsForAtlasState(state: string, congress: number) {
  return APPORTIONMENT_HISTORY[state]?.[historyIndexForAtlasCongress(congress)] ?? 0;
}

export function stateGeometryMatchesApportionment(state: string, congress: number, sourceGeometryCount: number) {
  return sourceGeometryCount === officialSeatsForAtlasState(state, congress);
}

export function atlasFrameSummary(congress: number, sourceGeometryByState: Record<string, number>) {
  const states = Object.keys(APPORTIONMENT_HISTORY);
  const officialSeats = states.reduce((total, state) => total + officialSeatsForAtlasState(state, congress), 0);
  const sourceGeometries = Object.values(sourceGeometryByState).reduce((total, count) => total + count, 0);
  const exceptionStates = states.filter((state) => !stateGeometryMatchesApportionment(state, congress, sourceGeometryByState[state] ?? 0));
  return { officialSeats, sourceGeometries, exceptionStates };
}

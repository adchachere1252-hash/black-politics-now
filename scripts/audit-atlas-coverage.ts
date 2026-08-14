import { APPORTIONMENT_HISTORY, APPORTIONMENT_YEARS, STATE_CODES } from "../client/src/data/atlasHistory";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const states = Object.keys(APPORTIONMENT_HISTORY).sort();
const stateCodes = Object.keys(STATE_CODES).sort();
const boundaryStates = Object.keys(LEWIS_MANIFEST).sort();
const expectedSeatTotal = 435;

const errors: string[] = [];

if (states.length !== 50) errors.push(`Expected 50 apportionment histories; found ${states.length}.`);
if (stateCodes.length !== 50) errors.push(`Expected 50 state codes; found ${stateCodes.length}.`);
if (boundaryStates.length !== 50) errors.push(`Expected 50 boundary archives; found ${boundaryStates.length}.`);

for (const state of states) {
  const series = APPORTIONMENT_HISTORY[state] || [];
  if (series.length !== APPORTIONMENT_YEARS.length) errors.push(`${state} has ${series.length} seat-history values.`);
  if (series.some((seats) => !Number.isInteger(seats) || seats < 1)) errors.push(`${state} has an invalid seat value.`);
  if (!STATE_CODES[state]) errors.push(`${state} is missing a state code.`);
  const eras = LEWIS_MANIFEST[state] || [];
  if (!eras.length) errors.push(`${state} is missing boundary-era coverage.`);
  if (eras.some((era) => !era.name || !Number.isInteger(era.start) || !Number.isInteger(era.end) || era.start > era.end)) {
    errors.push(`${state} has malformed boundary-era metadata.`);
  }
}

const totals = APPORTIONMENT_YEARS.map((year, index) => ({
  year,
  seats: states.reduce((sum, state) => sum + APPORTIONMENT_HISTORY[state][index], 0),
}));
for (const total of totals) if (total.seats !== expectedSeatTotal) errors.push(`${total.year} total is ${total.seats}, expected ${expectedSeatTotal}.`);

const report = {
  states: states.length,
  boundaryArchives: boundaryStates.length,
  apportionmentYears: APPORTIONMENT_YEARS,
  totals,
  errors,
  passed: errors.length === 0,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

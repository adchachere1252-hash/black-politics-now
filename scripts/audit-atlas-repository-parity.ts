import { readFileSync } from "node:fs";
import { APPORTIONMENT_HISTORY } from "../client/src/data/atlasHistory";
import { LEWIS_MANIFEST } from "../client/src/data/atlasBoundaryManifest";

const originalRoot = "/home/ubuntu/election-map-2026-atlas-audit";
const originalStateDetail = readFileSync(`${originalRoot}/client/src/components/StateDetailPanel.tsx`, "utf8");
const originalManifest = readFileSync(`${originalRoot}/client/src/lib/lewisManifest.ts`, "utf8");
const currentManifest = readFileSync("client/src/data/atlasBoundaryManifest.ts", "utf8");
const knownSeatsBlock = originalStateDetail.match(/const KNOWN_SEATS:[\s\S]*?= \{([\s\S]*?)\n  \};/);
if (!knownSeatsBlock) throw new Error("Unable to locate original repository apportionment series");

const originalSeats: Record<string, number[]> = {};
for (const match of knownSeatsBlock[1].matchAll(/^\s*"([^"]+)": \[([^\]]+)\]/gm)) {
  originalSeats[match[1]] = match[2].split(",").map((value) => Number(value.trim()));
}

const errors: string[] = [];
const currentStates = Object.keys(APPORTIONMENT_HISTORY).sort();
const originalStates = Object.keys(originalSeats).sort();
if (currentStates.join("|") !== originalStates.join("|")) errors.push("State coverage differs from the original apportionment series.");
for (const state of originalStates) {
  if (JSON.stringify(APPORTIONMENT_HISTORY[state]) !== JSON.stringify(originalSeats[state])) errors.push(`Apportionment series differs for ${state}.`);
}
if (currentManifest !== originalManifest) errors.push("Boundary manifest file does not exactly match the original repository.");
if (Object.keys(LEWIS_MANIFEST).length !== 50) errors.push("Current manifest does not contain 50 states.");

const report = {
  originalRevision: "4c0ea8f",
  originalApportionmentStates: originalStates.length,
  currentApportionmentStates: currentStates.length,
  boundaryManifestExactMatch: currentManifest === originalManifest,
  boundaryManifestStates: Object.keys(LEWIS_MANIFEST).length,
  errors,
  passed: errors.length === 0,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;

import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const baseUrl = "http://127.0.0.1:3000";
const apiResponse = await fetch(`${baseUrl}/api/trpc/election.blackRepresentationElections?batch=1`);
if (!apiResponse.ok) throw new Error(`Could not load election records: ${apiResponse.status}`);
const apiPayload = await apiResponse.json();
const records = apiPayload?.[0]?.result?.data?.json ?? [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(`${baseUrl}/elections?tab=cbc`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const bodyText = await page.locator("body").innerText();
const sourceHrefs = await page.locator('a[href^="http"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
const cards = await page.locator("article").evaluateAll((articles) => articles.map((article) => ({
  text: article.innerText,
  hrefs: Array.from(article.querySelectorAll("a")).map((link) => link.getAttribute("href")),
})));
const formattedVotes = (value) => Number(value).toLocaleString();
const formattedPct = (value) => `${Number(value).toFixed(1)}%`;
const findCard = (record) => {
  const contestHeading = `${record.state} · ${record.electionType}${record.partyContest ? ` · ${record.partyContest}` : ""}`;
  return cards.find((candidate) => candidate.text.includes(record.district) && candidate.text.includes(contestHeading) && candidate.text.includes(record.winnerName));
};
const missingFieldChecks = records.flatMap((record) => {
  const card = findCard(record);
  const expected = [
    ["district", record.district],
    ["result status", record.resultStatus?.replaceAll("_", " ")],
    ["winner", record.winnerName],
    ["winner party", record.winnerParty ? `(${record.winnerParty})` : null],
    ["winner votes", record.winnerVotes ? formattedVotes(record.winnerVotes) : null],
    ["winner percentage", record.winnerVotePct != null ? formattedPct(record.winnerVotePct) : null],
    ["runner-up", record.runnerUpName],
    ["runner-up party", record.runnerUpParty ? `(${record.runnerUpParty})` : null],
    ["runner-up votes", record.runnerUpVotes ? formattedVotes(record.runnerUpVotes) : null],
    ["runner-up percentage", record.runnerUpVotePct != null ? formattedPct(record.runnerUpVotePct) : null],
    ["general opponent", record.generalOpponent],
    ["redistricting context", record.redistrictingContext],
    ["editorial notes", record.notes],
    ["source label", record.sourceLabel],
  ];
  return expected
    .filter(([, value]) => value != null && value !== "")
    .filter(([, value]) => !card || !card.text.toLowerCase().includes(String(value).toLowerCase()))
    .map(([field, value]) => ({ id: record.id, district: record.district, field, expected: value }));
});
const missingSources = records.filter((record) => {
  const card = findCard(record);
  return !sourceHrefs.includes(record.sourceUrl) || !card?.hrefs.includes(record.sourceUrl);
});

const report = {
  checkedAt: new Date().toISOString(),
  recordsExpected: records.length,
  recordsRendered: records.length - new Set(missingFieldChecks.map((check) => check.id)).size,
  sourceLinksRendered: records.length - missingSources.length,
  missingFieldChecks,
  missingSources: missingSources.map((record) => ({ id: record.id, district: record.district, sourceUrl: record.sourceUrl })),
};

writeFileSync("/tmp/black-representation-public-ui-audit.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();

if (missingFieldChecks.length || missingSources.length) process.exitCode = 1;

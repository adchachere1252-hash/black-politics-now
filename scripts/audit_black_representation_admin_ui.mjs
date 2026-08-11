import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const baseUrl = "http://127.0.0.1:3000";
async function loadProcedure(name) {
  const response = await fetch(`${baseUrl}/api/trpc/${name}?batch=1`);
  if (!response.ok) throw new Error(`${name} failed: ${response.status}`);
  return response.text();
}

const [profilesBody, electionsBody] = await Promise.all([
  loadProcedure("election.cbc"),
  loadProcedure("election.blackRepresentationElections"),
]);
const records = JSON.parse(electionsBody)?.[0]?.result?.data?.json ?? [];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

await page.route("**/api/trpc/auth.me?*", async (route) => {
  await route.fulfill({ contentType: "application/json", body: JSON.stringify([{ result: { data: { json: { id: 99999, openId: "qa-admin", name: "QA Admin", role: "admin" } } } }]) });
});
await page.route("**/api/trpc/election.cbc?*", async (route) => {
  await route.fulfill({ contentType: "application/json", body: profilesBody });
});
await page.route("**/api/trpc/election.blackRepresentationElections?*", async (route) => {
  await route.fulfill({ contentType: "application/json", body: electionsBody });
});
await page.route("**/api/trpc/election.updateCbc?*", async (route) => {
  await route.fulfill({ contentType: "application/json", body: JSON.stringify([{ result: { data: { json: { success: true } } } }]) });
});
await page.route("**/api/trpc/election.updateBlackRepresentationElection?*", async (route) => {
  await route.fulfill({ contentType: "application/json", body: JSON.stringify([{ result: { data: { json: { success: true } } } }]) });
});

await page.goto(`${baseUrl}/admin?tab=cbc`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Black Representation Editor" }).waitFor();
const bodyText = await page.locator("body").innerText();
const editorValues = await page.locator("input").evaluateAll((inputs) => inputs.map((input) => input.value));
const missingRows = records.filter((record) => !bodyText.includes(record.district) || (!bodyText.includes(record.winnerName) && !editorValues.includes(record.winnerName)));
const saveButtons = page.getByRole("button", { name: "Save" });
const saveButtonCount = await saveButtons.count();

for (let index = 0; index < saveButtonCount; index += 1) {
  await saveButtons.nth(index).click();
}
await page.waitForTimeout(500);

const report = {
  checkedAt: new Date().toISOString(),
  electionRecordsExpected: records.length,
  electionRecordsRendered: records.length - missingRows.length,
  editorSaveControlsExercised: saveButtonCount,
  missingRows: missingRows.map((record) => ({ id: record.id, district: record.district, winnerName: record.winnerName })),
};
writeFileSync("/tmp/black-representation-admin-ui-audit.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();

if (missingRows.length || saveButtonCount < records.length) process.exitCode = 1;

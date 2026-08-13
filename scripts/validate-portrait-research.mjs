import { readdir, readFile, writeFile } from "node:fs/promises";

const directory = process.argv[2] ?? "docs/candidate-photo-research-results";
const outputPath = process.argv[3] ?? "docs/candidate-photo-research-validated-2026-08-13.json";
const files = (await readdir(directory)).filter((file) => file.endsWith(".csv")).sort();

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
      value = "";
    } else value += character;
  }
  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [headers, ...body] = rows;
  return body.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

async function validateUrl(url) {
  if (!url?.startsWith("http")) return { valid: false, reason: "missing_url" };
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(30_000) });
    if (!response.ok || response.status === 405) response = await fetch(url, { headers: { Range: "bytes=0-1024" }, redirect: "follow", signal: AbortSignal.timeout(30_000) });
    return response.ok ? { valid: true, status: response.status, contentType: response.headers.get("content-type") ?? "" } : { valid: false, reason: `http_${response.status}` };
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : "network_error" };
  }
}

async function extractSourcePageImage(url) {
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30_000) });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    const html = await response.text();
    const candidates = [
      ...html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/gi),
      ...html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/gi),
    ].map((match) => match[1]);
    for (const candidate of candidates) {
      const imageUrl = new URL(candidate, response.url).toString();
      const image = await validateUrl(imageUrl);
      if (image.valid && image.contentType.startsWith("image/")) return { imageUrl, image };
    }
  } catch {
    return null;
  }
  return null;
}

const rows = (await Promise.all(files.map(async (file) => parseCsv(await readFile(`${directory}/${file}`, "utf8"))))).flat();
const verified = rows.filter((row) => row.status === "verified");
const validated = [];
const queue = [...verified];
const workerCount = 12;
await Promise.all(Array.from({ length: workerCount }, async () => {
  while (queue.length) {
    const row = queue.shift();
    if (!row) return;
    const [image, page] = await Promise.all([validateUrl(row.direct_image_url), validateUrl(row.portrait_page_url)]);
    const recovered = !image.valid && page.valid ? await extractSourcePageImage(row.portrait_page_url) : null;
    const resolvedImage = recovered?.image ?? image;
    validated.push({ ...row, image: resolvedImage, page, resolved_image_url: recovered?.imageUrl ?? row.direct_image_url, image_origin: recovered ? "source_page_metadata" : "research_direct_url", integrationReady: resolvedImage.valid && page.valid });
  }
}));

const ready = validated.filter((row) => row.integrationReady);
const nameGroups = new Map();
for (const row of ready) {
  const key = row.candidate_name.toLowerCase().trim();
  const group = nameGroups.get(key) ?? [];
  group.push(row);
  nameGroups.set(key, group);
}
const conflictFree = ready.filter((row) => {
  const group = nameGroups.get(row.candidate_name.toLowerCase().trim()) ?? [];
  return new Set(group.map((item) => item.resolved_image_url)).size === 1;
});

const report = {
  totalRows: rows.length,
  researchVerified: verified.length,
  validatedPortraits: ready.length,
  conflictFreePortraits: conflictFree.length,
  validationFailures: validated.filter((row) => !row.integrationReady),
  integrationRows: conflictFree,
  unresolvedRows: rows.filter((row) => row.status !== "verified"),
};

await writeFile(outputPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ totalRows: report.totalRows, researchVerified: report.researchVerified, validatedPortraits: report.validatedPortraits, conflictFreePortraits: report.conflictFreePortraits, validationFailures: report.validationFailures.length, unresolved: report.unresolvedRows.length }, null, 2));

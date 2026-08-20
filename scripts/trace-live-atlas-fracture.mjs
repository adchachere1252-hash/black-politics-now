import fs from "node:fs/promises";

const origin = process.env.ATLAS_ORIGIN ?? "https://blkpolnow-nztxnshf.manus.space";
const route = `${origin}/atlas?state=AL&congress=119&overlay=party&productionTrace=${Date.now()}`;
const output = "/home/ubuntu/atlas-audit/live-atlas-fracture-trace.json";
const screenshotPath = "/home/ubuntu/atlas-audit/live-atlas-fracture-trace.png";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function createTarget(url) {
  const response = await fetch(`http://127.0.0.1:9222/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  if (!response.ok) throw new Error(`Unable to open production trace target: ${response.status}`);
  return response.json();
}

function connect(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 1;
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id) return;
    const deferred = pending.get(message.id);
    if (!deferred) return;
    pending.delete(message.id);
    message.error ? deferred.reject(new Error(message.error.message)) : deferred.resolve(message.result);
  });
  return {
    async command(method, params = {}) {
      await ready;
      const id = nextId++;
      const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
      socket.send(JSON.stringify({ id, method, params }));
      return result;
    },
    close() { socket.close(); },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.command("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
  return result.result.value;
}

async function evaluateAfterNavigation(cdp, expression) {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      return await evaluate(cdp, expression);
    } catch (error) {
      lastError = error;
      if (!String(error).includes("Execution context was destroyed")) throw error;
      await sleep(1500);
    }
  }
  throw lastError;
}

async function main() {
  const html = await (await fetch(route, { cache: "no-store" })).text();
  const moduleSrc = [...html.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((match) => new URL(match[1], origin).href);
  const target = await createTarget(route);
  const cdp = connect(target.webSocketDebuggerUrl);
  try {
    await cdp.command("Page.enable");
    await cdp.command("Page.bringToFront");
    const surface = await evaluateAfterNavigation(cdp, `
      (async () => {
        const start = Date.now();
        while (Date.now() - start < 60000) {
          const paths = [...document.querySelectorAll('path[data-atlas-path-key]')];
          if (document.body.innerText.includes('50/50 states') && paths.length >= 400) {
            const resources = performance.getEntriesByType('resource').map((entry) => entry.name)
              .filter((name) => /district|ucla|canonical|topo/i.test(name));
            const svg = paths[0]?.ownerSVGElement;
            const rect = svg?.getBoundingClientRect();
            const gapAudit = (() => {
              if (!rect) return { candidateCount: -1, candidates: [] };
              const step = 5;
              const cols = Math.floor(rect.width / step);
              const rows = Math.floor(rect.height / step);
              const painted = Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => {
                const hit = document.elementFromPoint(rect.left + col * step + step / 2, rect.top + row * step + step / 2);
                return Boolean(hit?.closest?.('path[data-atlas-path-key]'));
              }));
              const seen = Array.from({ length: rows }, () => Array(cols).fill(false));
              const candidates = [];
              for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) {
                if (painted[row][col] || seen[row][col]) continue;
                const queue = [[row, col]];
                seen[row][col] = true;
                let cells = 0;
                let touchesEdge = false;
                while (queue.length) {
                  const [currentRow, currentCol] = queue.pop();
                  cells += 1;
                  if (currentRow === 0 || currentCol === 0 || currentRow === rows - 1 || currentCol === cols - 1) touchesEdge = true;
                  for (const [nextRow, nextCol] of [[currentRow - 1, currentCol], [currentRow + 1, currentCol], [currentRow, currentCol - 1], [currentRow, currentCol + 1]]) {
                    if (nextRow < 0 || nextCol < 0 || nextRow >= rows || nextCol >= cols || painted[nextRow][nextCol] || seen[nextRow][nextCol]) continue;
                    seen[nextRow][nextCol] = true;
                    queue.push([nextRow, nextCol]);
                  }
                }
                // Small enclosed components are characteristic of the prior triangular cracks.
                // Large components are natural water bodies; the exterior always touches the SVG edge.
                if (!touchesEdge && cells >= 2 && cells <= 500) candidates.push({ cells, approxAreaPx: cells * step * step });
              }
              return { candidateCount: candidates.length, candidates };
            })();
            return {
              location: window.location.href,
              atlasPathCount: paths.length,
              svgViewBox: svg?.getAttribute('viewBox') ?? null,
              svgRect: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null,
              samplePath: paths[0]?.getAttribute('d')?.slice(0, 120) ?? null,
              resources,
              gapAudit,
              visibleText: document.body.innerText.includes('Source · UCLA CD Maps'),
            };
          }
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        throw new Error('Timed out before production Atlas district surface loaded');
      })()
    `);
    await evaluate(cdp, `(() => { document.querySelector('path[data-atlas-path-key]')?.ownerSVGElement?.scrollIntoView({ block: 'center' }); return true; })()`);
    await sleep(400);
    const screenshot = await cdp.command("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    await fs.writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
    const record = { origin, route, moduleSrc, ...surface, screenshotPath, capturedAt: new Date().toISOString() };
    await fs.writeFile(output, `${JSON.stringify(record, null, 2)}\n`);
    console.log(JSON.stringify(record, null, 2));
    if (record.gapAudit.candidateCount > 0) {
      throw new Error(`Visible-map fracture gate found ${record.gapAudit.candidateCount} small enclosed unpainted surface component(s)`);
    }
  } finally {
    cdp.close();
  }
}

main().catch(async (error) => {
  await fs.writeFile(output, `${JSON.stringify({ origin, route, error: String(error), capturedAt: new Date().toISOString() }, null, 2)}\n`);
  console.error(error);
  process.exitCode = 1;
});

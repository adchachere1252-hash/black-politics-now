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
            return {
              location: window.location.href,
              atlasPathCount: paths.length,
              svgViewBox: svg?.getAttribute('viewBox') ?? null,
              svgRect: rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null,
              samplePath: paths[0]?.getAttribute('d')?.slice(0, 120) ?? null,
              resources,
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
  } finally {
    cdp.close();
  }
}

main().catch(async (error) => {
  await fs.writeFile(output, `${JSON.stringify({ origin, route, error: String(error), capturedAt: new Date().toISOString() }, null, 2)}\n`);
  console.error(error);
  process.exitCode = 1;
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { registerAtlasBoundaryRoute } from "./atlasBoundaryRoute";

type Handler = (req: { params: Record<string, string> }, res: ReturnType<typeof createResponse>) => Promise<unknown> | unknown;

function createResponse() {
  const response = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
    status(code: number) { response.statusCode = code; return response; },
    json(body: unknown) { response.body = body; return response; },
    send(body: unknown) { response.body = body; return response; },
    setHeader(name: string, value: string) { response.headers[name.toLowerCase()] = value; return response; },
  };
  return response;
}

function createRouteRegistry() {
  const routes = new Map<string, Handler>();
  registerAtlasBoundaryRoute({ get: (path: string, handler: Handler) => { routes.set(path, handler); } } as any);
  return routes;
}

afterEach(() => vi.unstubAllGlobals());

describe("Historical Atlas boundary bundle", () => {
  it("rejects Congress values outside the supported historical time-travel range", async () => {
    const routes = createRouteRegistry();
    const response = createResponse();
    await routes.get("/api/atlas/bundle/:congress")!({ params: { congress: "120" } }, response);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ error: "Congress must be between 89 and 119" });
  });

  it("builds a repository-backed national bundle for a valid Congress", async () => {
    const routes = createRouteRegistry();
    const response = createResponse();
    const historicalFeatureCollection = JSON.stringify({ type: "FeatureCollection", features: [], source: "repository-backed congressional district boundary fixture retained for Atlas validation" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => historicalFeatureCollection }));

    await routes.get("/api/atlas/bundle/:congress")!({ params: { congress: "119" } }, response);

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("application/json");
    expect(Object.keys(JSON.parse(String(response.body)))).not.toHaveLength(0);
  });
});

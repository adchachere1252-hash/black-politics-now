import { afterEach, describe, expect, it, vi } from "vitest";
import { gunzipSync } from "node:zlib";
import { registerAtlasBoundaryRoute } from "./atlasBoundaryRoute";

type Handler = (req: { params: Record<string, string>; query?: Record<string, string> }, res: ReturnType<typeof createResponse>) => Promise<unknown> | unknown;

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
    expect(response.headers["content-encoding"]).toBe("gzip");
    expect(Object.keys(JSON.parse(gunzipSync(response.body as Buffer).toString("utf8")))).not.toHaveLength(0);
  });

  it("serves compact repository-backed chunks for production-safe national map loading", async () => {
    const routes = createRouteRegistry();
    const response = createResponse();
    const historicalFeatureCollection = JSON.stringify({ type: "FeatureCollection", features: [], source: "repository-backed congressional district boundary fixture retained for Atlas validation" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => historicalFeatureCollection }));

    await routes.get("/api/atlas/bundle/:congress")!({ params: { congress: "118" }, query: { chunk: "0" } }, response);

    expect(response.statusCode).toBe(200);
    expect(Object.keys(JSON.parse(gunzipSync(response.body as Buffer).toString("utf8")))).toHaveLength(10);
  });

  it("returns verified Voteview House member and party overlay data without recoding other parties", async () => {
    const routes = createRouteRegistry();
    const response = createResponse();
    const csv = [
      "congress,chamber,icpsr,state_icpsr,district_code,state_abbrev,party_code,occupancy,last_means,bioname,bioguide_id",
      "119,House,1,41,3,AL,200,,,\"ROGERS, Mike Dennis\",R000575",
      "119,House,2,2,0,AK,100,,,\"PAPPAS, Sample\",P000001",
      "119,House,3,6,5,CA,328,,,\"EXAMPLE, Independent\",E000001",
    ].join("\n");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => csv }));

    await routes.get("/api/atlas/overlay/:congress")!({ params: { congress: "119" } }, response);

    expect(response.statusCode).toBe(200);
    const body = response.body as { members: Record<string, { name: string; party: string; partyCode: number }> };
    expect(body.members["AL-3"]).toMatchObject({ name: "Mike Dennis Rogers", party: "R", partyCode: 200 });
    expect(body.members["AK-0"]).toMatchObject({ party: "D" });
    expect(body.members["CA-5"]).toMatchObject({ party: "O", partyCode: 328 });
  });
});

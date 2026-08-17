import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hashPodcastSession } from "./podcastLegacy";

function publicContext(): TrpcContext {
  return { user: null, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as unknown as TrpcContext["res"] };
}

function adminContext(): TrpcContext {
  return { user: { role: "admin", name: "Test Administrator" } as TrpcContext["user"], req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => {} } as unknown as TrpcContext["res"] };
}

describe("podcast legacy publishing and analytics safeguards", () => {
  it("hashes a browser-session token without retaining its raw value", () => {
    const token = "f5336cc7-40fd-4431-a5ad-c97bb9d89cd8";
    const hash = hashPodcastSession(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(hashPodcastSession(token));
    expect(hash).not.toContain(token);
  });

  it("rejects malformed episode dates before any public playback event can be written", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.podcast.trackPlay({ episodeDate: "August 17", playbackKind: "episode", voice: "andrew", sessionToken: "f5336cc7-40fd-4431-a5ad-c97bb9d89cd8" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("keeps listener reporting and show-note generation behind the administrator role", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.podcast.analytics({ days: 30 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.podcast.buildShowNotes({ episodeDate: "2026-08-17" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns a bounded administrator analytics report without requiring listener identity", async () => {
    const caller = appRouter.createCaller(adminContext());
    const report = await caller.podcast.analytics({ days: 30 });
    expect(report).toMatchObject({ days: 30 });
    expect(Array.isArray(report.dailyTrend)).toBe(true);
    expect(Array.isArray(report.topEpisodes)).toBe(true);
    expect(Array.isArray(report.topSegments)).toBe(true);
  });
});

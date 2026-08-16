import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hashAnalyticsSession } from "./siteAnalytics";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function adminContext(): TrpcContext {
  return {
    user: { role: "admin" } as TrpcContext["user"],
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("site analytics privacy and access controls", () => {
  it("hashes anonymous browser session tokens deterministically without retaining the token", () => {
    const token = "a4f9c0fd-7fae-4d17-a1ad-458de4b942d1";
    const hash = hashAnalyticsSession(token);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(hashAnalyticsSession(token));
    expect(hash).not.toContain(token);
    expect(hash).not.toBe(hashAnalyticsSession("e0a38a35-3039-4f3c-b41c-6739340e1d7a"));
  });

  it("rejects invalid public tracking paths before writing an analytics event", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.siteAnalytics.trackPageView({
      pagePath: "not-a-path",
      sessionToken: "a4f9c0fd-7fae-4d17-a1ad-458de4b942d1",
      deviceType: "desktop",
      referrerHost: null,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" } satisfies Partial<TRPCError>);
  });

  it("keeps engagement summaries restricted to administrators", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.siteAnalytics.engagementSummary({ days: 7 })).rejects.toMatchObject({ code: "FORBIDDEN" } satisfies Partial<TRPCError>);
  });

  it("returns a bounded reporting shape to an administrator", async () => {
    const caller = appRouter.createCaller(adminContext());
    const report = await caller.siteAnalytics.engagementSummary({ days: 7 });
    expect(report).toMatchObject({ days: 7 });
    expect(Array.isArray(report.daily)).toBe(true);
    expect(Array.isArray(report.topPages)).toBe(true);
    expect(Array.isArray(report.devices)).toBe(true);
    expect(Array.isArray(report.recentActivity)).toBe(true);
  });
});

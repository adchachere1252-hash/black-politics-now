import { describe, expect, it } from "vitest";
import { getAdminFreshness } from "./adminFreshness";

describe("Admin operational freshness", () => {
  it("marks current timestamps accurately", () => {
    expect(getAdminFreshness("2026-08-19T12:00:30.000Z", Date.parse("2026-08-19T12:01:00.000Z"))).toEqual({ minutesAgo: 0, label: "Updated just now", stale: false });
  });

  it("flags missing and over-two-hour records rather than presenting them as live", () => {
    expect(getAdminFreshness(null, Date.parse("2026-08-19T12:00:00.000Z")).stale).toBe(true);
    expect(getAdminFreshness("2026-08-19T09:30:00.000Z", Date.parse("2026-08-19T12:00:00.000Z"))).toEqual({ minutesAgo: 150, label: "150m ago", stale: true });
  });
});

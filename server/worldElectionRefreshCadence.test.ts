import { describe, expect, it } from "vitest";
import { getWorldRefreshMonitoring } from "./worldElectionRefresh";

function election(status: "Upcoming" | "Voting Today" | "Completed", electionDate: string) {
  return { status, electionDate } as any;
}

describe("World Elections refresh cadence", () => {
  const now = new Date("2026-08-16T12:00:00.000Z");

  it("uses a daily baseline when no election is within the next 30 days", () => {
    const monitoring = getWorldRefreshMonitoring([election("Upcoming", "2026-11-17")], new Date("2026-08-15T12:30:00.000Z"), now);
    expect(monitoring).toMatchObject({ cadence: "daily", intervalHours: 24, due: false, nearTermCount: 0, votingTodayCount: 0 });
  });

  it("checks six-hourly while an upcoming election is in the 30-day window", () => {
    const monitoring = getWorldRefreshMonitoring([election("Upcoming", "2026-08-25")], new Date("2026-08-16T05:00:00.000Z"), now);
    expect(monitoring).toMatchObject({ cadence: "six_hour", intervalHours: 6, due: true, nearTermCount: 1, votingTodayCount: 0 });
  });

  it("elevates voting-day source monitoring to hourly", () => {
    const monitoring = getWorldRefreshMonitoring([election("Voting Today", "2026-08-16")], new Date("2026-08-16T11:15:00.000Z"), now);
    expect(monitoring).toMatchObject({ cadence: "hourly", intervalHours: 1, due: false, nearTermCount: 0, votingTodayCount: 1 });
  });
});

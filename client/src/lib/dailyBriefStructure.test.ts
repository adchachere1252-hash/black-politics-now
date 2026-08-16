import { describe, expect, it } from "vitest";
import { getDailyBriefSegmentRole, validateDailyBriefStructure } from "./dailyBriefStructure";

describe("Daily Brief structure", () => {
  it("identifies opening, editorial, and closing segment roles", () => {
    expect(getDailyBriefSegmentRole("00_greeting")).toBe("greeting");
    expect(getDailyBriefSegmentRole("05_tech_news")).toBe("editorial");
    expect(getDailyBriefSegmentRole("14_closing")).toBe("closing");
  });

  it("requires an opening, thirteen editorial segments, a closing, and source context", () => {
    const segments = [
      { key: "00_greeting", sourceLinks: "[{}]" },
      ...Array.from({ length: 13 }, (_, index) => ({ key: `${String(index + 1).padStart(2, "0")}_topic`, sourceLinks: "[{}]" })),
      { key: "14_closing", sourceLinks: "[{}]" },
    ];
    expect(validateDailyBriefStructure(segments)).toMatchObject({ hasOpening: true, hasClosing: true, editorialCount: 13, missingSources: 0, isPublishable: true });
  });

  it("holds an out-of-order or unsourced briefing", () => {
    expect(validateDailyBriefStructure([{ key: "01_topic", sourceLinks: null }, { key: "14_closing", sourceLinks: "[{}]" }]).isPublishable).toBe(false);
  });
});

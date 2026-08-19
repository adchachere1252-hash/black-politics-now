import { describe, expect, it } from "vitest";
import { buildEvidencePackage, type SourceItem } from "./agentDesk";

const sources: SourceItem[] = [
  { id: "news-1", title: "Current reporting", url: "https://example.com/news", excerpt: "Current report", kind: "news" },
  { id: "race-1", title: "Election record", url: "/elections", excerpt: "Current election record", kind: "election" },
];

describe("buildEvidencePackage", () => {
  it("creates a review-first recommendation without an LLM response", () => {
    const result = buildEvidencePackage(sources, "routine");
    expect(result.summary).toContain("No language-model request");
    expect(result.recommendations).toEqual([expect.objectContaining({
      category: "source_watch",
      priority: "medium",
      sourceIds: ["news-1", "race-1"],
    })]);
  });

  it("elevates but does not expand election-night evidence packages", () => {
    const result = buildEvidencePackage(sources, "election_night");
    expect(result.recommendations[0]).toMatchObject({ priority: "high", title: "Review Election Night evidence package" });
  });
});

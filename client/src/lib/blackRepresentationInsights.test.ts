import { describe, expect, it } from "vitest";
import { buildRepresentationTimeline, buildStateComparisons, getSourceReviewBadge } from "./blackRepresentationInsights";

describe("Black Representation insights", () => {
  const articleUrl = "https://blkpoliticsnow.com/article";
  const member = { id: 1, stateCode: "FL", state: "Florida", district: "FL-19", member: "Byron Donalds", status: "advanced_to_general", primaryResult: "Won Republican primary", primaryDate: "August 18, 2026", sourceUrl: "https://example.com/report", sourceLabel: "Independent report", updatedAt: "2026-08-19T12:00:00Z" };
  const contest = { id: 2, stateCode: "FL", state: "Florida", district: "FL-Sen", electionType: "primary", electionDate: "August 18, 2026", resultStatus: "called", winnerName: "Angie Nixon", sourceUrl: articleUrl, sourceLabel: "Black Politics Now primary-results tracker", articleUrl, lastVerifiedAt: "2026-08-19T13:00:00Z" };

  it("distinguishes reviewed reporting, article references, and records needing source review", () => {
    expect(getSourceReviewBadge(member)).toMatchObject({ tone: "verified", label: "Source reviewed" });
    expect(getSourceReviewBadge(contest)).toMatchObject({ tone: "article", label: "Article reference" });
    expect(getSourceReviewBadge({ resultStatus: "too_close_to_call" })).toMatchObject({ tone: "review", label: "Source review" });
  });

  it("builds a state-level comparison without treating pending evidence as reviewed", () => {
    const comparisons = buildStateComparisons([member], [contest, { ...contest, id: 3, district: "FL-24", resultStatus: "too_close_to_call", sourceUrl: null }]);
    expect(comparisons).toEqual([expect.objectContaining({ stateCode: "FL", trackedPeople: 1, advanced: 1, contests: 2, sourceReviewed: 2, needsReview: 1 })]);
  });

  it("returns primary-to-general context for the selected state", () => {
    const timeline = buildRepresentationTimeline([member], [contest], "FL");
    expect(timeline).toHaveLength(2);
    expect(timeline).toEqual(expect.arrayContaining([
      expect.objectContaining({ district: "FL-Sen", stage: "primary", headline: "Angie Nixon" }),
      expect.objectContaining({ district: "FL-19", stage: "primary", headline: "Byron Donalds" }),
    ]));
  });
});

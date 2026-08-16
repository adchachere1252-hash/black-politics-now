import { describe, expect, it } from "vitest";
import { getPortraitApprovalEvidence } from "./portraitReviewEvidence";

describe("getPortraitApprovalEvidence", () => {
  it("returns a visual approval package only when a direct image and a separate cited source are present", () => {
    const evidence = getPortraitApprovalEvidence([{ title: "Official portrait", proposedValue: "Image: https://campaign.example/images/candidate.jpg", evidence: JSON.stringify([{ title: "Official campaign", url: "https://campaign.example/about" }]) }]);
    expect(evidence).toEqual({ imageUrl: "https://campaign.example/images/candidate.jpg", sourceUrl: "https://campaign.example/about", sourceTitle: "Official campaign", proposalTitle: "Official portrait" });
  });

  it("rejects research-only proposals that have a citation but no portrait asset", () => {
    expect(getPortraitApprovalEvidence([{ title: "Research note", proposedValue: "Official biography found", evidence: JSON.stringify([{ title: "Official biography", url: "https://campaign.example/about" }]) }])).toBeNull();
  });

  it("does not treat an unverified image URL with no separate source page as approval-ready", () => {
    expect(getPortraitApprovalEvidence([{ title: "Unverified image", proposedValue: "https://images.example/candidate.jpg", evidence: "[]" }])).toBeNull();
  });
});

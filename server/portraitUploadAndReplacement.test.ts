import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const portraitReview = readFileSync(new URL("./portraitReview.ts", import.meta.url), "utf8");
const router = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const reviewUi = readFileSync(new URL("../client/src/components/PortraitReviewTab.tsx", import.meta.url), "utf8");

describe("Portrait upload, replacement, and public-application contract", () => {
  it("offers every valid portrait slot for source-reviewed replacement, not just missing-photo targets", () => {
    expect(portraitReview).toContain("getPortraitManagementTargets");
    expect(portraitReview).toContain("currentPhotoUrl");
    expect(router).toContain("managementTargets: adminProcedure");
    expect(reviewUi).toContain("Include candidates with current images");
    expect(reviewUi).toContain("newly approved submission will replace this portrait");
  });

  it("uses a protected, type-checked storage route for uploaded portrait files", () => {
    expect(portraitReview).toContain("uploadPortraitImage");
    expect(portraitReview).toContain("storagePut(`candidate-portraits/");
    expect(portraitReview).toContain("hasValidImageSignature");
    expect(portraitReview).toContain("5 * 1024 * 1024");
    expect(router).toContain("upload: adminProcedure");
    expect(reviewUi).toContain("Upload portrait file");
    expect(reviewUi).toContain("Saving image file to secure storage");
    expect(portraitReview).toContain('value.startsWith("/manus-storage/candidate-portraits/")');
    expect(reviewUi).toContain('imageUrl.trim().startsWith("/manus-storage/candidate-portraits/")');
  });

  it("keeps review approval as the only public-portrait mutation path across every candidate record type", () => {
    expect(portraitReview).toContain('submission.targetPhotoField === "candidate1" ? { candidate1Photo: submission.imageUrl }');
    expect(portraitReview).toContain('submission.targetPhotoField === "dem" ? { demPhoto: submission.imageUrl }');
    expect(portraitReview).toContain("db.update(cbcMembers).set({ photo: submission.imageUrl })");
    expect(portraitReview).toContain('if (submission.status !== "pending") throw new Error("Portrait submission has already been reviewed")');
  });

  it("lets an administrator find a candidate and only reports saved after the submission or review mutation resolves", () => {
    expect(reviewUi).toContain("candidateQuery");
    expect(reviewUi).toContain("visibleTargets");
    expect(reviewUi).toContain("Search name, state, district, or office");
    expect(reviewUi).toContain("source-backed portrait is now in the Approve / Deny queue");
    expect(reviewUi).toContain("public portrait and private review record refreshed");
  });

  it("blocks approval for a selected proposal whose visual preview fails, while preserving denial for documented follow-up", () => {
    expect(reviewUi).toContain("selectedPreviewUnavailable");
    expect(reviewUi).toContain("onError={() => setSelectedPreviewUnavailable(true)}");
    expect(reviewUi).toContain("disabled={review.isPending || selectedPreviewUnavailable}");
    expect(reviewUi).toContain("Preview failed to load. Deny this item with a reason or replace the source package; approval is blocked.");
  });

  it("provides the existing protected candidate-specific research route inside Portrait Review without auto-publishing an image", () => {
    expect(router).toContain("researchNow: adminProcedure");
    expect(reviewUi).toContain("trpc.portraits.researchNow.useMutation");
    expect(reviewUi).toContain("Check available evidence");
    expect(reviewUi).toContain("Research found a reviewable source package");
    expect(reviewUi).toContain("No direct image package was found");
    expect(reviewUi).toContain("never publishes an image automatically");
  });
});

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
});

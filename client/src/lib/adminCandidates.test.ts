import { describe, expect, it } from "vitest";
import { buildAdminCandidateRows } from "./adminCandidates";

describe("buildAdminCandidateRows", () => {
  it("keeps candidate categories separate and marks missing or pending portraits accurately", () => {
    const rows = buildAdminCandidateRows({
      senate: [{ id: 1, stateName: "Example", candidate1Name: "Alex One", candidate1Party: "D", candidate1Photo: "/alex.jpg", candidate2Name: "Blair Two", candidate2Party: "R", candidate2Photo: "" }],
      house: [],
      governors: [],
      blackRepresentation: [{ id: 7, member: "Casey Three", state: "Example", district: "EX-7", photo: "" }],
      missingTargets: [{ targetType: "senate", targetRecordId: 1, targetPhotoField: "candidate2" }, { targetType: "black_representation", targetRecordId: 7, targetPhotoField: "profile" }],
      portraitSubmissions: [{ targetType: "black_representation", targetRecordId: 7, targetPhotoField: "profile", status: "pending" }],
    });

    expect(rows.map((row) => [row.candidateName, row.photoStatus])).toEqual([
      ["Alex One", "needs_verification"],
      ["Blair Two", "evidence_needed"],
      ["Casey Three", "pending_review"],
    ]);
    expect(rows.find((row) => row.candidateName === "Blair Two")?.portraitTarget).toEqual({ targetType: "senate", targetRecordId: 1, targetPhotoField: "candidate2" });
  });
});

import { describe, expect, it } from "vitest";
import { getWorldGlobeLabels } from "./worldGlobeLabels";

describe("World globe country labels", () => {
  it("labels every unique tracked country that has repository coordinates", () => {
    const labels = getWorldGlobeLabels([
      { countryCode: "ZM", country: "Zambia", status: "Voting Today" },
      { countryCode: "CK", country: "Cook Islands", status: "Upcoming" },
      { countryCode: "ZM", country: "Zambia", status: "Completed" },
    ]);
    expect(labels).toHaveLength(2);
    expect(labels.map((label) => label.country)).toEqual(["Zambia", "Cook Islands"]);
  });

  it("applies a callout to dense-country labels while preserving their source coordinates", () => {
    const [label] = getWorldGlobeLabels([{ countryCode: "CH", country: "Switzerland", status: "Upcoming" }]);
    expect(label).toMatchObject({ latitude: 47, longitude: 8, labelLatitude: 42, labelLongitude: 0 });
  });

  it("does not invent a label when the repository does not provide a coordinate", () => {
    expect(getWorldGlobeLabels([{ countryCode: "XX", country: "Unmapped", status: "Upcoming" }])).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { FULL_COUNTRY_CENTROIDS, getCountryFocusCoordinates, getLabelsForDensity, getWorldGlobeCountryIndex, getWorldGlobeLabels } from "./worldGlobeLabels";

describe("World globe country labels", () => {
  it("keeps one bright tracked label per country while retaining the complete context catalog", () => {
    const labels = getWorldGlobeLabels([
      { countryCode: "ZM", country: "Zambia", status: "Voting Today" },
      { countryCode: "CK", country: "Cook Islands", status: "Upcoming" },
      { countryCode: "ZM", country: "Zambia", status: "Completed" },
    ]);
    expect(labels.filter((label) => label.tracked).map((label) => label.country)).toEqual(["Cook Islands", "Zambia"]);
    expect(labels.find((label) => label.countryCode === "ZM")).toMatchObject({ status: "Voting Today", tracked: true });
    expect(labels.find((label) => label.countryCode === "CA")).toMatchObject({ tracked: false, country: "Canada" });
  });

  it("applies a callout to dense-country labels while preserving their source coordinates", () => {
    const label = getWorldGlobeLabels([{ countryCode: "CH", country: "Switzerland", status: "Upcoming" }]).find((item) => item.countryCode === "CH");
    expect(label).toMatchObject({ latitude: 47, longitude: 8, labelLatitude: 42, labelLongitude: 0 });
  });

  it("ports the original complete country centroid catalog", () => {
    expect(Object.keys(FULL_COUNTRY_CENTROIDS)).toHaveLength(180);
    expect(getWorldGlobeLabels([]).length).toBeGreaterThan(120);
  });

  it("keeps country markers available while label density can reduce visual text", () => {
    const elections = [{ countryCode: "ZM", country: "Zambia", status: "Voting Today" }];
    expect(getLabelsForDensity(elections, "full").length).toBeGreaterThan(100);
    expect(getLabelsForDensity(elections, "elections")).toMatchObject([{ countryCode: "ZM", tracked: true }]);
    expect(getLabelsForDensity(elections, "markers")).toEqual([]);
  });

  it("provides focus coordinates and every country for the compact explorer index", () => {
    const index = getWorldGlobeCountryIndex([{ countryCode: "ZM", country: "Zambia", status: "Voting Today" }]);
    expect(index).toHaveLength(180);
    expect(index.find((country) => country.countryCode === "ZM")).toMatchObject({ tracked: true, country: "Zambia" });
    expect(getCountryFocusCoordinates("ZM")).toEqual([-13, 28]);
    expect(getCountryFocusCoordinates("XX")).toBeNull();
  });
});

export type AtlasDistrictParty = "D" | "R" | "O";

export type AtlasDistrictMemberDetail = {
  name: string;
  party: AtlasDistrictParty;
  partyCode: number;
  bioguideId: string | null;
};

export type AtlasDistrictSelection = {
  congress: number;
  state: string;
  stateCode: string;
  districtNumber: number;
  districtLabel: string;
  sourceFeatureId: string;
  member: AtlasDistrictMemberDetail | null;
};

export function atlasDistrictLabel(district: number) {
  return district === 0 ? "At-large" : `District ${district}`;
}

export function atlasPartyLabel(party: AtlasDistrictParty, partyCode?: number) {
  if (party === "D") return "Democratic Party";
  if (party === "R") return "Republican Party";
  return partyCode ? `Other party · Voteview code ${partyCode}` : "Other party / independent";
}

export function atlasDistrictSelection(input: Omit<AtlasDistrictSelection, "districtLabel">): AtlasDistrictSelection {
  return {
    ...input,
    districtLabel: atlasDistrictLabel(input.districtNumber),
  };
}

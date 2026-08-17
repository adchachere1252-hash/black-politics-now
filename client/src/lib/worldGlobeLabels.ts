export type GlobeElectionLabelSource = { countryCode: string; country?: string | null; status: string };

export const WORLD_ELECTION_COORDINATES: Record<string, [number, number]> = {
  DZ: [28, 3], AM: [40, 45], BD: [24, 90], BA: [44, 18], BR: [-10, -55], BG: [43, 25],
  CV: [16, -24], CO: [4, -72], CK: [-21, -159], CZ: [49, 15], ET: [9, 40], DE: [51, 10],
  GW: [12, -15], HT: [19, -72], HU: [47, 20], IN: [22, 79], IL: [31, 35], JP: [36, 138],
  KZ: [48, 68], MA: [32, -6], MX: [24, -102], MM: [21, 96], NL: [52, 5], NZ: [-41, 174],
  PE: [-10, -76], PH: [13, 122], PT: [39, -8], RO: [46, 25], RS: [44, 21], SG: [1, 104],
  SK: [49, 20], SO: [6, 46], KR: [36, 128], SE: [62, 15], TW: [24, 121], UG: [1, 32],
  US: [39, -98], VN: [16, 108], ZM: [-14, 28], TH: [15, 101], NP: [28, 84], CH: [47, 8],
  ST: [0, 6], RU: [61, 105], NI: [13, -85], PS: [32, 35], GM: [13, -16], SS: [7, 30], GB: [55, -3],
};

type LabelOffset = { latitude: number; longitude: number; altitude?: number };

// Repository-style callouts keep the dense European, Caribbean, African, and
// Asia-Pacific labels legible without silently omitting tracked countries.
const LABEL_OFFSETS: Record<string, LabelOffset> = {
  BA: { latitude: -5, longitude: 6 }, BG: { latitude: -4, longitude: 7 }, CH: { latitude: -5, longitude: -8 },
  CZ: { latitude: 4, longitude: 8 }, DE: { latitude: 5, longitude: -4 }, HU: { latitude: 5, longitude: 2 },
  NL: { latitude: 6, longitude: -5 }, PT: { latitude: -4, longitude: -7 }, RO: { latitude: 5, longitude: 6 },
  RS: { latitude: -5, longitude: 5 }, SK: { latitude: -3, longitude: 10 }, ST: { latitude: -5, longitude: -7 },
  CO: { latitude: -7, longitude: -12 }, SG: { latitude: -4, longitude: 5 }, PS: { latitude: -4, longitude: -7 }, IL: { latitude: 4, longitude: 5 },
  NP: { latitude: 5, longitude: -6 }, TW: { latitude: -3, longitude: 5 }, VN: { latitude: 0, longitude: 6 },
  JP: { latitude: 5, longitude: 7 }, PH: { latitude: -5, longitude: 7 }, NZ: { latitude: -7, longitude: 6 },
  CK: { latitude: -7, longitude: 0 }, CV: { latitude: 8, longitude: -16 }, GM: { latitude: -9, longitude: -16 },
  GW: { latitude: -3, longitude: -8 }, SO: { latitude: 0, longitude: 7 }, SS: { latitude: 4, longitude: 6 },
  HT: { latitude: 5, longitude: -5 }, NI: { latitude: -5, longitude: -5 },
};

export type WorldGlobeLabel = {
  countryCode: string;
  country: string;
  status: string;
  latitude: number;
  longitude: number;
  labelLatitude: number;
  labelLongitude: number;
  altitude: number;
};

export function getWorldGlobeLabels(elections: GlobeElectionLabelSource[]): WorldGlobeLabel[] {
  const seen = new Set<string>();
  return elections.flatMap((election) => {
    if (seen.has(election.countryCode)) return [];
    seen.add(election.countryCode);
    const coordinates = WORLD_ELECTION_COORDINATES[election.countryCode];
    if (!coordinates || !election.country?.trim()) return [];
    const [latitude, longitude] = coordinates;
    const offset = LABEL_OFFSETS[election.countryCode] ?? { latitude: 2.4, longitude: 0 };
    return [{
      countryCode: election.countryCode,
      country: election.country.trim(),
      status: election.status,
      latitude,
      longitude,
      labelLatitude: latitude + offset.latitude,
      labelLongitude: longitude + offset.longitude,
      altitude: offset.altitude ?? 1.15,
    }];
  });
}

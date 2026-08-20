import { UCLA_TRUE_DISTRICT_ASSETS } from "../client/src/data/atlasTrueDistrictAssets";

const ORIGIN = "http://127.0.0.1:3000";

function coordinatePositions(geometry: any): number {
  if (!geometry) return 0;
  if (geometry.type === "Polygon") return geometry.coordinates?.flat(2).length / 2 || 0;
  if (geometry.type === "MultiPolygon") return geometry.coordinates?.flat(3).length / 2 || 0;
  return 0;
}

async function main() {
  const rows: any[] = [];
  for (const [rawCongress, asset] of Object.entries(UCLA_TRUE_DISTRICT_ASSETS)) {
    const congress = Number(rawCongress);
    const [geometryResponse, overlayResponse] = await Promise.all([
      fetch(`${ORIGIN}${asset}`),
      fetch(`${ORIGIN}/api/atlas/overlay/${congress}`),
    ]);
    if (!geometryResponse.ok) throw new Error(`${congress}: geometry HTTP ${geometryResponse.status}`);
    if (!overlayResponse.ok) throw new Error(`${congress}: overlay HTTP ${overlayResponse.status}`);
    const frame = await geometryResponse.json();
    const overlay = await overlayResponse.json();
    const stateSet = new Set(frame.features.map((feature: any) => feature.properties?.state).filter(Boolean));
    const ids = frame.features.map((feature: any) => feature.properties?.id).filter(Boolean);
    const districtKeys = frame.features.map((feature: any) => `${feature.properties?.state}|${feature.properties?.district}`);
    const expectedOverlayKeys = frame.features.map((feature: any) => {
      const stateName = feature.properties?.state;
      const stateCode = Object.entries({ Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT", Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY" } as Record<string, string>).find(([name]) => name === stateName)?.[1];
      return stateCode ? `${stateCode}-${feature.properties?.district}` : null;
    }).filter(Boolean);
    const usableGeometry = frame.features.filter((feature: any) => ["Polygon", "MultiPolygon"].includes(feature.geometry?.type) && coordinatePositions(feature.geometry) >= 4).length;
    const members = Object.values(overlay.members ?? {});
    rows.push({
      congress,
      http: { geometry: geometryResponse.status, overlay: overlayResponse.status },
      geometry: {
        type: frame.type,
        metadataCongress: frame.metadata?.congress,
        source: frame.metadata?.source,
        sourceUrl: frame.metadata?.sourceUrl,
        metadataStates: frame.metadata?.states,
        metadataFeatures: frame.metadata?.districtFeatures,
        features: frame.features.length,
        namedStates: stateSet.size,
        uniqueFeatureIds: new Set(ids).size,
        uniqueStateDistrictKeys: new Set(districtKeys).size,
        usablePolygons: usableGeometry,
      },
      overlay: {
        source: overlay.source?.name,
        memberRecords: members.length,
        validMemberRecords: members.filter((member: any) => member && typeof member.name === "string" && typeof member.stateCode === "string" && Number.isFinite(member.district)).length,
        missingDistrictKeys: expectedOverlayKeys.filter((key) => {
          if (Object.hasOwn(overlay.members ?? {}, key)) return false;
          const [stateCode, district] = key.split("-");
          return district !== "0" || ![`${stateCode}-1`, `${stateCode}-98`, `${stateCode}-99`].some((fallback) => Object.hasOwn(overlay.members ?? {}, fallback));
        }),
      },
    });
  }
  const failures = rows.filter((row) => row.geometry.type !== "FeatureCollection"
    || row.geometry.metadataCongress !== row.congress
    || row.geometry.metadataStates !== 50
    || row.geometry.namedStates !== 50
    || row.geometry.metadataFeatures !== row.geometry.features
    || row.geometry.uniqueFeatureIds !== row.geometry.features
    || row.geometry.uniqueStateDistrictKeys !== row.geometry.features
    || row.geometry.usablePolygons !== row.geometry.features
    || !String(row.geometry.sourceUrl).includes("cdmaps.polisci.ucla.edu")
    || row.overlay.validMemberRecords !== row.overlay.memberRecords);
  console.log(JSON.stringify({ passed: failures.length === 0, frames: rows.length, failures, rows }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

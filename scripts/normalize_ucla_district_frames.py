import json
import pathlib
import re

ASSET_DIR = pathlib.Path("/home/ubuntu/webdev-static-assets/atlas-ucla-districts")
HISTORY_FILE = pathlib.Path("/home/ubuntu/black-politics-now/client/src/data/atlasHistory.ts")

def read_apportionment():
    source = HISTORY_FILE.read_text()
    block = source.split("export const APPORTIONMENT_HISTORY", 1)[1].split("};", 1)[0]
    entries = re.findall(r'(?:"([^"]+)"|([A-Za-z]+)): \[([^\]]+)\]', block)
    return {(quoted or bare): [int(value.strip()) for value in raw_values.split(",")] for quoted, bare, raw_values in entries}

def cycle_index(congress):
    if congress <= 92: return 0
    if congress <= 97: return 1
    if congress <= 102: return 2
    if congress <= 107: return 3
    if congress <= 112: return 4
    if congress <= 117: return 5
    return 6

apportionment = read_apportionment()

for frame_path in sorted(ASSET_DIR.glob("districts*.json")):
    frame = json.loads(frame_path.read_text())
    congress = int(frame["metadata"]["congress"])
    grouped = {}
    for feature in frame.get("features", []):
        grouped.setdefault(feature["properties"]["state"], []).append(feature)
    normalized = []
    overlap_artifacts_removed = 0
    for state, state_features in grouped.items():
        specific_districts = [feature for feature in state_features if int(feature["properties"].get("district", 0)) > 0]
        if specific_districts:
            seen_districts = set()
            for feature in specific_districts:
                district = int(feature["properties"].get("district", 0))
                if district in seen_districts:
                    overlap_artifacts_removed += 1
                    continue
                seen_districts.add(district)
                normalized.append(feature)
            at_large = [feature for feature in state_features if int(feature["properties"].get("district", 0)) == 0]
            expected = apportionment[state][cycle_index(congress)]
            if len(seen_districts) < expected and at_large:
                normalized.append(at_large[0])
                overlap_artifacts_removed += max(0, len(at_large) - 1)
            else:
                overlap_artifacts_removed += len(at_large)
        else:
            seen_at_large = set()
            for feature in state_features:
                identifier = str(feature["properties"].get("id", ""))
                if identifier in seen_at_large:
                    overlap_artifacts_removed += 1
                    continue
                seen_at_large.add(identifier)
                normalized.append(feature)
    metadata = frame.setdefault("metadata", {})
    metadata["districtFeatures"] = len(normalized)
    metadata["overlapArtifactsRemoved"] = overlap_artifacts_removed
    frame["features"] = normalized
    frame_path.write_text(json.dumps(frame, separators=(",", ":")))
    print(json.dumps({"frame": frame_path.name, "district_features": len(normalized), "overlap_artifacts_removed": overlap_artifacts_removed}))

import json
import pathlib
import re
import sys

ROOT = pathlib.Path("/home/ubuntu/black-politics-now")
ASSET_DIR = pathlib.Path("/home/ubuntu/webdev-static-assets/atlas-ucla-districts")
HISTORY_FILE = ROOT / "client/src/data/atlasHistory.ts"

def read_apportionment():
    source = HISTORY_FILE.read_text()
    block = source.split("export const APPORTIONMENT_HISTORY", 1)[1].split("};", 1)[0]
    entries = re.findall(r'(?:"([^"]+)"|([A-Za-z]+)): \[([^\]]+)\]', block)
    values = {}
    for quoted, bare, raw_values in entries:
        name = quoted or bare
        values[name] = [int(value.strip()) for value in raw_values.split(",")]
    return values

def cycle_index(congress):
    if congress <= 92: return 0
    if congress <= 97: return 1
    if congress <= 102: return 2
    if congress <= 107: return 3
    if congress <= 112: return 4
    if congress <= 117: return 5
    return 6

history = read_apportionment()
all_results = []
for congress in range(89, 120):
    frame_path = ASSET_DIR / f"districts{congress:03d}.json"
    if not frame_path.exists():
        all_results.append({"congress": congress, "status": "missing"})
        continue
    frame = json.loads(frame_path.read_text())
    observed = {}
    districts_by_state = {}
    for feature in frame["features"]:
        state = feature["properties"]["state"]
        observed[state] = observed.get(state, 0) + 1
        districts_by_state.setdefault(state, []).append(feature["properties"]["district"])
    expected = {state: seats[cycle_index(congress)] for state, seats in history.items()}
    mismatches = []
    represented_seats = 0
    for state, seats in expected.items():
        districts = districts_by_state.get(state, [])
        if districts == [0]:
            represented_seats += seats
            continue
        represented_seats += len(districts)
        if len(districts) != seats:
            mismatches.append({"state": state, "expected": seats, "features": observed.get(state, 0), "districts": districts})
    all_results.append({
        "congress": congress,
        "status": "verified" if not mismatches else "mismatch",
        "expected_house_seats": sum(expected.values()),
        "represented_house_seats": represented_seats,
        "district_features": len(frame["features"]),
        "mismatches": mismatches,
    })

output_path = pathlib.Path("/tmp/atlas-true-district-frame-audit.json")
output_path.write_text(json.dumps(all_results, indent=2))
failed = [result for result in all_results if result["status"] != "verified"]
print(json.dumps({"output": str(output_path), "frames": len(all_results), "verified": len(all_results) - len(failed), "failed": len(failed)}))
sys.exit(1 if failed else 0)

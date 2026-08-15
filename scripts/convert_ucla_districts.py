import io
import json
import pathlib
import re
import sys
import urllib.request
import zipfile

import shapefile

STATE_NAMES = {
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
}

OUT_DIR = pathlib.Path("/home/ubuntu/webdev-static-assets/atlas-ucla-districts")
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

def simplify_ring(ring, max_points=70):
    if len(ring) <= max_points or len(ring) < 4:
        return [[round(float(x), 4), round(float(y), 4)] for x, y in ring]
    open_ring = ring[:-1]
    selected = [open_ring[round(index * (len(open_ring) - 1) / (max_points - 1))] for index in range(max_points)]
    simplified = [[round(float(x), 4), round(float(y), 4)] for x, y in selected]
    return simplified + [simplified[0]]

def simplify_geometry(geometry):
    kind = geometry["type"]
    coordinates = geometry["coordinates"]
    if kind == "Polygon":
        return {"type": kind, "coordinates": [simplify_ring(ring) for ring in coordinates]}
    if kind == "MultiPolygon":
        return {"type": kind, "coordinates": [[simplify_ring(ring) for ring in polygon] for polygon in coordinates]}
    return geometry

def convert_congress(congress):
    url = f"https://cdmaps.polisci.ucla.edu/shp/districts{congress:03d}.zip"
    with urllib.request.urlopen(url, timeout=180) as response:
        archive = zipfile.ZipFile(io.BytesIO(response.read()))
    shp_name = next(name for name in archive.namelist() if name.lower().endswith(".shp"))
    dbf_name = next(name for name in archive.namelist() if name.lower().endswith(".dbf"))
    reader = shapefile.Reader(shp=io.BytesIO(archive.read(shp_name)), dbf=io.BytesIO(archive.read(dbf_name)))
    field_names = [field[0] for field in reader.fields[1:]]
    features = []
    for shape_record in reader.iterShapeRecords():
        record = dict(zip(field_names, shape_record.record))
        state = str(record.get("STATENAME", ""))
        if state not in STATE_NAMES:
            continue
        district = int(float(record.get("DISTRICT", 0) or 0))
        features.append({
            "type": "Feature",
            "properties": {"state": state, "district": district, "id": str(record.get("ID", ""))},
            "geometry": simplify_geometry(shape_record.shape.__geo_interface__),
        })
    apportionment = read_apportionment()
    grouped = {}
    for feature in features:
        grouped.setdefault(feature["properties"]["state"], []).append(feature)
    normalized = []
    overlap_artifacts_removed = 0
    for state, state_features in grouped.items():
        specific_districts = [feature for feature in state_features if feature["properties"]["district"] > 0]
        if specific_districts:
            expected = apportionment[state][cycle_index(congress)]
            seen_districts = set()
            for feature in specific_districts:
                district = feature["properties"]["district"]
                if district in seen_districts:
                    overlap_artifacts_removed += 1
                    continue
                seen_districts.add(district)
                normalized.append(feature)
            at_large = [feature for feature in state_features if feature["properties"]["district"] == 0]
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
    output = {
        "type": "FeatureCollection",
        "metadata": {"source": "UCLA Congressional District Maps", "sourceUrl": url, "congress": congress, "states": 50, "districtFeatures": len(normalized), "overlapArtifactsRemoved": overlap_artifacts_removed, "simplifiedForWeb": True},
        "features": normalized,
    }
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / f"districts{congress:03d}.json"
    path.write_text(json.dumps(output, separators=(",", ":")))
    print(json.dumps({"congress": congress, "output": str(path), "district_features": len(normalized), "overlap_artifacts_removed": overlap_artifacts_removed, "bytes": path.stat().st_size, "source": url}))

for value in sys.argv[1:] or [str(congress) for congress in range(89, 120)]:
    convert_congress(int(value))

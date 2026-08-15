import io
import json
import sys
import urllib.request
import zipfile

import shapefile

congress = int(sys.argv[1]) if len(sys.argv) > 1 else 89
url = f"https://cdmaps.polisci.ucla.edu/shp/districts{congress:03d}.zip"
with urllib.request.urlopen(url, timeout=60) as response:
    archive = zipfile.ZipFile(io.BytesIO(response.read()))
    shp_name = next(name for name in archive.namelist() if name.lower().endswith(".shp"))
    dbf_name = next(name for name in archive.namelist() if name.lower().endswith(".dbf"))
    reader = shapefile.Reader(shp=io.BytesIO(archive.read(shp_name)), dbf=io.BytesIO(archive.read(dbf_name)))
    field_names = [field[0] for field in reader.fields[1:]]
    records = reader.records()
    first = dict(zip(field_names, records[0])) if records else {}
    print(json.dumps({
        "congress": congress,
        "url": url,
        "records": len(records),
        "fields": field_names,
        "first_record": first,
    }, default=str, indent=2))

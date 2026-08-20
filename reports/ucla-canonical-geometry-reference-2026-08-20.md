# UCLA Canonical Geometry Reference

The current UCLA-linked `JeffreyBLewis/congressional-district-boundaries` repository describes GeoJSON as its Version 2 canonical representation, with the same higher resolution as source shapefiles. It states that all district definitions use Census-standard unprojected NAD83 coordinates (PostGIS SRID 4269), that at-large districts use number `0`, and that starting with the 103rd Congress it relies on Census-produced district boundaries.[1]

The repository’s latest visible commit was dated August 6, 2026 and explicitly corrected overlapping at-large records for Montana, North Dakota, and South Dakota. Its accompanying note says an overly broad at-large Congress range had produced a spurious full-state shape overlapping actual district shapes when data were combined by Congress.[1]

This source history reinforces the renderer rebuild requirement: a public national frame must be formed by selecting the authoritative Congress-specific district features without geometric simplification, false holes, or overlapping historical at-large records. Source changes remain evidence for review, not automatic public mutation.

## Reference

[1]: https://github.com/JeffreyBLewis/congressional-district-boundaries "Jeffrey B. Lewis et al. — Congressional District Boundaries, Version 2"

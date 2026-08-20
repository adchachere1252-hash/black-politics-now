# Atlas Renderer Defect Investigation

**Trigger:** Owner screenshot dated August 20, 2026 showed unacceptable white triangular gaps and incomplete district surfaces in the public party map.

## Browser-observed defect

An independent public-browser surface scan of the 119th Congress party map detected **23 enclosed, unpainted components** within the overall national district surface at a five-unit SVG sampling interval. The largest measured approximately 40×105 SVG units. These are not ocean/background regions because the scan excludes components connected to the SVG boundary. The screenshot therefore reflects a real rendering failure rather than a display-scale illusion.

## Current diagnosis

The previous renderer attempted to serialize each UCLA feature with d3’s composite `geoAlbersUsa` projection and remove large projection clip surfaces from the resulting path string. A full-frame diagnostic found **402** such removed subpaths across Congresses 99–114. That string-level method is not an acceptable basis for source-faithful district rendering.

The initial direct-ring replacement did not eliminate the enclosed gaps, proving that the issue is not solely the clip-surface cleanup. The renderer needs a topology-aware approach that respects the source geometry’s exterior/interior rings and projects them without treating ordinary ring ordering as a simple fill instruction.

## Source comparison

The local 119th frame has 435 records. A direct comparison with UCLA’s canonical Version 2 repository at commit `bf68a9b` found that shared feature IDs had the same geometry type and ring count. The local snapshot does not yet include UCLA’s August 2026 corrected at-large IDs for North Dakota and South Dakota and excludes the related special federal record. That source-snapshot difference is separate from the white-gap renderer defect.

## Non-negotiable acceptance criteria

The replacement renderer must produce zero material enclosed, unpainted components in party, boundary, and member views; retain all 50 states and valid individual district interactions; preserve Alaska/Hawaii insets; and pass high-resolution desktop and mobile visual review before publication.

## Canonical topology replacement result

The decisive comparison found that the published 119th web frame had only **65,478** coordinates across shared district features, while the matching UCLA canonical Version 2 records had **620,805**. Every shared feature’s coordinates differed. The prior frame generation had independently simplified adjacent district borders, creating the visible cracks.

The replacement uses UCLA’s canonical high-resolution GeoJSON encoded as a shared-arc TopoJSON frame, with no independent district simplification. Its public-browser surface scan found **one only 5×20 SVG-unit enclosed component** at a five-unit sample interval, down from 23 components including areas up to 40×105 units. The material white triangular gaps visible in the owner screenshot are absent in the rebuilt 119th party frame.

The larger 113th Congress source frame also loaded successfully after a preview-worker restart, displaying a continuous member layer and dense, intact district lines in the high-resolution source geometry. The earlier blank screenshot was traced to Vite’s stopped transform worker after memory-heavy local generation—not a public Atlas rendering failure.

## Full-frame migration and final evidence

All 31 Atlas frames have been replaced with uploaded UCLA canonical shared-topology assets. A serial verification of the delivered compressed assets confirmed, for each Congress, 50 named states, unique district identifiers, valid shared arcs, explicit UCLA canonical metadata, and no independently simplified output. The 89th Congress correctly has 433 distinct district regions for 435 apportioned seats because at-large representation can cover more than one seat; the screen presents those as regions rather than falsely inventing extra boundaries.

The tested current 119th frame transferred in 65–230 ms locally from the managed static cache (1.41 MB compressed). The larger 113th and 114th high-detail frames transfer at 8.04 MB compressed and were visually loaded successfully. The release leaves the existing three-frame LRU cache in place, so playback and comparison do not retain all 31 full-resolution frames in browser memory.

Final technical gates passed: **50 test files / 157 tests**, strict TypeScript, production build, all 31 delivered topology assets, current party map surface scan, early boundary view, and high-detail member view. Full-page automated capture encountered a rendering-tool limitation with the large vector documents; ordinary viewport captures rendered the pages and maps successfully and no browser console failure occurred.

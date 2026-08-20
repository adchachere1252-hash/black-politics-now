# Live Historical Atlas Fracture Remediation

**Incident status:** Resolved with a production-visible safeguard.  
**Affected view:** Historical Atlas, 119th Congress, Party overlay, Alabama selected.  
**Owner report:** White triangular fractures appeared inside otherwise colored district surfaces.

## Exact production trace

The production route was loaded with a cache-busting query and traced through its actual rendered DOM. It served the current site bundle `index-mVIt92DG.js`, drew **435** interactive district paths in a `1000 × 620` SVG, and fetched exactly one district geometry frame:

`/manus-storage/ucla-canonical-c119.topo.json_971cd334.gz`

The geometry metadata is canonical shared-boundary topology. No retired `districts119_8abd75bd.json` request appeared in the fresh production trace. The centered desktop capture showed a continuous party surface with none of the screenshot’s white triangular breaks.

## Corrective safeguard

The frame loader now refuses to decode a frame that is marked `simplifiedForWeb` or does not explicitly declare `topologyPreservesSharedBoundaries: true`. Thus, a legacy independently simplified geometry file cannot silently re-enter the current public map path. The guard is covered by a regression test that supplies the legacy metadata contract and confirms it is rejected before rendering.

## Visible-surface release gate

The live trace now samples the on-screen SVG at 5-pixel intervals, finds enclosed unpainted components, and fails if it sees small internal components characteristic of the prior triangular cracks. It distinguishes those from the exterior and large natural-water surfaces. The production 119th party map passed this gate with **0** fracture candidates.

| Production acceptance gate | Result |
|---|---|
| Current public JavaScript bundle loaded | Passed |
| Canonical UCLA compressed TopoJSON frame requested | Passed |
| 435 district paths drawn | Passed |
| Interior fracture candidates | 0 |
| UCLA source tag visible | Passed |
| Canonical-frame runtime rejection test | Passed |
| Full regression suite | 50 files / 158 tests passed |
| Production build | Passed |

The original screenshot remains a valid defect report: it captured the retired simplified-map behavior. The active production route now uses canonical shared boundaries and has a runtime barrier and visible-surface test against recurrence.

# UCLA Geometry and Election Night Simulation Readiness

**Prepared:** August 18, 2026 (EDT)  
**Scope:** Visual alignment of the validated historical congressional district geometry and safe preparation for a primary-election rehearsal.

## Confirmed findings

The Historical Atlas uses a validated UCLA Congress-by-Congress `FeatureCollection` for each supported frame. Its loader validates the requested Congress number, a nonempty feature collection, and all 50 states before rendering. The geometry itself is therefore separate from the visual mismatch.

The mismatch is presentational. The current-election House map resolves its AP-style ratings through the shared `--color-solid-d`, `--color-likely-d`, `--color-lean-d`, `--color-tossup`, `--color-lean-r`, `--color-likely-r`, and `--color-solid-r` tokens. The Historical Atlas currently uses independent hard-coded blue, red, purple, and blue-gray fills. Its boundary mode is intentionally neutral, while its party and member modes contain verified historical context rather than current race ratings. The correct change is to retain those distinct historical meanings while applying the shared color language and legend treatment.

The desktop homepage has an intentional 8-pixel outer dashboard inset. Its bottom inset is the visible unused lower-page space identified in the current verification capture. The planned adjustment removes only the lower outer inset, retaining the desktop single-screen dashboard and the existing mobile layout.

## Simulation safety finding

The active DDHQ polling command is **not** a dry run: a normal single poll or continuous poll writes live race fields and may send owner notifications for new general-election calls. The existing protected Admin rehearsal records operational steps only and explicitly performs no live source, race, alert, or publishing action. Tonight’s simulation must use that protected rehearsal path plus read-only status, mapping, heartbeat, and log checks unless a separate write-isolated simulation adapter is completed and validated first.

## Current checklist state

| Workstream | Status |
| --- | --- |
| UCLA geometry integrity and color-mismatch diagnosis | Complete |
| Unused lower-page whitespace diagnosis | Complete |
| House-map palette alignment | Pending implementation |
| Protected primary-election rehearsal preparation | Pending validation |
| GitHub synchronization | Pending final commit and push |

## Visual implementation verification

The desktop dashboard now reaches the lower edge of its allotted viewport without the prior unused 8-pixel white inset. Its header, three-column structure, map, and mobile-only route separation were not changed.

The Historical Atlas keeps its UCLA geometry loader, 50-state integrity check, and historical overlay meanings intact. Its national district renderer now resolves boundary, party, member, selection, outline, and legend colors through the same shared design-token family as the homepage House map. The Atlas therefore reads as part of the same product while continuing to label party and member overlays as verified historical context rather than current race ratings.

The final visual pass confirms that the neutral UCLA-boundary mode keeps a current-election-style no-data fill while its district outlines remain clearly legible. Historical party mode uses the same Democratic blue, Republican red, and purple other/independent language as the House map; the member mode uses the established representation gold. No geometry coordinates, projection, Congress selection, or source validation code was changed.

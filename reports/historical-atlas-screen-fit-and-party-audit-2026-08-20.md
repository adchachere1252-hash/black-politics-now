# Historical Atlas Screen-Fit and Party-Color Audit

**Prepared:** August 20, 2026 (EDT)

## Current finding

The underlying 50-state UCLA map already supports a verified party overlay sourced from Voteview, with Democratic blue, Republican red, and purple other/independent color semantics inherited from the homepage election-map token family. However, the Atlas defaults to the neutral boundary layer, and the introductory material occupies most of the initial desktop viewport before the national map becomes visible. This makes the most important interactive evidence—the map—feel too distant and can hide party transitions until a user discovers the Party control.

## Planned refinement

The Atlas will default to the verified **Party transitions** overlay, retain the neutral boundary and member options, explain its red/blue/purple legend in the map stage, and elevate the map higher in the page. The desktop map stage will use a bounded screen-aware height so all 50 states remain legible without excessive blank space; mobile will retain an accessible, proportionate map canvas and stacked controls.

The historical party layer will not infer causes of party changes. It will show the verified House member party record for each displayed Congress, allowing users to compare periods and observe geographic party transitions directly.

## Implemented map stage

The Atlas now opens in the **Party** overlay unless a reader intentionally requests the neutral boundary or member overlay. Its primary map canvas has a screen-aware height between 300px and 620px, preserving the 1000×620 national-frame aspect ratio without clipping Alaska, Hawaii, or the mainland. Side-by-side comparison maps use a separate compact height range so both Congresses remain visible without a runaway page length.

The opening copy now makes the color semantics explicit: Democratic blue, Republican red, and other/independent purple. The party legend uses the same `--color-solid-d`, `--color-solid-r`, and `--color-tossup` tokens as the homepage election map. A comparison note explains that the map displays verified historical House records but does not infer why a district changed party.

Desktop review confirms that the map controls enter the initial viewport immediately after a compact Atlas introduction. Mobile review confirms the party-transition stage follows the stacked introduction without horizontal overflow; its 300px minimum canvas protects the 50-state map from being compressed into an unreadable strip.

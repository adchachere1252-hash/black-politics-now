# Historical Atlas Source Reference Notes

The UCLA Congressional District Maps project states that it provides digital boundary definitions for U.S. congressional districts used between 1789 and 2025. It distinguishes its historical construction methods from modern Census-derived boundary files: beginning with the 103rd Congress it relies on Census boundary files; the 98th through 102nd Congresses draw on 1990 Census TIGER/Line material except where documented; earlier boundaries combine historical county sources with district-specific legal and cartographic reconstruction.[1]

The current Black Politics Now Atlas intentionally limits public frames to the Voting Rights Act era, 89th through 119th Congresses. Its all-frame live source-contract audit on August 20 confirmed 31 UCLA-backed FeatureCollections, 50 named states per frame, unique UCLA feature identifiers and state/district keys, usable polygon or multipolygon geometry for every feature, matching metadata feature counts, and HTTP 200 Voteview overlay responses. The source contract preserves UCLA geometry, Census apportionment context, and Voteview roster overlays as distinct layers.

The audit also identified that d3’s composite Albers projection can produce large clip rectangles alongside legitimate district geometry. These are renderer artifacts, not UCLA boundaries. The map renderer now removes only large full-map or inset clip rectangles while preserving ordinary rectangular district rings.

## Reference

[1]: https://cdmaps.polisci.ucla.edu/ "U.S. Congressional District Shapefiles — UCLA Congressional District Maps"

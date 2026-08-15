# Historical Atlas Source Audit

**Audit scope:** 89th through 119th Congresses, covering the period beginning with the Voting Rights Act era through the current Atlas record.

## Boundary coverage result

The Atlas manifest contains **50 state histories**, **50 apportionment records**, and **416 referenced historical boundary files**. Each state has uninterrupted manifest coverage for every Congress from the 89th through the 119th. The UCLA repository inventory returned **913 GeoJSON files**, and every one of the 416 Atlas references was present. No coverage gaps, missing source files, or malformed source-range relationships were found.

Some repository file names begin before the audit window. The Atlas manifest correctly narrows those broad source-file ranges to the period it displays; for example, a source file that begins before the 89th Congress remains valid for the 89th Congress when its file range contains that Congress.

## Interpretation standard

The national map is an all-state historical geography view. Its lightweight rendering is derived from the same repository GeoJSON used by the state archive, while the original file remains linked in each state record. A boundary-era change indicates that the repository file era changes; it does **not** by itself establish a legal finding, party-control outcome, demographic claim, or current-map certification.

Party and member overlays use the documented Voteview House member fields and must retain an explicit source/unavailable state rather than infer a roster. Voting Rights Act timeline milestones must cite a primary or institutional source before appearing in the public Atlas.

## Voting Rights Act interpretation sources

The guided timeline is limited to five map-relevant legal milestones: the 1965 Act, the 1982 Section 2 amendment, the 1986 *Gingles* framework, *Shelby County* in 2013, and *Allen v. Milligan* in 2023. The timeline uses the Department of Justice history, the U.S. House Historian’s redistricting essay, and the official Supreme Court opinion. It deliberately does not claim that any milestone alone caused a specific state boundary-file transition.

## Audit artifacts

- Automated coverage test: `server/atlasSourceIntegrity.test.ts`
- Repository inventory verifier: `scripts/verify-atlas-source-integrity.ts`
- Boundary source: [UCLA Congressional District Shapefiles](https://cdmaps.polisci.ucla.edu/)
- House roster source: [Voteview data documentation](https://voteview.com/data)

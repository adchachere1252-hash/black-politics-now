# Admin Creation Workflows and White Atlas State Separators

**Prepared:** August 20, 2026 (EDT)  
**Status:** Released for protected Admin use after database, public-map, regression, and production-build verification.

## Direct Admin creation workflow

The platform now supports creation as well as editing. In **Admin → Candidate Changes**, the Senate, House, and Governor tabs each include an **Add race** control. The form requires a state, both candidates, parties, rating, source label, source URL, and a private creation note. House races also require a district. Submitting the form creates the public contest in a scheduled state and writes the initial immutable candidate-log audit record. The form deliberately cannot set vote totals, reporting percentages, a call, or a certified result.

For the Black Representation map, **Admin → Black Representation Editor** now includes both **Add Black Rep profile** and **Add Black Rep race**. A new profile requires a name, state, jurisdiction, party, office, representation status, role, and source package. A new contest requires its jurisdiction, election type, non-inferential map status, source package, and optional named candidate context. Both creation paths write a snapshot and source package to the immutable `black_representation_addition_audit` ledger. The ledger was verified as deployed with its lookup index and no fabricated test record was inserted.

| Admin task | Public effect | Required protection |
|---|---|---|
| Create Senate, House, or Governor race | Adds a scheduled contest and its candidate display record | Both candidates, source URL, source label, private note, immutable initial candidate audit |
| Create Black Representation profile | Adds a map-ready person record after protected save | Identity, jurisdiction, status, source package, immutable profile-addition audit |
| Create Black Representation race | Adds a map-ready contest after protected save | Jurisdiction, election/status context, source package, immutable contest-addition audit |

## White state separators

The Historical Atlas now uses source-derived **white state separators** over party and member color fields. They are derived from the same canonical UCLA shared topology as the districts, so they are aligned rather than an approximated overlay. The white line gives readers a clear state boundary without drawing every selected district in heavy black. Boundary mode retains a graphite separator because its pale neutral fill would make a white line unreadable.

Desktop inspection confirmed the intended hierarchy: white state separators are visibly stronger than fine internal district lines in party and member views, party colors remain legible, and the 89th Congress boundary view remains readable with the mode-aware graphite separator. All 31 canonical frames retain the same source-derived exterior contract.

## Validation

The Black Representation addition-audit migration created the table and source-lookup index successfully; it contains zero placeholder records. Targeted creation, candidate-log, and Atlas loader tests passed, as did the complete suite of **53 test files / 166 tests**, TypeScript, and production build. The build reports existing non-blocking chunk-size warnings only.

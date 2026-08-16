# Black Representation General-Election Audit — Working Record

**Audit date:** August 16, 2026  
**Scope:** 29 states or jurisdictions with 2026 Black Representation primary, runoff, or special-election tracking records.

## Homepage Autonomy Findings

The background automation host is active. Its current schedule refreshes news every four hours and runs the election guard every five minutes; on active election dates the guard starts DDHQ polling for mapped races every 60 seconds. The election engine currently maps 65 races: 4 Senate, 9 Governor, and 52 House.

The public homepage previously refreshed World Elections every 60 seconds but left its news, podcast, election, and Black Representation queries at page-load freshness. The current implementation now refreshes election and Black Representation data every 60 seconds and editorial content every five minutes while the homepage remains open. These views only render the approved database record set; the browser refresh does not itself write data.

## State Verification Source Register

| State | Verification status | Source |
|---|---|---|
| Alabama | Verified | https://www.sos.alabama.gov/alabama-votes/voter/election-information/2026 |
| Arkansas | Verified | https://ballotpedia.org/Arkansas_election_results,_2026 |
| California | Verified | https://www.sos.ca.gov/elections/prior-elections/statewide-election-results/primary-election-june-2-2026 |
| Colorado | Verified | https://results.enr.clarityelections.com/CO/126592/ |
| District of Columbia | Verified | https://electionresults.dcboe.org/election_results/2026-Primary-Election |
| Georgia | Verified; GA-13 special runoff remains open | https://sos.ga.gov/page/georgia-election-results |
| Illinois | Verified | https://www.elections.il.gov/ |
| Indiana | Verified | https://enr.indianavoters.in.gov/site/index.html |
| Kentucky | Verified | https://vrsws.sos.ky.gov/liveresults/ |
| Louisiana | Verified; November open-primary process remains relevant to House races | https://www.sos.la.gov/ |
| Maryland | Verified | https://elections.maryland.gov/elections/2026/primary_results/index.html |
| Michigan | Verified | https://www.michigan.gov/sos/elections |
| Missouri | Verified | https://enr.sos.mo.gov/ |
| Mississippi | Verified | https://www.sos.ms.gov |
| North Carolina | Verified | https://www.ncsbe.gov/results-data/election-results |
| New Jersey | Verified | https://www.nj.gov/state/elections/election-information-2026.shtml |
| Nevada | Verified | https://www.nvsos.gov/SOSelectionPages/results/2026StateWidePrimary/ElectionSummary.aspx |
| New York | Verified; source lead was non-official and requires state-source confirmation before a public record change | https://ballotpedia.org/United_States_House_of_Representatives_elections_in_New_York,_2026 |
| Ohio | Verified | https://www.ohiosos.gov |
| Oklahoma | Verified; August 25 runoff remains open | https://oklahoma.gov/elections.html |
| Oregon | Verified | https://sos.oregon.gov/elections/pages/historical-data.aspx |
| Pennsylvania | Verified | https://www.electionreturns.pa.gov/ |
| South Carolina | Verified | https://scvotes.gov/elections-statistics/election-results/ |
| South Dakota | Verified; Julian Beaudion withdrawal remains an open maintenance item | https://sdsos.gov/elections-voting/default.aspx |
| Tennessee | Verified | https://www.elections.tn.gov/ |
| Texas | Verified | https://electionresults.sos.state.tx.us/results.html |
| Utah | Verified | https://vote.utah.gov/ |
| Virginia | Verified | https://www.elections.virginia.gov/resultsreports/election-results/ |
| Washington | Verified | https://www.sos.wa.gov/ |

## Completed Data Alignment

The profile table contained 17 source-backed candidates whose profile still said `running` or equivalent while their profile already recorded `race_stage = general` and `primary_result` containing `Won primary`. These profiles were safely aligned to `advanced_to_general` on August 16, 2026. The update covered Jonathan Jackson, Lauren Underwood, Wesley Bell, Bennie Thompson, Alma Adams, Gregory Meeks, Hakeem Jeffries, Yvette Clarke, Richie Torres, Joyce Beatty, Shontel Brown, Summer Lee, James Clyburn, Justin Pearson, Robert C. Scott, Jennifer McClellan, and one additional source-backed profile in the same exact status condition.

## Open Reconciliation Items

| Item | Current platform state | Audit finding | Required treatment |
|---|---|---|---|
| GA-13 | Primary too-close-to-call record | Special general runoff remains an open process | Retain unresolved status until official runoff result is certified. |
| NC-4 | Primary too-close-to-call | Official North Carolina outcome should be reconciled before changing the platform record | Manual source check and editor review. |
| Oklahoma Senate and state races | Primary too-close-to-call | August 25 runoffs remain pending | Do not mark general-election advancement until runoff results are official. |
| Virginia VA-3 primary record | Tracker was still `upcoming` though Robert C. Scott profile was aligned to general advancement | Official Virginia Department of Elections result context is available | Update the race-level result only after the selected official result page or certified candidate record is attached. |
| South Dakota Senate | Candidate withdrawal reported in state verification | Existing election-tracker treatment requires a source-linked review | Do not change automatically; stage editorial review. |

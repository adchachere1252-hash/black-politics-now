# Historical Atlas Coverage Audit — August 13, 2026

## Current website coverage

The standalone Historical Atlas currently exposes the **16-state redistricting inventory** used by the original election-map project. For every tracked state, the live record can provide current redistricting status, enactment status, method, delegation-before snapshot, projected impact, and litigation or contextual notes. The page also renders a decennial House-apportionment chart, a current delegation-seat index, and state-level redistricting narrative.

## Original repository coverage

The original `election-map-2026` repository contains a richer state-history implementation in `client/src/components/StateDetailPanel.tsx`. It includes a 50-state `KNOWN_SEATS` historical apportionment series spanning the 89th–119th Congresses, a Lewis boundary manifest that identifies historical district-boundary eras, party-control calculations by Congress, apportionment-change events, and current-representative listings. The site currently uses the active 16-state redistricting ledger and a simplified seven-decade seat series, rather than the original full historical state-detail experience.

## Verified improvement path

The safest launch enhancement is to import the original repository’s **50-state apportionment series and boundary-era metadata** into the standalone Atlas, then distinguish those long-run historical records from the 16-state live-redistricting watchlist. A later enhancement can layer party-control and historical representative timelines after their repository caches are reviewed and verified for current source provenance. This preserves factual separation between long-run historical context and current litigation or map-status reporting.

## Dashboard map verification

The homepage dashboard now keeps the full U.S. geography—including Washington—in a dedicated map frame below the control panel. It exposes controls in the agreed **Governor → House → Senate** order and switches the bottom intelligence panel with the selected chamber. In the House view, for example, it reported 435 districts, 19 toss-ups, 19 lean races, and six called contests from the live House dataset.

## State-history verification

The standalone Atlas was exercised with Alaska, a state outside the active 2026 watchlist. It displayed the correctly labeled **Historical apportionment** treatment, a one-seat series across every displayed decade, and an explicit statement that it is not an active 2026 map-change record. This confirms the interface does not conflate the original repository’s historical dataset with the live redistricting watchlist.

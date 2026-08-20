# Alaska Homepage Map Freshness and Automation Audit

**Audit date:** August 20, 2026 (EDT)  
**Decision:** The homepage general-election map was refreshed from its approved data contract, but it was not autonomously ingesting Alaska’s primary results because the backend election engine is intentionally in standby outside a configured active general-election polling window. The release adds a source-backed Alaska primary context without presenting it as a general-election result.

## What the homepage map does automatically

| Mechanism | Current behavior | Result |
|---|---|---|
| Homepage data refresh | Re-reads approved election and Black Representation records every 60 seconds while a visitor keeps the page open. | Working |
| General-election results engine | Polls mapped sources only during a configured active general-election date/window. | Standby; no active window on August 20 |
| Alaska primary ingestion | No active primary-specific monitor was scheduled for the August 18 top-four contest. | Not autonomous at the time of the audit |
| Admin monitoring | Shows the general-election engine mode and the reviewed primary-context card separately. | Added and clarified |

The important distinction is that visitor-side refresh is a **read refresh**, not a data-collection process. It ensures a homepage visitor sees newly approved records within one minute; it cannot discover or write a primary outcome on its own. The cloud election guard’s log confirms it remained idle because no active election date was configured. Its general-election design also deliberately avoids turning a primary call into a general-election call.

## Alaska update applied

The homepage now shows a compact **“Primary context · Alaska reviewed 2026-08-20”** action beneath the map search control. Opening it displays the source-labeled August 18 preliminary context: Mary Peltola led the Senate field with 48.09%, followed by Dan Sullivan at 42.72%; Nick Begich led the House field with 46.12%, followed by Bill Hill at 30.89%. In the Governor/Lieutenant Governor top-four field, Kreiss-Tomkins/Begich and Begich/Schuerch led, followed by Wilson/Shower and Bronson/Church.[1]

The context explicitly states that Alaska’s count remains unofficial and that it **does not** change a general-election rating, map call, ticker eligibility, or certified-results archive. This is necessary because Alaska’s top-four system advances candidates to a later stage; absentee ballots and certification were still pending in the source package.[2] [3]

Admin → Election Ops now displays the same reviewed primary-context card, direct official source link, exact general-election boundary, and an explanation that primary context is a separate review workflow. Admin → Overview’s Homepage Refresh Health card now distinguishes approved-record refresh from the general-election engine and primary-review requirement.

## Recommended autonomous next step

The appropriate durable model is a daily **primary source monitor** during each state’s primary window. It should collect official preliminary and certification evidence, write a private Admin review item with source links and the current public-record comparison, and require an editor to approve the public context. It must not directly alter general-election ratings, outcomes, or calls. A later general-election engine can continue to operate on its own active polling windows.

This split maintains automation for discovery and freshness while retaining source and editorial controls appropriate to preliminary election results.

## Validation

Homepage visual review confirmed the Alaska primary badge appears without changing the general-election legend or map colors. Admin and homepage compile successfully. The full suite passed **54 files / 167 tests**; strict TypeScript and production build passed. Build output contains only existing non-blocking chunk-size warnings.

## References

[1]: https://www.elections.alaska.gov/enr26/results/ElectionSummaryReportRPT.pdf "State of Alaska Division of Elections — 2026 Primary Election Summary Report, unofficial results"

[2]: https://alaskapublic.org/news/politics/elections/2026-08-18/kreiss-tomkins-begich-wilson-and-bronson-lead-in-early-governor-primary-results "Alaska Public Media — Governor primary preliminary context"

[3]: https://alaskabeacon.com/2026/08/18/in-alaskas-u-s-senate-race-its-sullivan-and-peltola-in-front-and-house-also-shows-no-surprises/ "Alaska Beacon — Senate and House primary preliminary context"

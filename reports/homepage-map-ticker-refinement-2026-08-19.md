# Homepage Map Scale and Ticker Flow Refinement

**Prepared:** August 19, 2026 (EDT)

The desktop homepage continues to use the established three-column dashboard. The center election map is now intentionally smaller within its dedicated canvas: it retains all state geometry, color ratings, the legend, state search, and click-through detail behavior while giving the title panel and outcome summary room to breathe.

The results ticker no longer exposes a pause or resume button. Its visible outcome list is duplicated into two equal sequences, allowing the CSS track to translate exactly one sequence width before repeating. This prevents a jump at the loop boundary and provides a continuous, slower, organic flow on desktop and mobile. Users who request reduced motion receive a manually scrollable viewport instead of animation. Eligibility remains limited to final-election outcomes, excluding primary and primary-runoff records.

Desktop and 375-pixel mobile checks confirmed the smaller map is fully framed on the website and the button-free ticker remains unclipped above the mobile content stack.

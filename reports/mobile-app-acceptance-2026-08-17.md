# Mobile App Acceptance Check

**Scope:** 375 × 812 mobile viewport, current public routes, protected Admin boundary, runtime logs, and targeted authorization tests.

## Election Banner

The homepage and Election Center use the shared `ResultsTicker` component. When a final Senate or House general-election outcome exists, the outcome rail moves continuously from right to left with the `ticker-scroll` animation. It does not include primary outcomes or governor races. The animation is now keyboard pauseable and pauses on hover. For people who request reduced motion, it becomes a horizontal, manually scrollable rail rather than animating.

## Route Results

| Area | Mobile result | Notes |
|---|---|---|
| Homepage | Passed | Results banner is visible; stacked Latest News and map controls remain usable. |
| Election Center | Passed | Search, chamber filters, rating legend, fresh-state context, and map remain within viewport. |
| World Elections | Passed | Globe, country labels, density selector, country index, Results, and Referendums views fit the stacked presentation. |
| Historical Atlas | Passed | VRA framing, 50-state metrics, 31 Congress frames, and source context fit mobile. |
| Daily Intelligence Brief | Passed | Andrew/Jenny controls, downloads, RSS, embed entry, search, and archive entry remain visible. |
| Archive | Passed | News, podcast, and election discovery controls remain usable. |
| Research Desk | Passed | Suggested questions and source-grounded prompt entry render cleanly. |
| Admin | Passed | Authenticated mobile view loads its workspace rail and operational summary without a rendering failure. |

## Guard Checks

No browser-console exceptions or failed network responses appeared in the captured route window. The protected Admin control matrix and acceptance suite passed. The full project type check, production build, and **102 regression tests across 31 test files** passed.

## Known Boundary

The Admin workspace rail is horizontally scrollable on a phone because it contains numerous operational areas. This is intentional, but it remains a usability tradeoff for a dashboard of this breadth rather than a defect in the public mobile layout.

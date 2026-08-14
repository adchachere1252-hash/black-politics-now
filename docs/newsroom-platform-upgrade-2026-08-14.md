# Original Newsroom Platform Upgrade

## Visual reference distilled from the supplied original-site screens

The original Black Politics Now newsroom establishes a usable editorial language: a white or black news field, bold condensed headlines, a horizontal category rail, a dominant lead report, dense image-led story grids, and a clear footer. The upgrade should retain this recognizability while introducing the platform’s gold intelligence accent only as a signal for active states, actions, and evidence—not as a replacement for editorial hierarchy.

## Initial implementation direction

The refined `/newsroom` route uses a category-led editorial masthead, a lead-story/trending split, authentic WordPress-linked reports, and direct entries to Elections, World Elections, the Historical Atlas, and the Daily Brief. The top-level News navigation now points to this integrated newsroom, while a visible control preserves a direct route to the original WordPress publication.

## Live validation observation

During the initial browser check, the WordPress request was visible in the local network log, but the route remained in its loading shell after the first render. This is being treated as a release-blocking data-state issue; the newsroom will not be presented as complete until its article feed is confirmed in the browser.

The immediate cause was a temporary upstream TLS failure after a development-server restart. The public `news.list` endpoint now uses the existing `wp_posts_latest` snapshot only when the unfiltered live WordPress request fails. It was verified to return 20 stored Black Politics Now posts, including the lead Louisiana reporting item. Category-filtered requests remain live-source only so a stale snapshot cannot be mislabeled as a current category result.

The article query is now memoized so the route does not restart its request continuously. Authentic featured media first uses the original WordPress URL, then retries through the WordPress Jetpack CDN only if the direct media host fails; this retains the original source and restores distinct imagery across the newsroom grid.

## Platform-wide upgrade recommendation

The strongest direction is to keep the original Black Politics Now newsroom identity as the **public front door** and make the intelligence products feel like its evidence desk—not like separate software products. The supplied screens demonstrate why: the decisive category rail, headline-led hierarchy, image-forward report grid, and monochrome confidence already communicate an editorial institution. The platform should preserve that identity and use gold only as a controlled signal for active, verified, or actionable intelligence.

| Priority | Upgrade | Why it matters | Recommended approach |
|---|---|---|---|
| 1 | **Newsroom as the reporting front door** | Readers arrive for reporting, not a dashboard. | The new `/newsroom` route carries the original category-led newsroom language, real WordPress stories, and direct entry points into Election Center, World Elections, Historical Atlas, and the Daily Brief. Keep the original WordPress publication visibly linked. |
| 1 | **One source-of-truth news delivery path** | A stalled upstream feed should not create a blank editorial product. | Maintain the existing four-hour WordPress refresh; the public landing stream now reads that WordPress-only snapshot first and retries authentic media through the WordPress CDN if needed. Keep filtered categories live-source only, so stale material is never mislabeled. |
| 1 | **Trust architecture** | Political intelligence requires readers to distinguish reporting, data, and reviewed analysis. | Add a consistent “Last verified,” source-link, and review-status pattern to election products. Keep the current no-autopublish rule for Research Desk, World Elections, and portraits. Add a public corrections and methodology page before launch. |
| 2 | **Story-to-record linking** | The platform’s differentiated value is context, not another article grid. | Add editorially curated links from selected WordPress stories to the relevant race, country, Atlas state, or Daily Brief segment. Do not auto-link based only on keywords; require an editor’s confirmation. |
| 2 | **Election night control plane** | The site needs an understandable difference between normal reporting and live results. | Use a dedicated live-results treatment only on active election dates, with a prominent source, refresh timestamp, and “called” explanation. Keep the current DDHQ operating guard and admin controls. |
| 2 | **World Elections coverage discipline** | A curated calendar can be excellent, but it should not imply exhaustive global coverage. | Describe World Elections as a source-audited curated calendar. Use the new daily review-only refresh and Election Guide benchmark recommendations to expand coverage only after official or high-quality corroboration. |
| 3 | **Audience layer** | Regular readers need return paths, but the user deferred subscriber features. | Preserve the visual slot for a newsletter or alert CTA without activating collection or notifications until the deferred subscriber program is approved. In the interim, emphasize the Daily Brief and open original-newsroom reporting. |
| 3 | **Editorial performance budget** | Heavy visual tools should not delay reporting. | Continue lazy-loading the World globe and Atlas boundary view. Treat the WordPress snapshot, responsive image variants, and page-level code splitting as release criteria; monitor lead-content render and data freshness. |

### Recommended platform language

> **Black Politics Now reports the story. The platform makes the public record easier to follow.**

This statement gives every area a clear job: the newsroom reports; Election Center tracks U.S. races; World Elections curates and verifies a global calendar; Historical Atlas explains the record; Daily Brief provides a verified listening format; and the Research Desk produces reviewable work for editors, never autonomous public claims.

## Next editorial decisions

The remaining decisions are editorial rather than technical: identify the first ten story-to-record links, approve the public methodology and corrections policy, decide which Election Guide coverage candidates to corroborate first, and choose the timing of subscriber sign-up and notifications. These decisions should be made before further public automation is added.

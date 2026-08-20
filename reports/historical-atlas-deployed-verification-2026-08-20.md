# Historical Atlas Deployed Verification — August 20, 2026

## Initial deployed evidence

The production Atlas route for the 119th Congress initially displayed its loading state, then completed a public browser render with 435 accessible source-linked district paths, all published controls, the 50/50-state status badge, source links, playback controls, timeline, state archive, and Alabama’s public record. This confirms that the deployed gzip TopoJSON decoder reached a functioning map state rather than remaining in a stale loading screen.

The next checks will measure material internal gaps from the deployed rendered SVG, then repeat the same scrutiny for early and middle frames and the other overlay modes.

## Deployed 119th party-surface measurement

The deployed 119th party map had 435 district paths. A four-unit SVG surface scan found one component at least ten sample cells in size. The component center maps through the same fitted Albers USA projection to **43.8562° N, 86.6126° W**, in Lake Michigan off Wisconsin. It is a genuine water surface outside the congressional-district geometry, not an unpainted district, a clipped polygon, or a reappearance of the owner-reported white triangular cracks. The remaining sampled components were four units or smaller.

## Deployed 89th boundary-surface measurement

The deployed 89th Congress boundary frame completed with 433 distinct historical regions across all 50 states. Its same-resolution surface scan produced the identical only material component at the Lake Michigan location and no additional material interior component. This cross-era result is important: the earlier white triangles were not a persistent hole in UCLA’s historical source topology; the remaining larger blank surface is natural water and is stable across the two widely separated source eras.

## Middle-era member view

The deployed 113th Congress member view completed a visual render with 435 district paths and intact high-detail linework. The browser’s independent console context reset before its second gap calculation; this is recorded as an automation-session limitation, not converted into a visual pass. The remaining playback, comparison, and direct-selection checks therefore use the established isolated browser-audit scripts against the deployed route rather than relying on that interrupted session.

## Deployed middle-era comparison activation

The deployed 104th Congress party view completed with 435 accessible district paths, 50/50-state status, and the corresponding Voteview overlay. A real public activation of **Compare two Congresses** updated the deployed URL to include `compare=1&compareCongress=89`, confirming the comparison control and shareable comparison state transition rather than relying on a synthetic DOM event. The prior automated comparison-panel wait failure is retained as a CDP synthetic-event limitation; it did not prevent the real interface from entering comparison mode.

A subsequent direct navigation to that deployed comparison URL again reset the sandbox browser session to `about:blank` before a visual panel capture could arrive. This is the second browser-session instability observed during high-detail comparison capture. The verified URL state and live initial comparison activation remain evidence of the public routing contract; panel rendering must be checked through the project preview once the capture environment is stable, and the limitation is not treated as a visual pass.

## All-frame delivery, interaction, and release gates

The fresh deployed topology audit fetched and decompressed every public asset. It confirmed **31 of 31** valid canonical shared-topology frames, 50 states in every frame, valid shared arcs in every frame, and 433–435 distinct regions according to the historical apportionment context. The aggregate compressed delivery total is 143.47 MB across all 31 on-demand assets; the application retains only three decoded frames in its LRU cache.

A real deployed pointer audit opened Alabama’s 1st-district detail from a genuine browser pointer sequence. It observed `pointerdown`, `pointerup`, and `click` delivery; the source-linked district landmark was present, focused, and contained the UCLA geometry and verified roster context. The direct deployed playback audit also completed standard advance, a stable Pause at the 90th Congress, fast progression from the 118th to the 119th, automatic stop, and restart at the 89th. The observed fast end-to-end interval was 5.274 seconds, which includes the selected 2.75-second pace plus next-frame high-fidelity transfer and decode; it is below the documented 7-second validated-frame budget. A repeat CDP playback run stalled after browser-session instability, so the initial successful sequence is retained as evidence and the retry limitation is disclosed.

Desktop viewport review showed complete early boundary and current party national maps without the prior triangular cracks. Mobile review rendered the responsive Atlas introduction, source links, and stacked information cards without overflow; the map remains below the mobile introductory context as designed. The fresh source gate passed **50 test files / 157 tests**, and the production build completed successfully. The build retains non-blocking JavaScript chunk-size warnings unrelated to Atlas geometry.

## Verification decision

The reported district-surface mistake is fixed in deployed production: the prior white triangular cracks have been replaced with exact shared UCLA canonical boundaries. The verified remaining internal surface is Lake Michigan, which is intentionally not a congressional district. The outstanding limitation is not a source or rendering defect: the sandbox browser’s high-detail comparison capture may reset before a screenshot is returned. It should not be mistaken for an Atlas map failure, but a signed-in owner’s ordinary comparison click is still the appropriate last human acceptance step for that particular view.

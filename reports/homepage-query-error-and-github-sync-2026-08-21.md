# Homepage Query Error Repair and GitHub Synchronization

**Release date:** August 21, 2026  
**Decision:** The committed project history was synchronized to GitHub, and the reported homepage API query error was addressed with a preview-safe same-origin tRPC endpoint.

## Diagnosis and repair

The reported stack trace originated from the tRPC HTTP batch client while it was passing a constructed request URL to `fetch`. The original client used a relative `/api/trpc` link. That normally works in a browser, but an embedded preview can have a context in which relative-base parsing produces the reported browser pattern error.

The client now resolves `/api/trpc` to an explicit same-origin absolute URL at runtime, such as `https://3000-preview.manus.computer/api/trpc`. This preserves the published domain path while avoiding any dependence on the embedded page’s relative base. A focused regression test verifies the preview URL construction and a non-browser fallback.

The exact historical error line had rotated out of the retained development logs, so its original failing request could not be replayed byte-for-byte. The exact reported preview URL was then loaded twice after the fix; the homepage completed its news, election, ticker, and podcast queries without an API error.

## GitHub synchronization

Before repair work, the local `main` branch was 46 commits ahead of `github/main`. The confirmed push advanced `adchachere1252-hash/black-politics-now` from `415747a` to `f2746e8`, with local and remote heads matching at that point. The final repair checkpoint is pushed after this release record is committed.

## Validation

TypeScript, the focused absolute-endpoint regression, the full regression suite, and production build passed. The homepage loaded successfully at the WebDev preview `/?from_webdev=1` path after the repair.

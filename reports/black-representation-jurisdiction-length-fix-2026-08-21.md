# Black Representation District and Jurisdiction Length Fix

**Resolved:** August 21, 2026 (EDT)  
**User-reported message:** `district` was limited to 16 characters, producing `too_big` validation errors in both **Add Black Rep profile** and **Add Black Rep race**.

## Meaning of the original message

The error came from the protected request validator, before any record was saved. It meant the value entered into **District / jurisdiction** exceeded the prior 16-character limit. The same short limit existed in the public profile table, contest table, removal audit, and addition audit, so simply relaxing the front-end form would not have been a safe or complete fix.

## Correction applied

The jurisdiction limit is now **128 characters** throughout the protected workflow.

| Layer | Previous limit | Corrected limit |
|---|---:|---:|
| Admin Add Black Rep profile form | No helpful limit guidance | 128 characters, with visible guidance and a long-jurisdiction example |
| Admin Add Black Rep race form | No helpful limit guidance | API accepts 128 characters |
| Protected profile API | 16 characters | 128 characters |
| Protected contest API | 16 characters | 128 characters |
| Public profile and contest storage | 16 characters | 128 characters |
| Addition and removal audit storage | 16 characters | 128 characters |

The long label **“U.S. Virgin Islands at-large”** now reaches source validation in both profile and contest inputs rather than failing with `too_big`. The regression deliberately supplies an invalid `ftp://` source after that long jurisdiction; the resulting HTTP/HTTPS source error proves the jurisdiction passed the API length check without inserting a test record.

## Verification

Database inspection confirmed all four relevant district columns are `varchar(128)`. Focused profile/contest validation tests passed, the full suite passed **55 test files / 174 tests**, TypeScript passed, and production build passed. The application still safely rejects empty values, values longer than 128 characters, invalid state codes, and non-HTTP/HTTPS evidence links.

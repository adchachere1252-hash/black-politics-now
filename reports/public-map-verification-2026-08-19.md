# Public Map Verification — August 19, 2026

## Verified current state

The two public map surfaces serve different purposes and are current within those purposes.

| Surface | Verification result | Interpretation |
| --- | --- | --- |
| Homepage U.S. Election Map | The desktop map renders its Senate outlook, all rating colors, state search, and no called general-election results. The most recent Senate record update is August 16 at 15:13:09. | This is a **general-election outlook**, not a primary-results display. Its general-election ratings did not change as a result of the August 18 primaries. |
| Election Watch strip | The homepage shows the polling monitor in standby for the next active election date, zero calls this cycle, and an operational heartbeat time. | The visible `Updated` time describes the election-monitor heartbeat, not the last editorial rating change. |
| Homepage World Elections card | The card shows `Next: Bangladesh · Aug 20`. The live World Elections ledger was updated at 11:58:25 on August 19 and contains 48 tracked records, 23 with Completed status. | The Cook Islands is no longer treated as the next voting-day record; its completed preliminary-results context correctly yields Bangladesh as the next election. |

## Primary-results separation

August 18 primary winners are intentionally not shown as general-election calls or certified results on the public U.S. map. The platform retains that separation so a nomination, a preliminary special-election count, a DDHQ general-election call, and a certified result cannot be confused. A future dedicated primary-results layer could display party nominee changes with a clear **Primary result** badge, without changing the general-election color or call status.

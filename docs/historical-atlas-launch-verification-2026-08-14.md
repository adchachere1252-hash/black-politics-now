# Historical Atlas Launch Verification

**Verification date:** August 14, 2026  
**Scope:** 50-state apportionment archive, boundary-era inventory, 2026 redistricting context, state interaction, and responsive presentation.

## Official apportionment evidence

The U.S. Census Bureau describes apportionment as the division of the 435 House memberships among the 50 states using decennial census population figures. Its historical table publishes state results from 1910 through 2020, and its 2020 results page confirms that the 2020 census determined each state’s representation for the decade beginning with the 118th Congress.[1] [2]

The platform’s imported Atlas series covers the seven post-1960 apportionment cycles displayed as 1963, 1973, 1983, 1993, 2003, 2013, and 2023. The structural audit verified 50 state histories, 50 boundary archives, seven values per state, and a 435-seat national total in every displayed cycle.

## Active redistricting watchlist corrections

The active 2026 watchlist initially had full current-map context for fourteen of its sixteen rows. This audit identified incomplete Mississippi and Tennessee metadata and corrected both records using current source reporting. Tennessee’s Secretary of State confirms that the General Assembly adopted revised congressional districts in the May 2026 extraordinary session; independent local reporting documents that the revised map remains the subject of litigation concerning the treatment of Black political communities.[3] [4]

Mississippi’s scheduled special session was cancelled and concerned judicial, rather than congressional, districts. The state has not adopted a new congressional map for the 2026 election; reporting notes that any later congressional action would be operationally complicated because primaries have already occurred.[5] The Atlas now labels this as monitoring rather than an active enacted congressional-map change.

## Interface and responsive verification

The Atlas was visually verified at 1280×900 and 390×844. The desktop presentation shows a persistent 50-state selector beside a full state detail panel. The mobile presentation retains the same information hierarchy in one column without clipped metric cards, seat history, redistricting notes, or boundary-era content.

State selection was verified for both a live 2026 watchlist record and a history-only record. Direct links now support a two-letter state parameter—for example, `/atlas?state=TN` for Tennessee and `/atlas?state=AK` for Alaska. Tennessee displays its adopted-map status, prior delegation, present-tense impact, source-backed legal context, seven apportionment values, and ten repository boundary eras. Alaska distinctly displays historical apportionment and its three archive eras without implying an active 2026 map change.

## Verification result

The deterministic audit passed with **50 state histories**, **50 boundary archives**, and **435 seats in each of the seven displayed decennial cycles**. All sixteen watchlist rows now contain a reason, method, prior delegation, and projected impact; ten additionally contain litigation notes where they are tracked. The page’s purpose statement, data distinction, state interactions, active-map context, and desktop/mobile presentation are ready for launch review.

## References

[1]: https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html "U.S. Census Bureau: Historical Apportionment Data (1910–2020)"
[2]: https://www.census.gov/data/tables/2020/dec/2020-apportionment-data.html "U.S. Census Bureau: 2020 Census Apportionment Results"
[3]: https://sos.tn.gov/announcements/2026-congressional-redistricting "Tennessee Secretary of State: 2026 Congressional Redistricting"
[4]: https://wpln.org/special-session-2026/ "WPLN News: Special Session: Congressional Redistricting"
[5]: https://mississippitoday.org/2026/05/13/judicial-redistricting-mississippi-session/ "Mississippi Today: Gov. Reeves calls off Mississippi’s special session on judicial redistricting"

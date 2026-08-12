import { Link } from "wouter";
import { useMemo } from "react";
import { ArrowUpRight, Globe2, Landmark, Mic2, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { USMapFull } from "@/components/USMapFull";
import MiniRepositoryGlobe from "@/components/MiniRepositoryGlobe";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";

const LEGEND = [
  ["Solid D", "bg-[#215da8]"], ["Likely D", "bg-[#3679cf]"], ["Lean D", "bg-[#77a6e8]"], ["Toss-up", "bg-[#7b3ff2]"],
  ["Lean R", "bg-[#de765d]"], ["Likely R", "bg-[#c84343]"], ["Solid R", "bg-[#961d21]"],
] as const;

function shortDate(value?: string) {
  if (!value) return "Date pending";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HomepageExample({ mode = "preview" }: { mode?: "preview" | "home" }) {
  const { data: news } = trpc.news.list.useQuery({ page: 1, perPage: 4 });
  const { data: senateRaces } = trpc.election.senate.useQuery();
  const { data: episodes } = trpc.podcast.getEpisodes.useQuery();
  const { data: worldElections = [] } = trpc.world.elections.useQuery();
  const { data: atlasStates = [] } = trpc.election.redistricting.useQuery();
  const { play } = useAudio();
  const { theme } = useTheme();
  const latestEpisode: any = episodes?.[0];
  const posts: any[] = ((news as any)?.posts ?? []).slice(0, 4);
  const segments: any[] = (latestEpisode?.segments ?? []).slice(0, 5);
  const latestEpisodeHasAudio = Boolean(latestEpisode?.fullEpisodeCdnUrl);
  const mapData = useMemo(() => {
    const entries: Record<string, { rating: string | null; candidate1: string; candidate2: string }> = {};
    (senateRaces as any[] ?? []).forEach((race) => {
      if (race.stateCode) entries[race.stateCode] = { rating: race.rating, candidate1: race.demCandidate ?? "Democratic candidate", candidate2: race.repCandidate ?? "Republican candidate" };
    });
    return entries;
  }, [senateRaces]);
  const worldBrief = useMemo(() => {
    const records = worldElections as any[];
    const upcoming = records.filter((item) => item.status === "Upcoming" || item.status === "Voting Today")
      .sort((a, b) => `${a.electionDate}`.localeCompare(`${b.electionDate}`)).slice(0, 2);
    const recent = records.filter((item) => item.status === "Completed" && item.winner)
      .sort((a, b) => `${b.electionDate}`.localeCompare(`${a.electionDate}`))[0];
    return { upcoming, recent, live: records.filter((item) => item.status === "Voting Today").length, total: records.length };
  }, [worldElections]);
  const atlasBrief = useMemo(() => {
    const records = atlasStates as any[];
    return {
      tracked: records.length,
      enacted: records.filter((item) => item.enacted).length,
      litigated: records.filter((item) => item.litigationNotes).length,
      featured: records.find((item) => item.stateCode === "AL") ?? records[0],
    };
  }, [atlasStates]);

  return (
    <div className="hidden h-[calc(100dvh-64px)] overflow-hidden bg-background p-2 lg:block">
      <main className="mx-auto flex h-full max-w-[1640px] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-2 shadow-[0_18px_70px_rgba(17,24,39,0.12)] dark:shadow-black/35">
        {mode === "preview" && <div className="mb-2 flex shrink-0 items-center justify-between border-b border-border pb-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">Black Politics Now · Homepage direction</span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Reference-aligned visual example</span>
        </div>}

        <section className="grid min-h-0 flex-1 grid-cols-[0.92fr_1.68fr_0.96fr] grid-rows-[minmax(0,1fr)] gap-2">
          <aside className="min-h-0 overflow-hidden rounded-lg border border-border bg-background/55 p-3">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Latest News</h2><a href="https://blkpoliticsnow.com" className="text-[10px] font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer">View all</a></div>
            <div className="divide-y divide-border">
              {posts.map((post, index) => {
                const image = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Politics";
                return <a key={post.id ?? index} href={post.link} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 py-2.5 first:pt-0 last:pb-1">
                  {image ? <img src={image} alt="" className="h-11 w-11 shrink-0 rounded object-cover" /> : <div className="h-11 w-11 shrink-0 rounded bg-muted" />}
                  <div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">{category}</p><p className="mt-0.5 line-clamp-2 text-[11px] font-semibold leading-[1.24] text-foreground" dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }} /><p className="mt-1 text-[9px] text-muted-foreground">{post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Latest report"}</p></div>
                </a>;
              })}
            </div>
            <div className="mt-2 flex gap-2 border-t border-border pt-2"><div className="grid h-12 w-10 shrink-0 place-items-center rounded border border-primary/40 bg-primary/10 text-primary"><Landmark size={18} /></div><div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary">John Lewis Legacy</p><p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">The history of courage and the unfinished work of representation.</p><Link href="/atlas" className="mt-1 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">Explore the legacy <ArrowUpRight size={10} /></Link></div></div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background/55 p-3">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Interactive Election Map</p><h1 className="mt-0.5 text-[clamp(1rem,1.55vw,1.3rem)] font-bold tracking-tight text-foreground">2026 U.S. Senate Outlook</h1><p className="mt-0.5 text-[11px] text-muted-foreground">Tap a state for race details and analysis.</p></div><span className="rounded border border-border bg-card px-2.5 py-1.5 text-[9px] font-semibold text-muted-foreground">U.S. Senate</span></div>
            <div className="mt-2 flex shrink-0 flex-wrap gap-x-2.5 gap-y-1">{LEGEND.map(([label, color]) => <span key={label} className="inline-flex items-center gap-1 text-[8px] text-muted-foreground"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div>
            <div className="mt-1 min-h-0 flex-1 overflow-hidden"><USMapFull raceData={mapData} selectedState={null} onStateClick={() => undefined} /></div>
            <div className="flex shrink-0 items-center gap-2 border-t border-border pt-1.5 text-[9px]"><span className="font-bold uppercase tracking-[0.09em] text-primary">Live Results</span><span className="text-muted-foreground">•</span><span className="text-muted-foreground">Race calls, reporting, and polling</span><Link href="/elections" className="ml-auto inline-flex items-center gap-1 font-semibold text-primary">More <ArrowUpRight size={10} /></Link></div>
          </section>

          <aside className="min-h-0 overflow-hidden rounded-lg border border-border bg-background/55 p-3"><h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Daily Intelligence Brief</h2>
            <div className="mt-2 grid grid-cols-[76px_1fr] gap-2.5 border-b border-border pb-2.5"><div className="flex aspect-[0.8] items-end rounded border border-primary/45 bg-[linear-gradient(145deg,var(--secondary),var(--background))] p-2"><div><p className="text-sm font-black leading-[0.8] text-foreground">BLACK<br />POLITICS<br />NOW</p><p className="mt-2 border-t border-primary/70 pt-1 text-[7px] font-bold tracking-[0.1em] text-primary">DAILY BRIEF</p></div></div><div><p className="text-[10px] text-muted-foreground">{latestEpisode?.day ?? "Today"} {latestEpisode?.date ? `· ${latestEpisode.date}` : ""}</p><h3 className="mt-1 text-base font-bold leading-tight text-foreground">The Daily Intelligence Brief</h3><p className="mt-1.5 text-[10px] text-muted-foreground">{latestEpisode?.totalDurationLabel ? `${latestEpisode.totalDurationLabel} · ` : ""}Current analysis and context</p></div></div>
            <div className="flex items-center gap-2.5 border-b border-border py-2.5"><button type="button" onClick={() => latestEpisodeHasAudio && play({ url: latestEpisode.fullEpisodeCdnUrl, title: "The Daily Intelligence Brief", episodeDate: latestEpisode.date })} disabled={!latestEpisodeHasAudio} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><Play size={14} fill="currentColor" /></button><span className="text-[10px] font-semibold text-foreground">{latestEpisodeHasAudio ? "Play episode" : "Audio preparation"}</span><div className="ml-auto flex h-6 items-center gap-0.5">{[10,20,13,25,17,22,11,19,14].map((h, index) => <i key={index} className="w-1 rounded-full bg-primary/55" style={{ height: h }} />)}</div></div>
            <div className="pt-2"><p className="mb-1 text-[8px] font-bold uppercase tracking-[0.15em] text-primary">Episode Segments</p>{(segments.length ? segments : [{ label: "Opening Take" }, { label: "Congressional Roundup" }, { label: "State Watch" }, { label: "Global Black Politics" }, { label: "Final Word" }]).map((segment, index) => <div key={index} className="flex gap-2 py-1 text-[10px]"><span className="text-primary">▶</span><span className="min-w-0 flex-1 truncate text-foreground/80">{segment.label}</span><span className="text-muted-foreground">{segment.durationLabel ?? "—"}</span></div>)}<Link href="/podcast" className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">View podcast archive <ArrowUpRight size={10} /></Link></div>
          </aside>
        </section>

        <section className="mt-2 grid h-[clamp(144px,20vh,180px)] shrink-0 grid-cols-4 gap-2 rounded-lg border border-border bg-secondary/35 p-2">
          <a href="https://blkpoliticsnow.com" target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded border border-border bg-card/80 p-2.5 transition-colors hover:bg-muted/50"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary">Reporting Desk</p><p className="mt-2 text-[8px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Politics · Voting Rights</p><h3 className="mt-1 text-sm font-bold leading-tight text-foreground">Reporting built for the moment—and the record.</h3><p className="mt-2 line-clamp-2 text-[9px] leading-snug text-muted-foreground">Source context and analysis for the stories behind the vote.</p><span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">Read all stories <ArrowUpRight size={10} /></span></a>

          <Link href="/world" className="relative overflow-hidden rounded border border-border bg-card p-2.5 transition-colors hover:bg-muted/50"><div className="relative z-10 max-w-[53%]"><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Globe2 className="mr-1 inline" size={10} />World Elections</p><span className="flex items-center gap-1 rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">{worldBrief.total}<ArrowUpRight size={9} /></span></div><h3 className="mt-1 text-sm font-bold leading-tight text-foreground">The global democratic calendar.</h3><p className="mt-1 text-[8px] uppercase tracking-wide text-muted-foreground">{worldBrief.live ? `${worldBrief.live} voting now` : "Upcoming contests"}</p><div className="mt-2">{worldBrief.upcoming.slice(0, 1).map((item: any) => <div key={item.id} className="border-l-2 border-primary/60 pl-1.5"><p className="truncate text-[9px] font-semibold text-foreground">{item.country}</p><p className="text-[8px] text-muted-foreground">{shortDate(item.electionDate)} · {item.status === "Voting Today" ? "Voting today" : item.electionType}</p></div>)}</div></div><div aria-hidden className="absolute -bottom-3 -right-3 h-[148px] w-[148px] opacity-95"><MiniRepositoryGlobe theme={theme} /></div></Link>

          <Link href="/atlas" className="relative overflow-hidden rounded border border-border bg-card p-2.5 transition-colors hover:bg-muted/50"><img src="/manus-storage/selma-marchers-homepage_4dbcaa12.jpg" alt="Civil rights marchers crossing the Edmund Pettus Bridge in Selma" className="absolute inset-y-0 right-0 h-full w-[47%] object-cover opacity-20 grayscale dark:opacity-45" /><div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/25 dark:via-card/85 dark:to-transparent" /><div className="relative z-10 max-w-[60%]"><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Landmark className="mr-1 inline" size={10} />Historical Atlas</p><ArrowUpRight className="mt-0.5 text-primary" size={10} /></div><h3 className="mt-1 text-sm font-bold leading-tight text-foreground">From Selma to the map.</h3><p className="mt-1 text-[8px] uppercase tracking-wide text-muted-foreground">Civic memory · congressional geography</p><div className="mt-2 flex divide-x divide-border rounded border border-border bg-background/80 text-center"><span className="flex-1 py-1"><strong className="block text-[10px] text-foreground">{atlasBrief.tracked}</strong><small className="text-[7px] uppercase text-muted-foreground">States</small></span><span className="flex-1 py-1"><strong className="block text-[10px] text-foreground">1965</strong><small className="text-[7px] uppercase text-muted-foreground">Selma</small></span></div></div></Link>

          <Link href="/podcast" className="overflow-hidden rounded border border-border bg-card/80 p-2.5 transition-colors hover:bg-muted/50"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Mic2 className="mr-1 inline" size={10} />Podcast Archive</p><h3 className="mt-1 text-sm font-bold leading-tight text-foreground">Daily analysis. Deep context. Real conversation.</h3><div className="mt-2 space-y-1.5">{segments.slice(0, 3).map((segment, index) => <div key={`${segment.label}-${index}`} className="flex gap-1.5 text-[9px] text-muted-foreground"><span className="text-primary">▶</span><span className="min-w-0 flex-1 truncate">{segment.label}</span><span>{segment.durationLabel}</span></div>)}</div><span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">View full archive <ArrowUpRight size={10} /></span></Link>
        </section>
      </main>
    </div>
  );
}

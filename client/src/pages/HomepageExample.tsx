import { Link } from "wouter";
import { useMemo, useState } from "react";
import { ArrowUpRight, Globe2, Landmark, Mic2, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { USMapFull } from "@/components/USMapFull";
import MiniRepositoryGlobe from "@/components/MiniRepositoryGlobe";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type MapMode = "senate" | "house" | "governor";

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", DC: "District of Columbia",
};

const LEGEND = [
  ["Solid D", "bg-[#215da8]"], ["Likely D", "bg-[#3679cf]"], ["Lean D", "bg-[#77a6e8]"], ["Toss-up", "bg-[#7b3ff2]"],
  ["Lean R", "bg-[#de765d]"], ["Likely R", "bg-[#c84343]"], ["Solid R", "bg-[#961d21]"],
] as const;

function shortDate(value?: string) {
  if (!value) return "Date pending";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function RatingBadge({ rating }: { rating?: string | null }) {
  const tone = rating === "Toss-up" ? "border-purple-500/35 bg-purple-500/10 text-purple-600 dark:text-purple-300" : rating?.includes("D") ? "border-blue-500/35 bg-blue-500/10 text-blue-700 dark:text-blue-300" : "border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-300";
  return <span className={`rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${tone}`}>{rating ?? "Unrated"}</span>;
}

function RaceDetail({ race, mode }: { race: any; mode: MapMode }) {
  const title = mode === "house" ? `District ${race.district ?? "—"}` : mode === "governor" ? `${race.stateName ?? "State"} Governor` : `${race.stateName ?? "State"} Senate`;
  const first = mode === "governor" ? { name: race.demCandidate, party: "D", photo: race.demPhoto } : { name: race.candidate1Name, party: race.candidate1Party, photo: race.candidate1Photo };
  const second = mode === "governor" ? { name: race.repCandidate, party: "R", photo: race.repPhoto } : { name: race.candidate2Name, party: race.candidate2Party, photo: race.candidate2Photo };
  const note = race.notes || race.specialNote || race.incumbentRetiring || race.primaryWinner ? [race.notes, race.specialNote, race.incumbentRetiring ? "Open seat: incumbent is retiring." : "", race.primaryWinner ? `Primary winner: ${race.primaryWinner}.` : ""].filter(Boolean).join(" ") : "No additional editorial note is available for this contest yet.";
  return <article className="rounded-md border border-border bg-card p-3">
    <div className="flex items-start justify-between gap-3"><h4 className="text-sm font-bold text-foreground">{title}</h4><RatingBadge rating={race.rating} /></div>
    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[11px]">
      <Candidate candidate={first} partyClass="blue" />
      <span className="text-[9px] text-muted-foreground">VS</span>
      <Candidate candidate={second} partyClass="red" align="right" />
    </div>
    {(race.incumbent || race.incumbentName) && <p className="mt-2 text-[10px] text-muted-foreground">Incumbent: {race.incumbent || race.incumbentName}{race.incumbentParty ? ` (${race.incumbentParty})` : ""}</p>}
    <div className="mt-2 border-l-2 border-primary/70 bg-primary/5 px-2.5 py-2"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">Contest notes</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{note}</p></div>
  </article>;
}

function Candidate({ candidate, partyClass, align = "left" }: { candidate: { name?: string; party?: string; photo?: string }; partyClass: "blue" | "red"; align?: "left" | "right" }) {
  const skin = partyClass === "blue" ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300" : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300";
  return <div className={`flex min-w-0 items-center gap-1.5 rounded border px-1.5 py-1.5 ${skin} ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
    {candidate.photo && <img src={candidate.photo} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" onError={(event) => { (event.target as HTMLImageElement).style.display = "none"; }} />}
    <span className="truncate font-semibold">{candidate.name || "Pending"} <span className="opacity-70">({candidate.party || "?"})</span></span>
  </div>;
}

export default function HomepageExample({ mode = "preview" }: { mode?: "preview" | "home" }) {
  const { data: news } = trpc.news.list.useQuery({ page: 1, perPage: 8 });
  const { data: senateRaces } = trpc.election.senate.useQuery();
  const { data: houseRaces } = trpc.election.house.useQuery();
  const { data: governors } = trpc.election.governors.useQuery();
  const { data: episodes } = trpc.podcast.getEpisodes.useQuery();
  const { data: worldElections = [] } = trpc.world.elections.useQuery();
  const { data: atlasStates = [] } = trpc.election.redistricting.useQuery();
  const { play } = useAudio();
  const { theme } = useTheme();
  const [mapMode, setMapMode] = useState<MapMode>("senate");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateDetailOpen, setStateDetailOpen] = useState(false);

  const posts: any[] = (news as any)?.posts ?? [];
  const leadPosts = posts.slice(0, 4);
  const morePosts = posts.slice(4, 7);
  const latestEpisode: any = episodes?.[0];
  const segments: any[] = (latestEpisode?.segments ?? []).slice(0, 5);
  const latestEpisodeHasAudio = Boolean(latestEpisode?.fullEpisodeCdnUrl);

  const mapData = useMemo(() => {
    const entries: Record<string, { rating: string | null; candidate1: string; candidate2: string; calledWinner?: string | null }> = {};
    if (mapMode === "senate") {
      (senateRaces as any[] ?? []).forEach((race) => {
        if (race.stateCode) entries[race.stateCode] = { rating: race.rating, candidate1: race.candidate1Name ? `${race.candidate1Name} (${race.candidate1Party ?? "?"})` : "Democratic candidate", candidate2: race.candidate2Name ? `${race.candidate2Name} (${race.candidate2Party ?? "?"})` : "Republican candidate", calledWinner: race.calledWinner };
      });
    } else if (mapMode === "governor") {
      (governors as any[] ?? []).forEach((race) => {
        if (race.stateCode) entries[race.stateCode] = { rating: race.rating, candidate1: race.demCandidate ? `${race.demCandidate} (D)` : "Democratic candidate", candidate2: race.repCandidate ? `${race.repCandidate} (R)` : "Republican candidate", calledWinner: race.calledWinner };
      });
    } else {
      const stateRatings: Record<string, string[]> = {};
      (houseRaces as any[] ?? []).forEach((race) => {
        if (!race.stateCode) return;
        stateRatings[race.stateCode] ??= [];
        if (race.rating) stateRatings[race.stateCode].push(race.rating);
      });
      Object.entries(stateRatings).forEach(([code, ratings]) => {
        const priority = ["Toss-up", "Lean D", "Lean R", "Likely D", "Likely R", "Solid D", "Solid R"];
        const rating = priority.find((item) => ratings.includes(item)) ?? ratings[0] ?? null;
        entries[code] = { rating, candidate1: `${ratings.length} districts`, candidate2: `${ratings.filter((item) => item.includes("D")).length} D · ${ratings.filter((item) => item.includes("R")).length} R` };
      });
    }
    return entries;
  }, [mapMode, senateRaces, houseRaces, governors]);

  const selectedRaces = useMemo(() => {
    if (!selectedState) return [];
    if (mapMode === "senate") return (senateRaces as any[] ?? []).filter((race) => race.stateCode === selectedState);
    if (mapMode === "governor") return (governors as any[] ?? []).filter((race) => race.stateCode === selectedState);
    return (houseRaces as any[] ?? []).filter((race) => race.stateCode === selectedState);
  }, [selectedState, mapMode, senateRaces, houseRaces, governors]);

  const worldBrief = useMemo(() => {
    const records = worldElections as any[];
    const upcoming = records.filter((item) => item.status === "Upcoming" || item.status === "Voting Today").sort((a, b) => `${a.electionDate}`.localeCompare(`${b.electionDate}`))[0];
    return { upcoming, live: records.filter((item) => item.status === "Voting Today").length, total: records.length };
  }, [worldElections]);

  const atlasBrief = useMemo(() => {
    const records = atlasStates as any[];
    return { tracked: records.length, enacted: records.filter((item) => item.enacted).length, litigated: records.filter((item) => item.litigationNotes).length };
  }, [atlasStates]);

  const mapLabel = mapMode === "senate" ? "2026 U.S. Senate Outlook" : mapMode === "house" ? "2026 U.S. House Outlook" : "2026 Governor Outlook";
  const stateTitle = selectedState ? `${STATE_NAMES[selectedState] ?? selectedState} · ${mapMode === "house" ? "House races" : mapMode === "governor" ? "Governor race" : "Senate race"}` : "State race details";

  return (
    <div className="hidden h-[calc(100dvh-64px)] overflow-hidden bg-background p-2 lg:block">
      <main className="mx-auto flex h-full max-w-[1640px] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-2 shadow-[0_18px_70px_rgba(17,24,39,0.12)] dark:shadow-black/35">
        {mode === "preview" && <div className="mb-2 flex shrink-0 items-center justify-between border-b border-border pb-1.5"><span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">Black Politics Now · Homepage direction</span><span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Reference-aligned visual example</span></div>}

        <section className="grid min-h-0 flex-1 grid-cols-[0.92fr_1.68fr_0.96fr] grid-rows-[minmax(0,1fr)] gap-2">
          <aside className="min-h-0 overflow-hidden rounded-lg border border-border bg-background/55 p-3">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Latest News</h2><a href="https://blkpoliticsnow.com" className="text-[10px] font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer">View all</a></div>
            <div className="divide-y divide-border">{leadPosts.map((post, index) => <NewsRow key={post.id ?? index} post={post} />)}</div>
          </aside>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background/55 p-3">
            <div className="flex shrink-0 flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Interactive Election Map</p><h1 className="mt-0.5 text-[clamp(1rem,1.55vw,1.3rem)] font-bold tracking-tight text-foreground">{mapLabel}</h1><p className="mt-0.5 text-[11px] text-muted-foreground">Choose a chamber, then select a state for contest notes and detail.</p></div><div className="flex rounded border border-border bg-card p-0.5">{(["senate", "house", "governor"] as MapMode[]).map((item) => <button key={item} type="button" onClick={() => { setMapMode(item); setSelectedState(null); }} className={`rounded px-2 py-1 text-[8px] font-bold uppercase tracking-[0.09em] transition-colors ${mapMode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{item}</button>)}</div></div>
            <div className="mt-2 flex shrink-0 flex-wrap gap-x-2.5 gap-y-1">{LEGEND.map(([label, color]) => <span key={label} className="inline-flex items-center gap-1 text-[8px] text-muted-foreground"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div>
            <div className="mt-1 min-h-0 flex-1 overflow-hidden"><USMapFull raceData={mapData} selectedState={selectedState} onStateClick={(state) => { setSelectedState(state); setStateDetailOpen(true); }} /></div>
            <div className="flex shrink-0 items-center gap-2 border-t border-border pt-1.5 text-[9px]"><span className="font-bold uppercase tracking-[0.09em] text-primary">Live Results</span><span className="text-muted-foreground">•</span><span className="text-muted-foreground">Race calls, reporting, and new polling</span><Link href="/elections" className="ml-auto inline-flex items-center gap-1 font-semibold text-primary">More <ArrowUpRight size={10} /></Link></div>
          </section>

          <aside className="min-h-0 overflow-hidden rounded-lg border border-border bg-background/55 p-3"><h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Daily Intelligence Brief</h2>
            <div className="mt-2 grid grid-cols-[76px_1fr] gap-2.5 border-b border-border pb-2.5"><div className="flex aspect-[0.8] items-end rounded border border-primary/45 bg-[linear-gradient(145deg,var(--secondary),var(--background))] p-2"><div><p className="text-sm font-black leading-[0.8] text-foreground">BLACK<br />POLITICS<br />NOW</p><p className="mt-2 border-t border-primary/70 pt-1 text-[7px] font-bold tracking-[0.1em] text-primary">DAILY BRIEF</p></div></div><div><p className="text-[10px] text-muted-foreground">{latestEpisode?.day ?? "Today"} {latestEpisode?.date ? `· ${latestEpisode.date}` : ""}</p><h3 className="mt-1 text-base font-bold leading-tight text-foreground">The Daily Intelligence Brief</h3><p className="mt-1.5 text-[10px] text-muted-foreground">{latestEpisode?.totalDurationLabel ? `${latestEpisode.totalDurationLabel} · ` : ""}Current analysis and context</p></div></div>
            <div className="flex items-center gap-2.5 border-b border-border py-2.5"><button type="button" onClick={() => latestEpisodeHasAudio && play({ url: latestEpisode.fullEpisodeCdnUrl, title: "The Daily Intelligence Brief", episodeDate: latestEpisode.date })} disabled={!latestEpisodeHasAudio} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><Play size={14} fill="currentColor" /></button><span className="text-[10px] font-semibold text-foreground">{latestEpisodeHasAudio ? "Play episode" : "Audio preparation"}</span><div className="ml-auto flex h-6 items-center gap-0.5">{[10, 20, 13, 25, 17, 22, 11, 19, 14].map((height, index) => <i key={index} className="w-1 rounded-full bg-primary/55" style={{ height }} />)}</div></div>
            <div className="pt-2"><p className="mb-1 text-[8px] font-bold uppercase tracking-[0.15em] text-primary">Episode Segments</p>{(segments.length ? segments : [{ label: "Opening Take" }, { label: "Congressional Roundup" }, { label: "State Watch" }, { label: "Global Black Politics" }, { label: "Final Word" }]).map((segment, index) => <div key={index} className="flex gap-2 py-1 text-[10px]"><span className="text-primary">▶</span><span className="min-w-0 flex-1 truncate text-foreground/80">{segment.label}</span><span className="text-muted-foreground">{segment.durationLabel ?? "—"}</span></div>)}<Link href="/podcast" className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">View podcast archive <ArrowUpRight size={10} /></Link></div>
          </aside>
        </section>

        <section className="mt-2 grid h-[clamp(144px,20vh,180px)] shrink-0 grid-cols-4 gap-2 rounded-lg border border-border bg-secondary/35 p-2">
          <a href="https://blkpoliticsnow.com" target="_blank" rel="noopener noreferrer" className="overflow-hidden rounded border border-border bg-card/80 p-2.5 transition-colors hover:bg-muted/50"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary">More Latest News</p><div className="mt-2 divide-y divide-border">{morePosts.map((post, index) => <NewsRow compact key={post.id ?? index} post={post} />)}</div><span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">Open the newsroom <ArrowUpRight size={10} /></span></a>

          <Link href="/world" className="relative overflow-hidden rounded border border-cyan-400/30 bg-[radial-gradient(circle_at_78%_30%,rgba(84,198,255,0.26),transparent_42%),linear-gradient(135deg,#06162d,#0a2647_55%,#0d1727)] p-2.5 shadow-[inset_0_0_35px_rgba(48,165,255,0.13)] transition-colors hover:border-cyan-300/80"><div className="relative z-10 max-w-[51%]"><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-cyan-100"><Globe2 className="mr-1 inline" size={10} />World Elections</p><span className="flex items-center gap-1 rounded border border-cyan-200/30 bg-cyan-100/10 px-1.5 py-0.5 text-[8px] font-bold text-cyan-100">{worldBrief.total}<ArrowUpRight size={9} /></span></div><h3 className="mt-1 text-sm font-bold leading-tight text-white">Global democratic watch.</h3><p className="mt-1 text-[8px] uppercase tracking-wide text-cyan-100/75">{worldBrief.live ? `${worldBrief.live} voting now` : "Upcoming contests"}</p>{worldBrief.upcoming && <div className="mt-2 border-l-2 border-cyan-200/80 pl-1.5"><p className="truncate text-[9px] font-semibold text-white">{worldBrief.upcoming.country}</p><p className="text-[8px] text-cyan-100/75">{shortDate(worldBrief.upcoming.electionDate)} · {worldBrief.upcoming.electionType}</p></div>}</div><div aria-hidden className="absolute -bottom-2 -right-2 h-[154px] w-[154px] drop-shadow-[0_0_20px_rgba(83,211,255,0.75)]"><MiniRepositoryGlobe theme={theme} vibrant /></div></Link>

          <Link href="/atlas" className="relative overflow-hidden rounded border border-border bg-card p-2.5 transition-colors hover:bg-muted/50"><img src="/manus-storage/selma-marchers-homepage_4dbcaa12.jpg" alt="Civil rights marchers crossing the Edmund Pettus Bridge in Selma" className="absolute inset-y-0 right-0 h-full w-[42%] object-cover opacity-22 grayscale dark:opacity-40" /><div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/20 dark:via-card/88 dark:to-transparent" /><div className="relative z-10 max-w-[67%]"><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Landmark className="mr-1 inline" size={10} />Historical Atlas</p><ArrowUpRight className="mt-0.5 text-primary" size={10} /></div><h3 className="mt-1 text-sm font-bold leading-tight text-foreground">History behind today’s map.</h3><p className="mt-1 text-[8px] leading-snug text-muted-foreground">Selma, voting rights, representation, apportionment, and active redistricting in one civic record.</p><div className="mt-2 grid grid-cols-3 divide-x divide-border rounded border border-border bg-background/80 text-center"><AtlasStat value="1965" label="Selma" /><AtlasStat value={atlasBrief.tracked} label="States" /><AtlasStat value={atlasBrief.litigated} label="Cases" /></div></div></Link>

          <Link href="/podcast" className="overflow-hidden rounded border border-border bg-card/80 p-2.5 transition-colors hover:bg-muted/50"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Mic2 className="mr-1 inline" size={10} />Podcast Archive</p><h3 className="mt-1 text-sm font-bold leading-tight text-foreground">Daily analysis. Deep context. Real conversation.</h3><div className="mt-2 space-y-1.5">{segments.slice(0, 3).map((segment, index) => <div key={`${segment.label}-${index}`} className="flex gap-1.5 text-[9px] text-muted-foreground"><span className="text-primary">▶</span><span className="min-w-0 flex-1 truncate">{segment.label}</span><span>{segment.durationLabel}</span></div>)}</div><span className="mt-2 inline-flex items-center gap-1 text-[9px] font-semibold text-primary">View full archive <ArrowUpRight size={10} /></span></Link>
        </section>
      </main>

      <Dialog open={stateDetailOpen} onOpenChange={setStateDetailOpen}>
        <DialogContent className="max-h-[82vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{stateTitle}</DialogTitle></DialogHeader><div className="space-y-2">{selectedRaces.length ? selectedRaces.map((race, index) => <RaceDetail key={race.id ?? index} race={race} mode={mapMode} />) : <p className="rounded border border-border p-3 text-sm text-muted-foreground">No {mapMode === "house" ? "House races" : mapMode === "governor" ? "Governor race" : "Senate race"} are currently tracked for this state.</p>}</div></DialogContent>
      </Dialog>
    </div>
  );
}

function NewsRow({ post, compact = false }: { post: any; compact?: boolean }) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Politics";
  return <a href={post.link} target="_blank" rel="noopener noreferrer" className={`flex gap-2.5 ${compact ? "py-1.5" : "py-2.5 first:pt-0 last:pb-1"}`}>
    {!compact && (image ? <img src={image} alt="" className="h-11 w-11 shrink-0 rounded object-cover" /> : <div className="h-11 w-11 shrink-0 rounded bg-muted" />)}
    <div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">{category}</p><p className={`${compact ? "line-clamp-1 text-[9px]" : "mt-0.5 line-clamp-2 text-[11px]"} font-semibold leading-[1.24] text-foreground`} dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }} />{!compact && <p className="mt-1 text-[9px] text-muted-foreground">{post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Latest report"}</p>}</div>
  </a>;
}

function AtlasStat({ value, label }: { value: string | number; label: string }) {
  return <span className="py-1"><strong className="block text-[10px] text-foreground">{value}</strong><small className="text-[7px] uppercase text-muted-foreground">{label}</small></span>;
}

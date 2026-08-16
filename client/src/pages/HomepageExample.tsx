import { Link } from "wouter";
import { useMemo, useState } from "react";
import { ArrowUpRight, Globe2, Landmark, Mic2, Play, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { rankedWorldSignals, worldSignalLabel } from "@/lib/worldElectionDisplay";
import { USMapFull } from "@/components/USMapFull";
import { ResultsTicker } from "@/components/ResultsTicker";
import MiniRepositoryGlobe from "@/components/MiniRepositoryGlobe";
import { useAudio } from "@/contexts/AudioContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type MapMode = "senate" | "house" | "governor" | "blackrep";

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
    {race.calledWinner && <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]"><span className="font-semibold text-primary">Winner: {race.calledWinner}{race.calledParty ? ` (${race.calledParty})` : ""}</span>{race.calledSourceUrl && <a href={race.calledSourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80">Evidence source ↗</a>}</div>}
    <div className="mt-2 border-l-2 border-primary/70 bg-primary/5 px-2.5 py-2"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">Contest notes</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{note}</p></div>
  </article>;
}

function BlackRepresentationDetail({ record }: { record: any }) {
  if (record.popupType === "member") {
    const profileNote = record.raceSummary || record.notes || "No additional profile note is available for this representation record yet.";
    return <article className="rounded-md border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        {record.photo ? <img src={record.photo} alt="" className="h-10 w-10 shrink-0 rounded-full border border-primary/30 object-cover" onError={(event) => { (event.target as HTMLImageElement).style.display = "none"; }} /> : <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-[9px] font-bold text-primary">BR</div>}
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h4 className="text-sm font-bold text-foreground">{record.member}</h4><p className="text-[10px] text-muted-foreground">{record.state} · District {record.district} · {record.party}</p></div><span className="rounded border border-purple-500/35 bg-purple-500/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">{String(record.status ?? "tracked").replaceAll("_", " ")}</span></div><p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">{profileNote}</p><div className="mt-2 flex flex-wrap gap-2 text-[9px] text-muted-foreground"><span>{record.roleType ? `Role: ${String(record.roleType).replaceAll("_", " ")}` : "Representation profile"}</span>{record.upIn2026 && <span>· Up in 2026</span>}{record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{record.sourceLabel || "Source"} ↗</a>}</div></div>
      </div>
    </article>;
  }

  const result = record.resultStatus ? String(record.resultStatus).replaceAll("_", " ") : "tracked";
  const resultNote = record.notes || record.redistrictingContext || "This article-backed record is being tracked in the Black Representation election file.";
  return <article className="rounded-md border border-border bg-card p-3">
    <div className="flex items-start justify-between gap-3"><div><h4 className="text-sm font-bold text-foreground">{record.state} · District {record.district}</h4><p className="text-[10px] text-muted-foreground">{record.chamber} {record.electionType} {record.partyContest ? `· ${record.partyContest}` : ""}</p></div><span className="rounded border border-primary/35 bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary">{result}</span></div>
    <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[10px]"><div className="rounded border border-purple-500/25 bg-purple-500/5 px-2 py-1.5 text-purple-800 dark:text-purple-200"><strong className="block truncate">{record.winnerName || "Result pending"}</strong><span className="opacity-75">{record.winnerParty || "—"}{record.winnerVotePct != null ? ` · ${record.winnerVotePct}%` : ""}</span></div><span className="text-[8px] text-muted-foreground">VS</span><div className="rounded border border-border bg-muted/35 px-2 py-1.5 text-right text-foreground"><strong className="block truncate">{record.runnerUpName || record.generalOpponent || "Opponent pending"}</strong><span className="opacity-65">{record.runnerUpParty || "—"}{record.runnerUpVotePct != null ? ` · ${record.runnerUpVotePct}%` : ""}</span></div></div>
    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{resultNote}</p>
    <div className="mt-2 flex flex-wrap gap-2 text-[9px]">{record.electionDate && <span className="text-muted-foreground">Election: {record.electionDate}</span>}{record.articleUrl && <a href={record.articleUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Black Politics Now article ↗</a>}{record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">{record.sourceLabel || "Source"} ↗</a>}</div>
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
  const { data: news, isLoading: newsLoading } = trpc.news.list.useQuery({ page: 1, perPage: 12 });
  const { data: senateRaces, isLoading: senateLoading } = trpc.election.senate.useQuery();
  const { data: houseRaces, isLoading: houseLoading } = trpc.election.house.useQuery();
  const { data: governors, isLoading: governorLoading } = trpc.election.governors.useQuery();
  const { data: cbcMembers, isLoading: blackRepresentationLoading } = trpc.election.cbc.useQuery();
  const { data: blackRepresentationElections } = trpc.election.blackRepresentationElections.useQuery();
  const { data: episodes, isLoading: episodesLoading } = trpc.podcast.getEpisodes.useQuery();
  const { data: worldElections = [], isLoading: worldLoading } = trpc.world.elections.useQuery(undefined, {
    staleTime: 15_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
  const { data: atlasStates = [], isLoading: atlasLoading } = trpc.election.redistricting.useQuery();
  const { play } = useAudio();
  const { theme } = useTheme();
  const [mapMode, setMapMode] = useState<MapMode>("senate");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateDetailOpen, setStateDetailOpen] = useState(false);
  const [mapSearch, setMapSearch] = useState("");

  const posts: any[] = (news as any)?.posts ?? [];
  const leadPosts = posts.slice(0, 8);
  const latestEpisode: any = episodes?.[0];
  const segments: any[] = latestEpisode?.segments ?? [];
  const latestEpisodeHasAudio = Boolean(latestEpisode?.fullEpisodeCdnUrl);
  const mapLoading = mapMode === "senate" ? senateLoading : mapMode === "house" ? houseLoading : mapMode === "governor" ? governorLoading : blackRepresentationLoading;

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
    } else if (mapMode === "house") {
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
    } else {
      const memberCountByState: Record<string, number> = {};
      (cbcMembers as any[] ?? []).forEach((member) => {
        if (member.stateCode) memberCountByState[member.stateCode] = (memberCountByState[member.stateCode] ?? 0) + 1;
      });
      Object.entries(memberCountByState).forEach(([code, count]) => {
        entries[code] = { rating: "Toss-up", candidate1: `${count} Black member${count === 1 ? "" : "s"}`, candidate2: "Black Representation" };
      });
    }
    return entries;
  }, [mapMode, senateRaces, houseRaces, governors, cbcMembers]);

  const selectedRaces = useMemo(() => {
    if (!selectedState) return [];
    if (mapMode === "senate") return (senateRaces as any[] ?? []).filter((race) => race.stateCode === selectedState);
    if (mapMode === "governor") return (governors as any[] ?? []).filter((race) => race.stateCode === selectedState);
    if (mapMode === "house") return (houseRaces as any[] ?? []).filter((race) => race.stateCode === selectedState);
    const members = (cbcMembers as any[] ?? []).filter((member) => member.stateCode === selectedState).map((member) => ({ ...member, popupType: "member" }));
    const elections = (blackRepresentationElections as any[] ?? []).filter((election) => election.stateCode === selectedState).map((election) => ({ ...election, popupType: "election" }));
    return [...members, ...elections];
  }, [selectedState, mapMode, senateRaces, houseRaces, governors, cbcMembers, blackRepresentationElections]);

  const chamberInsight = useMemo(() => {
    if (mapMode === "blackrep") {
      const members = cbcMembers as any[] ?? [];
      const electionRecords = blackRepresentationElections as any[] ?? [];
      const states = new Set(members.map((member) => member.stateCode).filter(Boolean));
      const completed = electionRecords.filter((record) => record.resultStatus === "called" || record.resultStatus === "uncontested").length;
      return { title: "Black Representation tracker", coverage: "representation profiles", total: members.length, tossUps: electionRecords.length, leans: states.size, calls: completed, summary: `${members.length} tracked profiles across ${states.size} states, alongside ${electionRecords.length} article-backed election records.` };
    }
    const races = (mapMode === "senate" ? senateRaces : mapMode === "house" ? houseRaces : governors) as any[] ?? [];
    const ratings = races.map((race) => race.rating).filter(Boolean);
    const tossUps = ratings.filter((rating) => rating === "Toss-up").length;
    const leans = ratings.filter((rating) => rating === "Lean D" || rating === "Lean R").length;
    const calls = races.filter((race) => Boolean(race.calledWinner)).length;
    const title = mapMode === "senate" ? "Senate outlook" : mapMode === "house" ? "House outlook" : "Governor outlook";
    const coverage = mapMode === "senate" ? "statewide contests" : mapMode === "house" ? "district contests" : "statewide contests";
    return {
      title,
      coverage,
      total: races.length,
      tossUps,
      leans,
      calls,
      summary: tossUps || leans
        ? `${tossUps} toss-up and ${leans} lean race${tossUps + leans === 1 ? "" : "s"} shape the current outlook.`
        : `Every tracked ${coverage.slice(0, -1)} currently has a defined rating outlook.`,
    };
  }, [mapMode, senateRaces, houseRaces, governors, cbcMembers, blackRepresentationElections]);

  const worldBrief = useMemo(() => {
    const records = worldElections as any[];
    const featured = rankedWorldSignals(records)[0];
    const upcomingCount = records.filter((item) => item.status === "Upcoming").length;
    const updated = records.reduce<string | null>((latest, item) => !latest || `${item.updatedAt ?? ""}` > latest ? `${item.updatedAt ?? ""}` : latest, null);
    return { featured, featuredLabel: featured ? worldSignalLabel(featured) : null, upcomingCount, live: records.filter((item) => item.status === "Voting Today").length, total: records.length, updated };
  }, [worldElections]);

  const atlasBrief = useMemo(() => {
    const records = atlasStates as any[];
    return { activeWatch: records.length, enacted: records.filter((item) => item.enacted).length, litigated: records.filter((item) => item.litigationNotes).length };
  }, [atlasStates]);

  const mapLabel = mapMode === "senate" ? "2026 U.S. Senate Outlook" : mapMode === "house" ? "2026 U.S. House Outlook" : mapMode === "governor" ? "2026 Governor Outlook" : "Black Representation Tracker";
  const stateTitle = selectedState ? `${STATE_NAMES[selectedState] ?? selectedState} · ${mapMode === "house" ? "House races" : mapMode === "governor" ? "Governor race" : mapMode === "senate" ? "Senate race" : "Black Representation"}` : "State race details";
  const mapSearchMatches = useMemo(() => {
    const query = mapSearch.trim().toLowerCase();
    if (query.length < 2) return [];
    const races = (mapMode === "blackrep" ? [...(cbcMembers as any[] ?? []), ...(blackRepresentationElections as any[] ?? [])] : mapMode === "senate" ? senateRaces : mapMode === "house" ? houseRaces : governors) as any[] ?? [];
    const seen = new Set<string>();
    return races.flatMap((race) => {
      const stateCode = race.stateCode;
      const stateName = race.stateName ?? STATE_NAMES[stateCode] ?? stateCode;
      const candidates = mapMode === "blackrep" ? [race.member, race.winnerName, race.runnerUpName] : mapMode === "governor" ? [race.demCandidate, race.repCandidate] : [race.candidate1Name, race.candidate2Name];
      const matches = `${stateName} ${stateCode} ${candidates.filter(Boolean).join(" ")}`.toLowerCase().includes(query);
      if (!matches || !stateCode || seen.has(stateCode)) return [];
      seen.add(stateCode);
      return [{ stateCode, label: `${stateName} · ${mapMode === "house" ? `${(houseRaces as any[] ?? []).filter((item) => item.stateCode === stateCode).length} districts` : mapMode === "blackrep" ? `${(cbcMembers as any[] ?? []).filter((item) => item.stateCode === stateCode).length} members` : candidates.filter(Boolean).join(" vs ")}` }];
    }).slice(0, 6);
  }, [mapSearch, mapMode, senateRaces, houseRaces, governors, cbcMembers, blackRepresentationElections]);

  return (
    <div className="homepage-editorial-home homepage-atlas-shell hidden h-[calc(100dvh-64px)] overflow-hidden bg-background p-2 lg:block">
      <main className="homepage-atlas-main mx-auto flex h-full max-w-[1640px] min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card p-2 shadow-[0_18px_70px_rgba(17,24,39,0.12)] dark:shadow-black/35">
        {mode === "preview" && <div className="mb-2 flex shrink-0 items-center justify-between border-b border-border pb-1.5"><span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">Black Politics Now · Homepage direction</span><span className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Reference-aligned visual example</span></div>}
        <div className="mb-2 shrink-0"><ResultsTicker senateRaces={senateRaces as any[] ?? []} houseRaces={houseRaces as any[] ?? []} /></div>
        <section className="grid min-h-0 flex-1 grid-cols-[0.92fr_1.68fr_0.96fr] grid-rows-[minmax(0,1fr)] gap-2">
          <aside className="grid min-h-0 grid-rows-[minmax(0,1fr)_clamp(220px,31vh,286px)] gap-3 overflow-hidden">
            <section className="homepage-atlas-panel flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background/55 p-3">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Latest News</h2><a href="https://blkpoliticsnow.com" className="text-[10px] font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer">View all</a></div>
            <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto pr-1 [scrollbar-color:var(--primary)_transparent] [scrollbar-width:thin]">{newsLoading && !leadPosts.length ? <NewsLoadingRows /> : leadPosts.map((post, index) => <NewsRow key={post.id ?? index} post={post} />)}</div>
            </section>
            <Link href="/atlas" className="group relative overflow-hidden rounded-lg border border-primary/35 bg-card transition-colors hover:bg-muted/50"><img src="/manus-storage/selma-marchers-homepage_4dbcaa12.jpg" alt="Civil rights marchers crossing the Edmund Pettus Bridge in Selma" className="absolute inset-0 h-full w-full object-cover opacity-70 contrast-125 saturate-125 transition-transform duration-500 group-hover:scale-105 dark:opacity-50 dark:mix-blend-luminosity" /><div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/60 to-transparent dark:from-card dark:via-card/70 dark:to-background/15" /><div className="relative z-10 flex h-full flex-col justify-end p-3"><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-primary"><Landmark className="mr-1 inline" size={10} />Voting Rights Act</p><ArrowUpRight className="text-primary" size={11} /></div><p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">Selma · 1965</p><h3 className="mt-1 text-[15px] font-bold leading-[1.05] text-foreground">The map has a memory.</h3><p className="mt-1 max-w-[90%] text-[8px] leading-snug text-muted-foreground">A 50-state archive of the VRA, representation, and apportionment—plus today’s active redistricting watch.</p><div className="mt-2 grid grid-cols-3 divide-x divide-border rounded border border-border bg-background/85 text-center backdrop-blur-[1px]"><AtlasStat value="1965" label="VRA" /><AtlasStat value="50" label="States" /><AtlasStat value={atlasBrief.activeWatch || 16} label="Active" /></div></div></Link>
          </aside>

          <section className="homepage-atlas-panel relative min-h-0 overflow-hidden rounded-lg border border-border bg-background/55">
            <div className="absolute inset-x-4 bottom-[94px] top-[136px] flex items-center justify-center overflow-hidden rounded-md"><div className="w-full translate-y-2"><USMapFull showLegend={false} raceData={mapData} selectedState={selectedState} onStateClick={(state) => { setSelectedState(state); setStateDetailOpen(true); }} /></div>{mapLoading && <div className="absolute inset-0 grid place-items-center bg-background/45 backdrop-blur-[1px]"><div className="rounded-full border border-primary/25 bg-card/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary shadow-sm">Loading election intelligence</div></div>}</div>
            <div className="pointer-events-none absolute inset-x-3 top-3 z-10 rounded-lg border border-border bg-card/94 p-3 shadow-sm"><div className="pointer-events-auto flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Interactive Election Map</p><h1 className="mt-0.5 text-[clamp(1rem,1.55vw,1.3rem)] font-bold tracking-tight text-foreground">{mapLabel}</h1><p className="mt-0.5 text-[11px] text-muted-foreground">Choose a view, then select a state for verified details and notes.</p></div><div className="flex rounded border border-border bg-background/85 p-0.5 shadow-sm">{(["blackrep", "governor", "house", "senate"] as MapMode[]).map((item) => <button key={item} type="button" onClick={() => { setMapMode(item); setSelectedState(null); setMapSearch(""); }} className={`rounded px-2 py-1 text-[8px] font-bold uppercase tracking-[0.09em] transition-colors ${mapMode === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{item === "blackrep" ? "Black Rep" : item}</button>)}</div></div><div className="pointer-events-auto relative mt-2 max-w-sm"><Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} /><input value={mapSearch} onChange={(event) => setMapSearch(event.target.value)} placeholder="Search a state or person" className="h-7 w-full rounded border border-border bg-background/85 pl-7 pr-2 text-[10px] text-foreground outline-none placeholder:text-muted-foreground focus:border-primary/60" aria-label="Search election map" />{mapSearchMatches.length > 0 && <div className="absolute inset-x-0 top-8 overflow-hidden rounded border border-border bg-card shadow-lg">{mapSearchMatches.map((match) => <button key={match.stateCode} type="button" onClick={() => { setSelectedState(match.stateCode); setStateDetailOpen(true); setMapSearch(""); }} className="block w-full border-b border-border px-2 py-1.5 text-left text-[9px] text-foreground last:border-b-0 hover:bg-muted">{match.label}</button>)}</div>}</div><div className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1">{mapMode === "blackrep" ? <span className="inline-flex items-center gap-1 text-[8px] text-muted-foreground"><i className="h-2 w-2 rounded-full bg-[#7b3ff2]" />Black Representation presence</span> : LEGEND.map(([label, color]) => <span key={label} className="inline-flex items-center gap-1 text-[8px] text-muted-foreground"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}</div></div>
            <div className="absolute inset-x-3 bottom-3 z-10 rounded-md border border-border bg-card/94 px-3 py-2 shadow-sm"><div className="flex items-center gap-2"><span className="font-bold uppercase tracking-[0.09em] text-primary">{chamberInsight.title}</span><span className="text-muted-foreground">•</span><span className="truncate text-[9px] text-muted-foreground">{chamberInsight.summary}</span><Link href={mapMode === "blackrep" ? "/elections?tab=cbc" : "/elections"} className="ml-auto inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold text-primary">More <ArrowUpRight size={10} /></Link></div><div className="mt-1.5 grid grid-cols-4 divide-x divide-border/70 text-center"><MapIntel value={chamberInsight.total} label={mapMode === "blackrep" ? "Profiles" : mapMode === "house" ? "Districts" : "Races"} /><MapIntel value={chamberInsight.tossUps} label={mapMode === "blackrep" ? "Records" : "Toss-up"} /><MapIntel value={chamberInsight.leans} label={mapMode === "blackrep" ? "States" : "Lean"} /><MapIntel value={chamberInsight.calls} label={mapMode === "blackrep" ? "Completed" : "Called"} /></div></div>
          </section>

          <aside className="homepage-atlas-panel flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-background/55 p-3"><h2 className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Daily Intelligence Brief</h2>
            <div className="mt-2 grid grid-cols-[76px_1fr] gap-2.5 border-b border-border pb-2.5"><div className="flex aspect-[0.8] items-end rounded border border-primary/45 bg-[linear-gradient(145deg,var(--secondary),var(--background))] p-2"><div><p className="text-sm font-black leading-[0.8] text-foreground">BLACK<br />POLITICS<br />NOW</p><p className="mt-2 border-t border-primary/70 pt-1 text-[7px] font-bold tracking-[0.1em] text-primary">DAILY BRIEF</p></div></div><div><p className="text-[10px] text-muted-foreground">{latestEpisode?.friendlyDate || (latestEpisode?.date ? `${latestEpisode?.day ?? "Daily Brief"} · ${latestEpisode.date}` : "Today")}</p><h3 className="mt-1 text-base font-bold leading-tight text-foreground">The Daily Intelligence Brief</h3><p className="mt-1.5 text-[10px] text-muted-foreground">{episodesLoading ? "Loading verified briefing" : latestEpisode?.totalDurationLabel ? `${latestEpisode.totalDurationLabel} · Current analysis and context` : "Current analysis and context"}</p></div></div>
            <div className="flex items-center gap-2.5 border-b border-border py-2.5"><button type="button" onClick={() => latestEpisodeHasAudio && play({ url: latestEpisode.fullEpisodeCdnUrl, title: "The Daily Intelligence Brief", episodeDate: latestEpisode.date })} disabled={!latestEpisodeHasAudio} className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"><Play size={14} fill="currentColor" /></button><span className="text-[10px] font-semibold text-foreground">{latestEpisodeHasAudio ? "Play episode" : "Audio preparation"}</span><div className="ml-auto flex h-6 items-center gap-0.5">{[10, 20, 13, 25, 17, 22, 11, 19, 14].map((height, index) => <i key={index} className="w-1 rounded-full bg-primary/55" style={{ height }} />)}</div></div>
            <div className="min-h-0 flex flex-1 flex-col pt-2"><p className="mb-1 shrink-0 text-[8px] font-bold uppercase tracking-[0.15em] text-primary">Episode Segments</p><div className="min-h-0 flex-1 divide-y divide-border/60 overflow-y-auto pr-1 [scrollbar-color:var(--primary)_transparent] [scrollbar-width:thin]">{(segments.length ? segments : [{ label: "Opening Take" }, { label: "Congressional Roundup" }, { label: "State Watch" }, { label: "Global Black Politics" }, { label: "Final Word" }]).map((segment, index) => <div key={index} className="flex gap-2 py-1.5 text-[10px]"><span className="text-primary">▶</span><span className="min-w-0 flex-1 truncate text-foreground/80">{segment.label}</span><span className="text-muted-foreground">{segment.durationLabel ?? "—"}</span></div>)}</div><Link href="/podcast" className="mt-2 inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold text-primary">Open full briefing <ArrowUpRight size={10} /></Link></div>
            <Link href="/world" className="group relative mt-2 h-[clamp(220px,31vh,286px)] shrink-0 overflow-hidden rounded-lg border border-cyan-300/35 bg-[radial-gradient(circle_at_77%_36%,rgba(121,221,255,0.58),transparent_42%),radial-gradient(circle_at_12%_118%,rgba(76,102,230,0.5),transparent_54%),linear-gradient(135deg,#041124,#0a315a_52%,#11213b)] p-3 shadow-[inset_0_0_44px_rgba(94,199,255,0.18)] transition-all hover:border-cyan-200 hover:shadow-[inset_0_0_50px_rgba(94,199,255,0.24)]"><div className="relative z-10 flex h-full max-w-[56%] flex-col justify-end"><div className="flex items-start justify-between gap-2"><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-cyan-50"><Globe2 className="mr-1 inline" size={10} />World Elections</p><span className="rounded border border-cyan-100/30 bg-cyan-100/10 px-1.5 py-0.5 text-[8px] font-bold text-cyan-50">{worldBrief.total}</span></div><h3 className="mt-1 text-[18px] font-bold leading-[1.05] text-white">Democracy is moving.</h3><p className="mt-1 text-[9px] leading-snug text-cyan-100/80">A live field guide to elections, transitions, and civic power beyond U.S. borders.</p><div className="mt-2 grid grid-cols-3 divide-x divide-cyan-100/20 rounded border border-cyan-100/20 bg-slate-950/25 text-center"><WorldStat value={worldBrief.total} label="Tracked" /><WorldStat value={worldBrief.upcomingCount} label="Upcoming" /><WorldStat value={worldBrief.live || "—"} label="Live" /></div>{worldBrief.featured && <p className="mt-1.5 truncate text-[8px] font-semibold text-cyan-50/90">{worldBrief.featuredLabel}: {worldBrief.featured.country} · {shortDate(worldBrief.featured.electionDate)}</p>}</div><div aria-hidden className="absolute inset-y-0 right-0 flex w-[52%] items-center justify-center transition-transform duration-500 group-hover:scale-105"><div className="h-[232px] w-[232px] drop-shadow-[0_0_34px_rgba(110,222,255,0.98)]"><MiniRepositoryGlobe theme={theme} vibrant /></div></div></Link>
          </aside>
        </section>
      </main>

      <Dialog open={stateDetailOpen} onOpenChange={setStateDetailOpen}>
        <DialogContent className="max-h-[82vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>{stateTitle}</DialogTitle></DialogHeader><div className="space-y-2">{selectedRaces.length ? selectedRaces.map((race, index) => mapMode === "blackrep" ? <BlackRepresentationDetail key={`${race.popupType}-${race.id ?? index}`} record={race} /> : <RaceDetail key={race.id ?? index} race={race} mode={mapMode} />) : <p className="rounded border border-border p-3 text-sm text-muted-foreground">No {mapMode === "blackrep" ? "Black Representation profiles or article-backed election records" : mapMode === "house" ? "House races" : mapMode === "governor" ? "Governor race" : "Senate race"} are currently tracked for this state.</p>}</div></DialogContent>
      </Dialog>
    </div>
  );
}

function NewsRow({ post, compact = false }: { post: any; compact?: boolean }) {
  const image = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Politics";
  return <a href={post.link} target="_blank" rel="noopener noreferrer" className={`flex gap-2.5 ${compact ? "py-1.5" : "py-2 first:pt-0 last:pb-1"}`}>
    {!compact && (image ? <img src={image} alt="" className="h-11 w-11 shrink-0 rounded object-cover" /> : <div className="h-11 w-11 shrink-0 rounded bg-muted" />)}
    <div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-primary">{category}</p><p className={`${compact ? "line-clamp-1 text-[9px]" : "mt-0.5 line-clamp-2 text-[11px]"} font-semibold leading-[1.24] text-foreground`} dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }} />{!compact && <p className="mt-1 text-[9px] text-muted-foreground">{post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Latest report"}</p>}</div>
  </a>;
}

function NewsLoadingRows() {
  return <div className="space-y-0">{Array.from({ length: 7 }, (_, index) => <div key={index} className="flex gap-2.5 border-b border-border py-2 first:pt-0"><div className="h-11 w-11 shrink-0 rounded bg-muted/70 animate-pulse" /><div className="min-w-0 flex-1 space-y-1.5 pt-0.5"><div className="h-2 w-16 rounded bg-primary/15" /><div className="h-2.5 w-full rounded bg-muted animate-pulse" /><div className="h-2 w-3/5 rounded bg-muted/80 animate-pulse" /></div></div>)}</div>;
}

function AtlasStat({ value, label }: { value: string | number; label: string }) {
  return <span className="py-1"><strong className="block text-[10px] text-foreground">{value}</strong><small className="text-[7px] uppercase text-muted-foreground">{label}</small></span>;
}

function WorldStat({ value, label }: { value: string | number; label: string }) {
  return <span className="py-1"><strong className="block text-[10px] text-cyan-50">{value}</strong><small className="text-[7px] uppercase tracking-wide text-cyan-100/65">{label}</small></span>;
}

function MapIntel({ value, label }: { value: string | number; label: string }) {
  return <span className="px-1 py-0.5"><strong className="block text-[10px] text-foreground">{value}</strong><small className="text-[7px] uppercase tracking-wide text-muted-foreground">{label}</small></span>;
}

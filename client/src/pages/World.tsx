import { useMemo, useState } from "react";
import { Calendar, ChevronRight, ExternalLink, Globe2, Landmark, Search, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import WorldGlobe from "@/components/WorldGlobe";

const statusTone: Record<string, string> = {
  "Upcoming": "bg-primary/15 text-primary border-primary/30",
  "Voting Today": "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  "Completed": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  "Postponed": "bg-muted text-muted-foreground border-border",
  "Cancelled": "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

const displayDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function parseList(value: string | null | undefined) {
  try {
    const parsed = value ? JSON.parse(value) : [];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return Object.entries(parsed).map(([issue, description]) => ({ issue, description }));
    return [];
  } catch { return []; }
}

const regionByCode: Record<string, string> = {
  DZA: "Africa", ARM: "Europe & Eurasia", BGD: "Asia-Pacific", BIH: "Europe & Eurasia", BGR: "Europe & Eurasia", BRA: "Americas", CPV: "Africa", COL: "Americas", COK: "Pacific", CZE: "Europe & Eurasia", ETH: "Africa", GMB: "Africa", DEU: "Europe & Eurasia", GNB: "Africa", HTI: "Americas", HUN: "Europe & Eurasia", IND: "Asia-Pacific", ISR: "Middle East", JPN: "Asia-Pacific", KAZ: "Asia-Pacific", MAR: "Africa", NIC: "Americas", NZL: "Pacific", NPL: "Asia-Pacific", PSE: "Middle East", PER: "Americas", RUS: "Europe & Eurasia", STP: "Africa", SVK: "Europe & Eurasia", KOR: "Asia-Pacific", SSD: "Africa", CHE: "Europe & Eurasia", SWE: "Europe & Eurasia", TWN: "Asia-Pacific", THA: "Asia-Pacific", GBR: "Europe & Eurasia", USA: "Americas", ZMB: "Africa",
};
const regionOptions = ["All regions", "Africa", "Americas", "Asia-Pacific", "Europe & Eurasia", "Middle East", "Pacific"];
const toSourceLinks = (value: string | null | undefined, notes?: string | null) => {
  const parsed = parseList(value).filter((item) => typeof item === "string");
  const inNotes = ((notes || "").match(/https:\/\/[^\s|)]+/g) || []);
  return Array.from(new Set([...parsed, ...inNotes]));
};

export default function World() {
  const { data: elections = [], isLoading } = trpc.world.elections.useQuery();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [region, setRegion] = useState("All regions");
  const [timeframe, setTimeframe] = useState<"all" | "next30">("all");
  const [selected, setSelected] = useState<any | null>(null);
  const thirtyDayWindow = useMemo(() => {
    const now = new Date();
    const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return { start, end: start + 30 * 24 * 60 * 60 * 1000 };
  }, []);
  const visible = useMemo(() => elections.filter((e: any) => {
    const matchesQuery = `${e.country} ${e.electionName} ${e.electionType}`.toLowerCase().includes(query.toLowerCase());
    const electionMs = Date.parse(`${e.electionDate}T00:00:00Z`);
    const inWindow = timeframe === "all" || (electionMs >= thirtyDayWindow.start && electionMs <= thirtyDayWindow.end);
    const inRegion = region === "All regions" || regionByCode[e.countryCode] === region;
    return matchesQuery && inWindow && inRegion && (filter === "All" || e.status === filter);
  }), [elections, query, filter, region, timeframe, thirtyDayWindow]);
  const counts = useMemo(() => ({
    upcoming: elections.filter((e: any) => e.status === "Upcoming").length,
    live: elections.filter((e: any) => e.status === "Voting Today").length,
    complete: elections.filter((e: any) => e.status === "Completed").length,
  }), [elections]);
  const signals = useMemo(() => elections
    .filter((e: any) => e.status === "Voting Today" || e.status === "Upcoming")
    .sort((a: any, b: any) => a.electionDate.localeCompare(b.electionDate))
    .slice(0, 4), [elections]);
  const lastUpdated = useMemo(() => {
    const latestMs = Math.max(0, ...elections.map((election: any) => {
      const value = election.updatedAt ? new Date(election.updatedAt).getTime() : 0;
      return Number.isFinite(value) ? value : 0;
    }));
    return latestMs ? new Date(latestMs).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  }, [elections]);

  if (isLoading) return <div className="min-h-[70vh] grid place-items-center"><div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_10%,rgba(212,165,82,.16),transparent_27%),radial-gradient(circle_at_80%_0%,rgba(77,118,181,.16),transparent_30%)] pointer-events-none" />
    <section className="relative container pt-10 pb-6">
      <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">Global democratic calendar</p>
      <div className="mt-3"><h1 className="font-display text-4xl sm:text-5xl font-bold">World Elections</h1><p className="text-muted-foreground mt-2 max-w-2xl">Track the elections shaping governments, parliaments, and referendums around the world.</p>{lastUpdated && <p className="mt-2 text-xs font-medium text-primary/85">Calendar data last reviewed {lastUpdated}</p>}</div>
    </section>
    <section className="relative container pb-6">
      <div className="rounded-[2rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_50%_42%,rgba(46,157,206,.18),transparent_32%),linear-gradient(145deg,rgba(7,19,34,.96),rgba(5,10,20,.98))] overflow-hidden shadow-[0_32px_100px_rgba(4,12,24,.46)] relative">
        <WorldGlobe elections={elections} onElectionSelect={setSelected} immersive />
        <div className="absolute left-4 top-4 max-w-[280px] rounded-2xl border border-cyan-100/20 bg-slate-950/60 px-4 py-3 backdrop-blur-md sm:left-7 sm:top-7"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100">Democracy is moving</p><p className="mt-1.5 text-sm leading-relaxed text-cyan-50/85">A beacon of democratic possibility. Select a glowing country marker to see the election, people, and issues shaping its next chapter.</p></div>
        <div className="absolute right-4 top-4 hidden gap-2 sm:flex sm:right-7 sm:top-7"><Stat value={counts.upcoming} label="Upcoming" /><Stat value={counts.live} label="Voting now" /><Stat value={counts.complete} label="Completed" /></div>
        <div className="absolute left-4 bottom-4 rounded-xl border border-cyan-100/15 bg-slate-950/65 backdrop-blur px-3 py-2 text-xs text-cyan-50/80 sm:left-7 sm:bottom-7"><span className="inline-block mr-1.5 w-2 h-2 rounded-full bg-primary" /> Upcoming&nbsp;&nbsp;<span className="inline-block mr-1.5 w-2 h-2 rounded-full bg-emerald-400" /> Completed&nbsp;&nbsp;<span className="inline-block mr-1.5 w-2 h-2 rounded-full bg-amber-400" /> Voting today</div>
      </div>
    </section>
    <section className="relative container pb-14 grid xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
      <div className="self-start rounded-2xl border border-border bg-card/65 p-5"><p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Explore the calendar</p><h2 className="font-display text-2xl font-bold mt-2">Find the democratic moment that matters</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">The globe is the front door. Use the country list to compare election dates, current status, candidates, and the issues each vote puts in motion.</p><div className="mt-5 grid gap-2 sm:grid-cols-2">{signals.map((signal: any) => <button key={signal.id} onClick={() => setSelected(signal)} className="group rounded-xl border border-border bg-background/55 p-3 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"><div className="flex items-center justify-between gap-3"><span className={`border rounded-full px-2 py-0.5 text-[10px] ${statusTone[signal.status] || statusTone.Upcoming}`}>{signal.status === "Voting Today" ? "Live now" : "Next"}</span><span className="text-[11px] text-muted-foreground">{displayDate(signal.electionDate)}</span></div><div className="mt-3 flex items-center gap-2"><img src={`https://flagcdn.com/w40/${signal.countryCode.toLowerCase()}.png`} className="h-6 w-6 rounded-full object-cover" alt=""/><div className="min-w-0"><p className="truncate text-sm font-semibold group-hover:text-primary">{signal.country}</p><p className="truncate text-xs text-muted-foreground">{signal.electionName}</p></div></div></button>)}</div></div>
      <aside className="rounded-2xl border border-border bg-card/80 overflow-hidden flex flex-col max-h-[520px]">
        <div className="p-4 border-b border-border"><div className="relative"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search countries" className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div><div className="flex gap-1 flex-wrap mt-3">{["All", "Upcoming", "Voting Today", "Completed"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`px-2.5 py-1 rounded-md text-xs ${filter === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{item === "Voting Today" ? "Live" : item}</button>)}</div><div className="mt-3 flex items-center gap-2"><button onClick={() => setTimeframe(timeframe === "next30" ? "all" : "next30")} className={`rounded-md border px-2.5 py-1 text-xs ${timeframe === "next30" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>Next 30 days</button><select value={region} onChange={(event) => setRegion(event.target.value)} className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">{regionOptions.map((option) => <option key={option}>{option}</option>)}</select></div></div>
        <div className="overflow-y-auto divide-y divide-border">{visible.map((e: any) => <button key={e.id} onClick={() => setSelected(e)} className="w-full text-left p-4 hover:bg-muted/50 transition-colors"><div className="flex items-start gap-3"><img src={`https://flagcdn.com/w40/${e.countryCode.toLowerCase()}.png`} className="w-7 h-7 rounded-full object-cover mt-0.5" alt="" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="font-medium truncate">{e.country}</span><ChevronRight size={16} className="text-muted-foreground shrink-0" /></div><p className="text-xs text-muted-foreground truncate mt-0.5">{e.electionName}</p><div className="mt-2 flex items-center gap-2"><span className="text-xs text-muted-foreground">{displayDate(e.electionDate)}</span><span className={`border rounded-full px-2 py-0.5 text-[10px] ${statusTone[e.status] || statusTone.Upcoming}`}>{e.status}</span></div></div></div></button>)}</div>
      </aside>
    </section>
    {selected && <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex justify-end" onClick={() => setSelected(null)}><section className="w-full max-w-lg h-full overflow-y-auto bg-background border-l border-border p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between"><div className="flex gap-3"><img src={`https://flagcdn.com/w80/${selected.countryCode.toLowerCase()}.png`} className="w-11 h-11 rounded-full object-cover" alt=""/><div><p className="text-primary text-xs uppercase tracking-widest">{selected.electionType}</p><h2 className="text-2xl font-display font-bold">{selected.country}</h2></div></div><button onClick={() => setSelected(null)} className="p-2 rounded-md hover:bg-muted"><X size={18}/></button></div><div className="mt-6 rounded-xl border border-border bg-card p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{selected.electionName}</h3><p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><Calendar size={14}/>{displayDate(selected.electionDate)}</p></div><span className={`h-fit border rounded-full px-2 py-1 text-xs ${statusTone[selected.status] || statusTone.Upcoming}`}>{selected.status}</span></div>{selected.incumbent && <p className="mt-4 text-sm"><span className="text-muted-foreground">Incumbent:</span> {selected.incumbent}{selected.incumbentParty ? ` (${selected.incumbentParty})` : ""}</p>}{selected.winner && <p className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"><Landmark size={14} className="inline mr-1"/> Winner: <strong>{selected.winner}</strong>{selected.winnerParty ? ` · ${selected.winnerParty}` : ""}</p>}</div><DetailList title="Candidates" items={parseList(selected.candidates)} /><DetailList title="Key issues" items={parseList(selected.keyIssues)} /><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{selected.notes}</p><SourceLinks links={toSourceLinks(selected.sourceUrls, selected.notes)} /></section></div>}
  </div>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-lg border border-border bg-card px-3 py-2 text-center min-w-[74px]"><div className="font-display font-bold text-lg text-primary">{value}</div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div></div>; }
function DetailList({ title, items }: { title: string; items: any[] }) { if (!items?.length) return null; return <div className="mt-5"><h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{title}</h3><div className="space-y-2">{items.map((item: any, index: number) => <div key={index} className="rounded-lg border border-border bg-card px-3 py-2"><p className="text-sm font-medium">{item.name || item.issue}</p><p className="text-xs text-muted-foreground mt-0.5">{item.party || item.description || ""}{item.pct ? ` · ${item.pct}%` : ""}</p></div>)}</div></div>; }
function SourceLinks({ links }: { links: string[] }) { if (!links.length) return null; return <div className="mt-5"><h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Sources</h3><div className="space-y-2">{links.map((link) => { let label = link; try { label = new URL(link).hostname.replace(/^www\./, ""); } catch {} return <a key={link} href={link} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary hover:bg-primary/5"><span className="truncate">{label}</span><ExternalLink size={14} className="shrink-0" /></a>; })}</div></div>; }

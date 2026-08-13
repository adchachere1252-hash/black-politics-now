import { useMemo, useState } from "react";
import { Calendar, ChevronRight, Globe2, Landmark, Search, X } from "lucide-react";
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

export default function World() {
  const { data: elections = [], isLoading } = trpc.world.elections.useQuery();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<any | null>(null);
  const visible = useMemo(() => elections.filter((e: any) => {
    const matchesQuery = `${e.country} ${e.electionName} ${e.electionType}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "All" || e.status === filter);
  }), [elections, query, filter]);
  const counts = useMemo(() => ({
    upcoming: elections.filter((e: any) => e.status === "Upcoming").length,
    live: elections.filter((e: any) => e.status === "Voting Today").length,
    complete: elections.filter((e: any) => e.status === "Completed").length,
  }), [elections]);
  const lastUpdated = useMemo(() => {
    const latest = elections.reduce<string | null>((current: string | null, election: any) => !current || `${election.updatedAt ?? ""}` > current ? `${election.updatedAt ?? ""}` : current, null);
    return latest ? new Date(latest).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
  }, [elections]);

  if (isLoading) return <div className="min-h-[70vh] grid place-items-center"><div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_10%,rgba(212,165,82,.16),transparent_27%),radial-gradient(circle_at_80%_0%,rgba(77,118,181,.16),transparent_30%)] pointer-events-none" />
    <section className="relative container pt-10 pb-6">
      <p className="text-primary text-xs font-semibold tracking-[0.28em] uppercase">Global democratic calendar</p>
      <div className="mt-3 flex flex-col lg:flex-row lg:items-end gap-5 justify-between">
        <div><h1 className="font-display text-4xl sm:text-5xl font-bold">World Elections</h1><p className="text-muted-foreground mt-2 max-w-2xl">Track the elections shaping governments, parliaments, and referendums around the world.</p>{lastUpdated && <p className="mt-2 text-xs font-medium text-primary/85">Calendar data last reviewed {lastUpdated}</p>}</div>
        <div className="flex gap-2"><Stat value={counts.upcoming} label="Upcoming" /><Stat value={counts.live} label="Voting now" /><Stat value={counts.complete} label="Completed" /></div>
      </div>
    </section>
    <section className="relative container pb-14 grid xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
      <div className="rounded-2xl border border-border bg-card/50 overflow-hidden shadow-2xl shadow-black/10 relative">
        <WorldGlobe elections={elections} />
        <div className="absolute left-4 bottom-4 rounded-lg border border-border bg-background/85 backdrop-blur px-3 py-2 text-xs text-muted-foreground"><span className="inline-block mr-1.5 w-2 h-2 rounded-full bg-primary" /> Upcoming&nbsp;&nbsp;<span className="inline-block mr-1.5 w-2 h-2 rounded-full bg-emerald-400" /> Completed&nbsp;&nbsp;<span className="inline-block mr-1.5 w-2 h-2 rounded-full bg-amber-400" /> Voting today</div>
      </div>
      <aside className="rounded-2xl border border-border bg-card/80 overflow-hidden flex flex-col max-h-[520px]">
        <div className="p-4 border-b border-border"><div className="relative"><Search size={15} className="absolute left-3 top-3 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search countries" className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" /></div><div className="flex gap-1 flex-wrap mt-3">{["All", "Upcoming", "Voting Today", "Completed"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`px-2.5 py-1 rounded-md text-xs ${filter === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{item === "Voting Today" ? "Live" : item}</button>)}</div></div>
        <div className="overflow-y-auto divide-y divide-border">{visible.map((e: any) => <button key={e.id} onClick={() => setSelected(e)} className="w-full text-left p-4 hover:bg-muted/50 transition-colors"><div className="flex items-start gap-3"><img src={`https://flagcdn.com/w40/${e.countryCode.toLowerCase()}.png`} className="w-7 h-7 rounded-full object-cover mt-0.5" alt="" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="font-medium truncate">{e.country}</span><ChevronRight size={16} className="text-muted-foreground shrink-0" /></div><p className="text-xs text-muted-foreground truncate mt-0.5">{e.electionName}</p><div className="mt-2 flex items-center gap-2"><span className="text-xs text-muted-foreground">{displayDate(e.electionDate)}</span><span className={`border rounded-full px-2 py-0.5 text-[10px] ${statusTone[e.status] || statusTone.Upcoming}`}>{e.status}</span></div></div></div></button>)}</div>
      </aside>
    </section>
    {selected && <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex justify-end" onClick={() => setSelected(null)}><section className="w-full max-w-lg h-full overflow-y-auto bg-background border-l border-border p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between"><div className="flex gap-3"><img src={`https://flagcdn.com/w80/${selected.countryCode.toLowerCase()}.png`} className="w-11 h-11 rounded-full object-cover" alt=""/><div><p className="text-primary text-xs uppercase tracking-widest">{selected.electionType}</p><h2 className="text-2xl font-display font-bold">{selected.country}</h2></div></div><button onClick={() => setSelected(null)} className="p-2 rounded-md hover:bg-muted"><X size={18}/></button></div><div className="mt-6 rounded-xl border border-border bg-card p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{selected.electionName}</h3><p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><Calendar size={14}/>{displayDate(selected.electionDate)}</p></div><span className={`h-fit border rounded-full px-2 py-1 text-xs ${statusTone[selected.status] || statusTone.Upcoming}`}>{selected.status}</span></div>{selected.incumbent && <p className="mt-4 text-sm"><span className="text-muted-foreground">Incumbent:</span> {selected.incumbent}{selected.incumbentParty ? ` (${selected.incumbentParty})` : ""}</p>}{selected.winner && <p className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"><Landmark size={14} className="inline mr-1"/> Winner: <strong>{selected.winner}</strong>{selected.winnerParty ? ` · ${selected.winnerParty}` : ""}</p>}</div><DetailList title="Candidates" items={parseList(selected.candidates)} /><DetailList title="Key issues" items={parseList(selected.keyIssues)} /><p className="mt-5 text-sm leading-relaxed text-muted-foreground">{selected.notes}</p></section></div>}
  </div>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="rounded-lg border border-border bg-card px-3 py-2 text-center min-w-[74px]"><div className="font-display font-bold text-lg text-primary">{value}</div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div></div>; }
function DetailList({ title, items }: { title: string; items: any[] }) { if (!items?.length) return null; return <div className="mt-5"><h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{title}</h3><div className="space-y-2">{items.map((item: any, index: number) => <div key={index} className="rounded-lg border border-border bg-card px-3 py-2"><p className="text-sm font-medium">{item.name || item.issue}</p><p className="text-xs text-muted-foreground mt-0.5">{item.party || item.description || ""}{item.pct ? ` · ${item.pct}%` : ""}</p></div>)}</div></div>; }

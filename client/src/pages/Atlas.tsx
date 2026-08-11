import { useMemo, useState } from "react";
import { Building2, CalendarDays, Gavel, Layers3, MapPinned, Scale } from "lucide-react";
import { trpc } from "@/lib/trpc";

const SEAT_HISTORY: Record<string, number[]> = {
  Alabama: [8, 7, 7, 7, 7, 7, 7], Alaska: [1, 1, 1, 1, 1, 1, 1], Arizona: [3, 4, 5, 6, 8, 9, 9],
  California: [38, 43, 45, 52, 53, 53, 52], Colorado: [4, 5, 6, 6, 7, 7, 8], Florida: [12, 15, 19, 23, 25, 27, 28],
  Georgia: [10, 10, 10, 11, 13, 14, 14], Louisiana: [8, 8, 8, 7, 7, 6, 6], Maryland: [8, 8, 8, 8, 8, 8, 8],
  Michigan: [19, 19, 18, 16, 15, 14, 13], Missouri: [10, 10, 9, 9, 9, 8, 8], NorthCarolina: [11, 11, 11, 12, 13, 13, 14],
  NewYork: [41, 39, 34, 31, 29, 27, 26], Ohio: [24, 23, 21, 19, 18, 16, 15], Oregon: [4, 4, 5, 5, 5, 5, 6],
  Pennsylvania: [27, 25, 23, 21, 19, 18, 17], SouthCarolina: [6, 6, 6, 6, 6, 7, 7], Tennessee: [9, 8, 9, 9, 9, 9, 9],
  Texas: [23, 24, 27, 30, 32, 36, 38], Virginia: [10, 10, 10, 11, 11, 11, 11], Washington: [7, 7, 8, 9, 9, 10, 10],
  Wisconsin: [10, 9, 9, 9, 8, 8, 8],
};
const YEARS = [1963, 1973, 1983, 1993, 2003, 2013, 2023];
const keyFor = (name: string) => name.replace(/\s/g, "");

export default function Atlas() {
  const { data: states = [], isLoading } = trpc.election.redistricting.useQuery();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selected = useMemo(() => states.find((state: any) => state.stateCode === selectedCode) ?? states[0], [states, selectedCode]);
  const history = selected ? SEAT_HISTORY[keyFor(selected.stateName)] ?? [1, 1, 1, 1, 1, 1, 1] : [];
  const enacted = states.filter((state: any) => state.enacted).length;
  const litigation = states.filter((state: any) => state.litigationNotes).length;

  if (isLoading) return <div className="min-h-[70vh] grid place-items-center"><div className="w-9 h-9 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  return <div className="min-h-screen bg-background text-foreground">
    <section className="border-b border-border bg-[radial-gradient(circle_at_85%_0%,rgba(212,165,82,.14),transparent_33%)]"><div className="container py-10"><p className="text-primary text-xs uppercase tracking-[0.28em] font-semibold">Congressional geography · 1963–present</p><h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Historical Atlas</h1><p className="text-muted-foreground mt-3 max-w-2xl">Explore how congressional apportionment and redistricting shape representation across the United States.</p><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7 max-w-3xl"><Metric value={states.length} label="States tracked" icon={MapPinned}/><Metric value={enacted} label="Maps enacted" icon={Layers3}/><Metric value={litigation} label="With litigation" icon={Gavel}/><Metric value="1963–2025" label="Historical span" icon={CalendarDays}/></div></div></section>
    <section className="container py-8 grid xl:grid-cols-[270px_minmax(0,1fr)] gap-6">
      <aside className="rounded-2xl border border-border bg-card overflow-hidden h-fit"><div className="p-4 border-b border-border"><p className="font-semibold">Tracked states</p><p className="text-xs text-muted-foreground mt-1">Select a state for its congressional-map context.</p></div><div className="max-h-[580px] overflow-y-auto divide-y divide-border">{states.map((state: any) => <button onClick={() => setSelectedCode(state.stateCode)} key={state.stateCode} className={`w-full p-3 text-left flex items-center justify-between transition-colors ${selected?.stateCode === state.stateCode ? "bg-primary/10 text-primary" : "hover:bg-muted/60"}`}><span className="text-sm font-medium">{state.stateName}</span><span className="text-[10px] rounded-full border border-border px-2 py-0.5 text-muted-foreground">{state.status || "Monitoring"}</span></button>)}</div></aside>
      {selected && <main className="space-y-6"><div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex flex-col sm:flex-row justify-between gap-4"><div><p className="text-primary text-xs tracking-[.18em] uppercase">{selected.stateCode} historical record</p><h2 className="font-display text-3xl font-bold mt-2">{selected.stateName}</h2><p className="text-muted-foreground mt-2 max-w-2xl">{selected.reason || "Congressional map history and current redistricting context."}</p></div><div className="rounded-xl border border-border bg-background p-3 h-fit text-sm"><span className="text-muted-foreground block text-xs">Current status</span><strong>{selected.status || "Monitoring"}</strong></div></div><div className="grid md:grid-cols-3 gap-3 mt-6"><Info label="Method" value={selected.method || "Not specified"} icon={Scale}/><Info label="Delegation before" value={selected.delegationBefore || "See atlas history"} icon={Building2}/><Info label="Projected impact" value={selected.projectedImpact || "Under review"} icon={Layers3}/></div></div>
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex justify-between items-end"><div><h3 className="font-display text-xl font-bold">Apportionment history</h3><p className="text-sm text-muted-foreground mt-1">House seats following each decennial redistricting cycle.</p></div><span className="text-primary font-display text-2xl font-bold">{history[history.length - 1]}</span></div><SeatChart values={history}/><div className="grid grid-cols-7 gap-1 mt-2 text-[10px] text-muted-foreground text-center">{YEARS.map((year) => <span key={year}>{year}</span>)}</div></div>
        <div className="grid lg:grid-cols-2 gap-6"><div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-display text-xl font-bold">Current delegation grid</h3><p className="text-sm text-muted-foreground mt-1">A compact district index for the current apportionment—not a substitute for the legal district boundary file.</p><div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mt-5">{Array.from({ length: history.at(-1) || 1 }).map((_, index) => <div key={index} className="aspect-square rounded-md border border-primary/25 bg-primary/10 grid place-items-center text-xs font-semibold text-primary">{index + 1}</div>)}</div></div><div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-display text-xl font-bold">Redistricting notes</h3><p className="text-sm text-muted-foreground mt-3 leading-relaxed">{selected.litigationNotes || "No litigation notes are currently tracked for this state."}</p><p className="text-sm text-muted-foreground mt-4 leading-relaxed">{selected.reason || "No additional map-change rationale is currently recorded."}</p></div></div>
      </main>}
    </section>
  </div>;
}

function Metric({ value, label, icon: Icon }: { value: string | number; label: string; icon: any }) { return <div className="rounded-xl border border-border bg-card/80 px-4 py-3"><Icon size={16} className="text-primary mb-2"/><div className="font-display text-xl font-bold">{value}</div><div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div></div>; }
function Info({ label, value, icon: Icon }: { label: string; value: string; icon: any }) { return <div className="rounded-lg border border-border bg-background p-3"><Icon size={15} className="text-primary mb-2"/><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="text-sm font-medium mt-1">{value}</p></div>; }
function SeatChart({ values }: { values: number[] }) { const max = Math.max(...values, 1); return <div className="h-52 mt-6 flex items-end gap-2">{values.map((value, index) => <div key={index} className="flex-1 h-full flex flex-col justify-end"><span className="text-xs text-center text-muted-foreground mb-1">{value}</span><div className="rounded-t-md bg-primary/75 min-h-2 transition-all" style={{ height: `${Math.max(8, (value / max) * 100)}%` }} /></div>)}</div>; }

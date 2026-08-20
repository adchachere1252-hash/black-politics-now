import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Search, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function CandidateChangesTab({ onManageGovernor }: { onManageGovernor: (location: string) => void }) {
  const [search, setSearch] = useState("");
  const { data: governors = [] } = trpc.election.governors.useQuery(undefined, { refetchInterval: 60_000 });
  const filtered = useMemo(() => (governors as any[]).filter((race) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return race.stateName?.toLowerCase().includes(query) || race.demCandidate?.toLowerCase().includes(query) || race.repCandidate?.toLowerCase().includes(query);
  }), [governors, search]);
  const florida = (governors as any[]).find((race) => race.stateCode === "FL");

  return <div className="space-y-5">
    <section className="glass-card rounded-xl p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Candidate management</p>
      <h2 className="mt-1 text-xl font-bold">Change candidates</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">This is the direct workspace for updating a Governor contest’s Democratic and Republican candidates. Every change requires a source label and valid source URL, and is preserved in the protected audit history before it appears on the public Governor record.</p>
      {florida && <div className="mt-4 flex flex-col gap-3 rounded-xl border border-primary/35 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Florida Governor · ready to manage</p><p className="mt-1 text-sm font-semibold">David Jolly (D) <span className="text-muted-foreground">vs.</span> Byron Donalds (R)</p><p className="mt-1 text-xs text-muted-foreground">{florida.candidateSourceLabel || "Source required before public save"}</p></div><button onClick={() => onManageGovernor("Florida Governor")} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"><MapPin size={14} /> Manage Florida candidates</button></div>}
    </section>
    <section className="glass-card rounded-xl p-5">
      <div className="relative max-w-md"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a Governor contest or candidate..." className="w-full rounded-lg bg-muted py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">{filtered.map((race) => <article key={race.id} className="rounded-xl border border-border bg-background/60 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{race.stateName} Governor</p><p className="mt-1 text-sm font-bold">{race.demCandidate || "Democratic candidate not recorded"} <span className="text-muted-foreground">vs.</span> {race.repCandidate || "Republican candidate not recorded"}</p><p className="mt-2 text-xs text-muted-foreground">{race.candidateSourceLabel || "No source package yet"}</p></div><button onClick={() => onManageGovernor(`${race.stateName} Governor`)} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/40 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5"><ShieldCheck size={13} /> Manage</button></div>{race.candidateSourceUrl && <a className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" href={race.candidateSourceUrl} target="_blank" rel="noreferrer">Review source <ExternalLink size={12} /></a>}</article>)}{filtered.length === 0 && <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground lg:col-span-2">No Governor contest matches that search.</p>}</div>
    </section>
  </div>;
}

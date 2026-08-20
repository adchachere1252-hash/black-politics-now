import { useMemo, useState } from "react";
import { Check, ExternalLink, MapPin, Save, Search, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

type RaceType = "senate" | "house" | "governor";
type Party = "D" | "R" | "I" | "L" | "G";

const PARTY_LABELS: Record<Party, string> = {
  D: "Democratic",
  R: "Republican",
  I: "Independent",
  L: "Libertarian",
  G: "Green",
};

function RaceCandidateLogEditor({ race, type, onClose }: { race: any; type: "senate" | "house"; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [candidate1Name, setCandidate1Name] = useState(race.candidate1Name ?? "");
  const [candidate1Party, setCandidate1Party] = useState<Party>(race.candidate1Party ?? "D");
  const [candidate2Name, setCandidate2Name] = useState(race.candidate2Name ?? "");
  const [candidate2Party, setCandidate2Party] = useState<Party>(race.candidate2Party ?? "R");
  const [sourceUrl, setSourceUrl] = useState(race.candidateSourceUrl ?? "");
  const [sourceLabel, setSourceLabel] = useState(race.candidateSourceLabel ?? "");
  const [editorNote, setEditorNote] = useState("");
  const [error, setError] = useState("");
  const historyQuery = type === "senate"
    ? trpc.election.senateCandidateHistory.useQuery({ id: race.id })
    : trpc.election.houseCandidateHistory.useQuery({ id: race.id });
  const saveSenate = trpc.election.updateSenateCandidateLog.useMutation({
    onSuccess: async () => { await Promise.all([utils.election.senate.invalidate(), utils.election.senateCandidateHistory.invalidate({ id: race.id })]); setEditorNote(""); setError(""); },
    onError: (mutationError) => setError(mutationError.message || "Candidate log could not be saved."),
  });
  const saveHouse = trpc.election.updateHouseCandidateLog.useMutation({
    onSuccess: async () => { await Promise.all([utils.election.house.invalidate(), utils.election.houseCandidateHistory.invalidate({ id: race.id })]); setEditorNote(""); setError(""); },
    onError: (mutationError) => setError(mutationError.message || "Candidate log could not be saved."),
  });
  const saving = saveSenate.isPending || saveHouse.isPending;
  const history = historyQuery.data ?? [];

  const save = () => {
    if (!candidate1Name.trim() || !candidate2Name.trim() || !sourceUrl.trim() || !sourceLabel.trim()) {
      setError("Both ballot candidates, their parties, a source label, and a source URL are required.");
      return;
    }
    try {
      const verifiedUrl = new URL(sourceUrl.trim());
      if (!/^https?:$/.test(verifiedUrl.protocol)) throw new Error("Unsupported protocol");
      const input = { id: race.id, candidate1Name: candidate1Name.trim(), candidate1Party, candidate2Name: candidate2Name.trim(), candidate2Party, candidateSourceUrl: verifiedUrl.toString(), candidateSourceLabel: sourceLabel.trim(), editorNote: editorNote.trim() || null };
      if (type === "senate") saveSenate.mutate(input);
      else saveHouse.mutate(input);
    } catch {
      setError("Enter a valid HTTPS or HTTP source URL before saving the candidate log.");
    }
  };

  const contestLabel = type === "house" ? `${race.stateName} · ${race.districtLabel}` : `${race.stateName} Senate`;
  return <section className="mt-3 rounded-xl border border-primary/30 bg-primary/[0.045] p-3" aria-label={`${contestLabel} candidate log`}>
    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Manual general-election candidate log</p><p className="mt-1 text-xs text-muted-foreground">This updates the public {type === "house" ? "House" : "Senate"} contest and records an immutable private source-backed change history. It never calls a winner or changes results.</p></div><button type="button" onClick={onClose} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close</button></div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <label className="text-xs font-semibold text-muted-foreground">Candidate one<div className="mt-1 flex gap-2"><input value={candidate1Name} onChange={(event) => setCandidate1Name(event.target.value)} placeholder="Candidate name" className="h-9 min-w-0 flex-1 rounded border border-border bg-background px-2 text-sm text-foreground" /><select aria-label="Candidate one party" value={candidate1Party} onChange={(event) => setCandidate1Party(event.target.value as Party)} className="h-9 rounded border border-border bg-background px-2 text-xs text-foreground">{(Object.keys(PARTY_LABELS) as Party[]).map((party) => <option key={party} value={party}>{party}</option>)}</select></div></label>
      <label className="text-xs font-semibold text-muted-foreground">Candidate two<div className="mt-1 flex gap-2"><input value={candidate2Name} onChange={(event) => setCandidate2Name(event.target.value)} placeholder="Candidate name" className="h-9 min-w-0 flex-1 rounded border border-border bg-background px-2 text-sm text-foreground" /><select aria-label="Candidate two party" value={candidate2Party} onChange={(event) => setCandidate2Party(event.target.value as Party)} className="h-9 rounded border border-border bg-background px-2 text-xs text-foreground">{(Object.keys(PARTY_LABELS) as Party[]).map((party) => <option key={party} value={party}>{party}</option>)}</select></div></label>
    </div>
    <div className="mt-2 grid gap-2 sm:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Source label<input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} placeholder="Official filing or reporting outlet" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Source URL<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://…" type="url" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label></div>
    <label className="mt-2 block text-xs font-semibold text-muted-foreground">Editor note (private audit context)<textarea value={editorNote} onChange={(event) => setEditorNote(event.target.value)} placeholder="Why this candidate log changed" className="mt-1 min-h-16 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label>
    <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving ? "Saving candidate log…" : <><Save size={13} /> Save candidate log</>}</button>{race.candidateSourceUrl && <a href={race.candidateSourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4">Current public source <ExternalLink size={12} /></a>}{error && <span className="text-xs text-destructive">{error}</span>}</div>
    {history.length > 0 && <div className="mt-3 border-t border-primary/15 pt-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Recent private change history</p><div className="mt-2 space-y-1.5">{history.slice(0, 3).map((item: any) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span><strong className="text-foreground">{item.candidate1Name || "—"}</strong> ({item.candidate1Party || "?"}) vs <strong className="text-foreground">{item.candidate2Name || "—"}</strong> ({item.candidate2Party || "?"})</span><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{item.sourceLabel}</a></div>)}</div></div>}
  </section>;
}

function CandidateRaceCard({ race, type, onManageGovernor }: { race: any; type: RaceType; onManageGovernor: (location: string) => void }) {
  const [open, setOpen] = useState(false);
  const isGovernor = type === "governor";
  const title = isGovernor ? `${race.stateName} Governor` : type === "house" ? `${race.stateName} · ${race.districtLabel}` : `${race.stateName} Senate`;
  const candidateOne = isGovernor ? race.demCandidate : race.candidate1Name;
  const candidateTwo = isGovernor ? race.repCandidate : race.candidate2Name;
  const oneParty = isGovernor ? "D" : race.candidate1Party;
  const twoParty = isGovernor ? "R" : race.candidate2Party;
  return <article className="rounded-xl border border-border bg-background/60 p-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">{title}</p><p className="mt-1 text-sm font-bold">{candidateOne || "Candidate one not recorded"} <span className="text-muted-foreground">({oneParty || "?"}) vs.</span> {candidateTwo || "Candidate two not recorded"} <span className="text-muted-foreground">({twoParty || "?"})</span></p><p className="mt-2 text-xs text-muted-foreground">{race.candidateSourceLabel || "No source package yet"}</p></div><button onClick={() => isGovernor ? onManageGovernor(`${race.stateName} Governor`) : setOpen((value) => !value)} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-primary/40 px-2.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/5"><ShieldCheck size={13} /> {isGovernor ? "Manage" : open ? "Close" : "Manage"}</button></div>
    {race.candidateSourceUrl && <a className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline" href={race.candidateSourceUrl} target="_blank" rel="noreferrer">Review source <ExternalLink size={12} /></a>}
    {open && !isGovernor && <RaceCandidateLogEditor race={race} type={type} onClose={() => setOpen(false)} />}
  </article>;
}

export function CandidateChangesTab({ onManageGovernor }: { onManageGovernor: (location: string) => void }) {
  const [search, setSearch] = useState("");
  const [raceType, setRaceType] = useState<RaceType>("governor");
  const { data: governors = [] } = trpc.election.governors.useQuery(undefined, { refetchInterval: 60_000 });
  const { data: senate = [] } = trpc.election.senate.useQuery(undefined, { refetchInterval: 60_000 });
  const { data: house = [] } = trpc.election.house.useQuery(undefined, { refetchInterval: 60_000 });
  const races = raceType === "governor" ? governors as any[] : raceType === "senate" ? senate as any[] : house as any[];
  const filtered = useMemo(() => races.filter((race) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const contest = raceType === "house" ? `${race.stateName} ${race.districtLabel}` : race.stateName;
    return contest.toLowerCase().includes(query) || race.candidate1Name?.toLowerCase().includes(query) || race.candidate2Name?.toLowerCase().includes(query) || race.demCandidate?.toLowerCase().includes(query) || race.repCandidate?.toLowerCase().includes(query);
  }), [races, raceType, search]);
  const florida = (governors as any[]).find((race) => race.stateCode === "FL");
  const heading = raceType === "governor" ? "Governor contests" : raceType === "senate" ? "Senate contests" : "House contests";

  return <div className="space-y-5">
    <section className="glass-card rounded-xl p-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Candidate management</p><h2 className="mt-1 text-xl font-bold">Change candidates</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Manage Senate, House, and Governor general-election candidate records from one protected workspace. Every public change requires a source label, valid source URL, and immutable private audit entry; these forms never call winners or alter vote totals.</p>{florida && <div className="mt-4 flex flex-col gap-3 rounded-xl border border-primary/35 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Florida Governor · ready to manage</p><p className="mt-1 text-sm font-semibold">David Jolly (D) <span className="text-muted-foreground">vs.</span> Byron Donalds (R)</p><p className="mt-1 text-xs text-muted-foreground">{florida.candidateSourceLabel || "Source required before public save"}</p></div><button onClick={() => onManageGovernor("Florida Governor")} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"><MapPin size={14} /> Manage Florida candidates</button></div>}</section>
    <section className="glass-card rounded-xl p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-1 rounded-lg bg-muted p-1">{(["governor", "senate", "house"] as RaceType[]).map((type) => <button key={type} onClick={() => setRaceType(type)} className={`rounded-md px-3 py-1.5 text-xs font-bold capitalize ${raceType === type ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>{type}</button>)}</div><div className="relative w-full sm:max-w-md"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${heading.toLowerCase()} or candidate…`} className="w-full rounded-lg bg-muted py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div></div><p className="mt-4 text-xs font-semibold text-muted-foreground">{heading} · {filtered.length} shown</p><div className="mt-3 grid gap-3 lg:grid-cols-2">{filtered.map((race: any) => <CandidateRaceCard key={`${raceType}-${race.id}`} race={race} type={raceType} onManageGovernor={onManageGovernor} />)}{filtered.length === 0 && <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground lg:col-span-2">No {heading.toLowerCase()} match that search.</p>}</div></section>
  </div>;
}

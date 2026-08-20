import { useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Play, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

const EMPTY_NOTE = { id: undefined as number | undefined, stateCode: "AL", congress: 119, title: "", body: "", sourceLabel: "", sourceUrl: "" };

export function AtlasOperationsAdmin() {
  const healthQuery = trpc.atlasOperations.health.useQuery(undefined, { refetchInterval: 60_000 });
  const notesQuery = trpc.atlasOperations.notes.useQuery();
  const [note, setNote] = useState(EMPTY_NOTE);
  const [notice, setNotice] = useState<string | null>(null);
  const [completedPlayback, setCompletedPlayback] = useState<{ auditId: number | null; status: "passed" | "failed"; checkedAt: Date; summary: string } | null>(null);
  const playbackCheck = trpc.atlasOperations.runPlaybackCheck.useMutation({
    onSuccess: async (result) => {
      await healthQuery.refetch();
      setCompletedPlayback({ auditId: result.audit?.id ?? null, status: result.status, checkedAt: new Date(), summary: result.summary });
      setNotice(result.status === "passed" ? "Playback check completed and the durable audit history has refreshed." : "Playback check completed with an issue requiring review.");
    },
    onError: (error) => setNotice(`Playback check could not run: ${error.message}`),
  });
  const saveNote = trpc.atlasOperations.saveNote.useMutation({
    onSuccess: (saved) => {
      setNotice(`Saved ${saved.stateCode} · ${saved.congress}th Congress as a private draft.`);
      setNote({ id: saved.id, stateCode: saved.stateCode, congress: saved.congress, title: saved.title, body: saved.body, sourceLabel: saved.sourceLabel, sourceUrl: saved.sourceUrl });
      notesQuery.refetch();
    },
    onError: (error) => setNotice(`Note could not be saved: ${error.message}`),
  });
  const setApproval = trpc.atlasOperations.setNoteApproval.useMutation({
    onSuccess: (saved) => {
      setNotice(saved.status === "approved" ? "Note approved for its matching public Atlas record." : "Note returned to private draft status.");
      notesQuery.refetch();
    },
    onError: (error) => setNotice(`Review action could not be completed: ${error.message}`),
  });

  const health = healthQuery.data?.health ?? [];
  const readyFrames = health.filter((frame) => frame.ready).length;
  const latestAudit = healthQuery.data?.recentAudits?.[0];
  const notes = notesQuery.data ?? [];
  const busy = playbackCheck.isPending || saveNote.isPending || setApproval.isPending;

  const editNote = (item: typeof notes[number]) => setNote({ id: item.id, stateCode: item.stateCode, congress: item.congress, title: item.title, body: item.body, sourceLabel: item.sourceLabel, sourceUrl: item.sourceUrl });
  const saveCurrentNote = () => saveNote.mutate({ ...note, stateCode: note.stateCode.trim().toUpperCase() });

  return <section className="glass-card rounded-xl p-5" aria-labelledby="atlas-operations-heading">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Protected operations</p><h3 id="atlas-operations-heading" className="mt-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><ShieldCheck size={16} className="text-primary" /> Atlas Operations</h3><p className="mt-1 max-w-xl text-xs text-muted-foreground">Monitor and annotate the Atlas without modifying UCLA geometry, Census apportionment, or Voteview roster records.</p></div>
      <button type="button" onClick={() => playbackCheck.mutate()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"><Play size={14} fill="currentColor" /> {playbackCheck.isPending ? "Checking…" : "Run playback check"}</button>
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-3"><AtlasOpsMetric value={`${readyFrames}/31`} label="ready Congress frames" good={readyFrames === 31} /><AtlasOpsMetric value={health.every((frame) => frame.stateCount === 50) ? "50/50" : "Review"} label="states per frame" good={health.length > 0 && health.every((frame) => frame.stateCount === 50)} /><AtlasOpsMetric value={latestAudit?.status === "passed" ? "Passed" : latestAudit ? "Review" : "Not run"} label="latest playback check" good={latestAudit?.status === "passed"} /></div>

    <div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground"><p><strong className="text-foreground">Source boundaries:</strong> UCLA district geometry · Census apportionment totals · Voteview House roster overlay.</p><p className="mt-1"><strong className="text-foreground">Latest result:</strong> {latestAudit?.summary ?? "No durable Admin playback check has been recorded yet."}</p>{latestAudit?.createdAt && <p className="mt-1"><strong className="text-foreground">Last checked:</strong> {new Date(latestAudit.createdAt).toLocaleString()} · audit #{latestAudit.id}</p>}</div>
    {completedPlayback && <div className={`mt-3 rounded-lg border p-3 text-xs ${completedPlayback.status === "passed" ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-amber-500/35 bg-amber-500/[0.07]"}`} role="status" aria-live="polite"><div className="flex items-start gap-2"><span className={completedPlayback.status === "passed" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}>{completedPlayback.status === "passed" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}</span><div><p className="font-bold text-foreground">Playback check {completedPlayback.status === "passed" ? "passed" : "needs review"}{completedPlayback.auditId ? ` · audit #${completedPlayback.auditId}` : ""}</p><p className="mt-1 text-muted-foreground">{completedPlayback.summary}</p><p className="mt-1 text-[10px] text-muted-foreground">Completed {completedPlayback.checkedAt.toLocaleString()}</p></div></div></div>}
    {notice && <div className="mt-3 flex items-start justify-between gap-3 rounded-lg border border-primary/25 bg-primary/[0.05] px-3 py-2 text-xs text-muted-foreground"><span>{notice}</span><button type="button" onClick={() => setNotice(null)} className="font-bold text-primary">Dismiss</button></div>}

    <details className="mt-4 rounded-lg border border-border/70 bg-background/40 p-3"><summary className="cursor-pointer text-xs font-bold text-foreground">Frame health · {readyFrames}/31 ready</summary><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{health.map((frame) => <div key={frame.congress} className={`rounded-md border px-2.5 py-2 text-xs ${frame.ready ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-amber-500/30 bg-amber-500/[0.05]"}`}><div className="flex items-center justify-between gap-2"><strong>{frame.congress}th</strong><span className={`text-[10px] font-bold uppercase ${frame.ready ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{frame.ready ? "Ready" : "Review"}</span></div><p className="mt-1 text-[10px] text-muted-foreground">{frame.stateCount}/50 states · {frame.uniqueBoundaryFiles} files · {frame.assetRegistered ? "asset registered" : "asset missing"}</p></div>)}</div></details>

    <div className="mt-6 border-t border-border pt-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h4 className="flex items-center gap-2 text-sm font-bold"><FileText size={15} className="text-primary" /> Editor-approved historical notes</h4><p className="mt-1 max-w-xl text-xs text-muted-foreground">Drafts stay private. Approval publishes the note only to its matching state and Congress record, with the named source link retained.</p></div><button type="button" onClick={() => setNote(EMPTY_NOTE)} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"><RefreshCw size={13} /> New note</button></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[90px_120px_minmax(0,1fr)]"><label className="text-xs font-semibold text-muted-foreground">State<input value={note.stateCode} maxLength={2} onChange={(event) => setNote((current) => ({ ...current, stateCode: event.target.value.toUpperCase() }))} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Congress<input type="number" min={89} max={119} value={note.congress} onChange={(event) => setNote((current) => ({ ...current, congress: Number(event.target.value) }))} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Title<input value={note.title} maxLength={200} onChange={(event) => setNote((current) => ({ ...current, title: event.target.value }))} placeholder="Concise historical context" className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" /></label></div>
      <label className="mt-3 block text-xs font-semibold text-muted-foreground">Editor note<textarea value={note.body} maxLength={5000} onChange={(event) => setNote((current) => ({ ...current, body: event.target.value }))} placeholder="Write sourced historical context. Do not restate or alter the underlying source geometry." className="mt-1 min-h-28 w-full rounded-md border border-border bg-background p-2 text-sm text-foreground" /></label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Source label<input value={note.sourceLabel} maxLength={160} onChange={(event) => setNote((current) => ({ ...current, sourceLabel: event.target.value }))} placeholder="Source organization or record" className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Source URL<input type="url" value={note.sourceUrl} onChange={(event) => setNote((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="https://…" className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground" /></label></div>
      <div className="mt-3 flex flex-wrap justify-between gap-3"><p className="text-[11px] text-muted-foreground">Saving any revision returns an approved note to draft for a fresh editorial decision.</p><button type="button" onClick={saveCurrentNote} disabled={busy || !/^[A-Z]{2}$/.test(note.stateCode) || note.congress < 89 || note.congress > 119 || note.title.trim().length < 4 || note.body.trim().length < 20 || note.sourceLabel.trim().length < 2 || !/^https?:\/\//i.test(note.sourceUrl)} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"><Save size={13} /> {saveNote.isPending ? "Saving…" : note.id ? "Save revision" : "Save draft"}</button></div>
      <div className="mt-5 space-y-2">{notes.length ? notes.map((item) => <div key={item.id} className="rounded-lg border border-border/70 bg-background/50 p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.status === "approved" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>{item.status}</span><span className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{item.stateCode} · {item.congress}th Congress</span></div><p className="mt-1 truncate text-sm font-semibold text-foreground">{item.title}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.body}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4">{item.sourceLabel} <ExternalLink size={12} /></a></div><div className="flex shrink-0 flex-wrap gap-2"><button type="button" onClick={() => editNote(item)} className="rounded border border-border px-2 py-1 text-xs font-semibold text-foreground hover:bg-muted">Edit</button><button type="button" onClick={() => setApproval.mutate({ id: item.id, approved: item.status !== "approved" })} disabled={busy} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold disabled:opacity-50 ${item.status === "approved" ? "border border-amber-500/35 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>{item.status === "approved" ? "Return to draft" : <><CheckCircle2 size={12} /> Approve</>}</button></div></div><p className="mt-2 text-[10px] text-muted-foreground">Created by {item.createdBy} · updated {new Date(item.updatedAt).toLocaleString()}{item.status === "approved" && item.approvedBy ? ` · approved by ${item.approvedBy}` : ""}</p></div>) : <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No historical notes yet. Use the form to create a source-linked draft; nothing appears publicly until you approve it.</p>}</div>
    </div>
  </section>;
}

function AtlasOpsMetric({ value, label, good }: { value: string; label: string; good: boolean }) {
  return <div className={`rounded-lg border p-3 ${good ? "border-emerald-500/25 bg-emerald-500/[0.04]" : "border-border bg-background/50"}`}><p className="text-lg font-bold text-foreground">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-muted-foreground">{label}</p></div>;
}

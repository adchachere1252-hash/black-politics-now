import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, ListTodo, RefreshCw, Sparkles, UserRound, XCircle, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

const statusIcon = {
  pending: Clock3,
  approved: CheckCircle2,
  dismissed: XCircle,
  deferred: Clock3,
} as const;

const recommendationStatuses = ["all", "pending", "approved", "deferred", "dismissed"] as const;
const recommendationCategories = ["all", "data_quality", "editorial", "coverage_gap", "source_watch", "product"] as const;
const recommendationPriorities = ["all", "high", "medium", "low"] as const;
const taskStatuses = ["open", "in_progress", "blocked", "completed"] as const;

function parseEvidence(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function label(value: string) {
  return value.replace(/_/g, " ");
}

export function AgentDeskTab() {
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<(typeof recommendationStatuses)[number]>("pending");
  const [category, setCategory] = useState<(typeof recommendationCategories)[number]>("all");
  const [priority, setPriority] = useState<(typeof recommendationPriorities)[number]>("all");
  const [owner, setOwner] = useState("");
  const [ownerDrafts, setOwnerDrafts] = useState<Record<number, string>>({});
  const [dueDateDrafts, setDueDateDrafts] = useState<Record<number, string>>({});
  const [editorialOwner, setEditorialOwner] = useState("");
  const [dataQualityOwner, setDataQualityOwner] = useState("");
  const [priorityHours, setPriorityHours] = useState("8");
  const filters = useMemo(() => ({
    ...(status !== "all" ? { status } : {}),
    ...(category !== "all" ? { category } : {}),
    ...(priority !== "all" ? { priority } : {}),
    ...(owner.trim() ? { owner: owner.trim() } : {}),
  }), [status, category, priority, owner]);
  const invalidateDesk = () => {
    utils.agent.recommendations.invalidate();
    utils.agent.runs.invalidate();
    utils.agent.settings.invalidate();
    utils.agent.tasks.invalidate();
  };
  const { data: recommendations = [] } = trpc.agent.recommendations.useQuery(filters);
  const { data: runs = [] } = trpc.agent.runs.useQuery();
  const { data: settings } = trpc.agent.settings.useQuery();
  const { data: tasks = [] } = trpc.agent.tasks.useQuery();
  const runNow = trpc.agent.runNow.useMutation({ onSuccess: invalidateDesk });
  const review = trpc.agent.reviewRecommendation.useMutation({ onSuccess: invalidateDesk });
  const assign = trpc.agent.assignRecommendation.useMutation({ onSuccess: invalidateDesk });
  const approveToTask = trpc.agent.approveToTask.useMutation({ onSuccess: invalidateDesk });
  const updateTask = trpc.agent.updateTask.useMutation({ onSuccess: invalidateDesk });
  const setDefaultOwners = trpc.agent.setDefaultOwners.useMutation({ onSuccess: invalidateDesk });
  const priorityMode = trpc.agent.setPriorityMode.useMutation({ onSuccess: invalidateDesk });
  const pending = (recommendations as any[]).filter((item) => item.status === "pending");
  const priorityActive = Boolean(settings?.priorityModeEnabled && settings?.priorityModeExpiresAt && new Date(settings.priorityModeExpiresAt).getTime() > Date.now());

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary"><Sparkles size={18} /><h2 className="font-bold">Autonomous Research Desk</h2></div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              The agent reviews current platform context and creates cited recommendations only. It cannot publish stories, alter election records, or send public alerts.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Routine cadence: every {settings?.researchIntervalHours ?? 4} hours. Last run: {settings?.lastRunAt ? new Date(settings.lastRunAt).toLocaleString() : "not yet run"}.</p>
          </div>
          <button onClick={() => runNow.mutate()} disabled={runNow.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            <RefreshCw size={15} className={runNow.isPending ? "animate-spin" : ""} /> {runNow.isPending ? "Researching…" : "Run research now"}
          </button>
        </div>
        {runNow.error && <p className="mt-3 text-sm text-destructive">The run did not complete. No public content or election data was changed.</p>}
        <div className="mt-4 grid gap-2 border-t border-primary/15 pt-4 sm:grid-cols-[1fr_1fr_auto]">
          <input value={editorialOwner || settings?.defaultEditorialOwner || ""} onChange={(event) => setEditorialOwner(event.target.value)} placeholder="Editorial default owner" className="rounded-md border border-border bg-background px-3 py-2 text-xs" />
          <input value={dataQualityOwner || settings?.defaultDataQualityOwner || ""} onChange={(event) => setDataQualityOwner(event.target.value)} placeholder="Data-quality default owner" className="rounded-md border border-border bg-background px-3 py-2 text-xs" />
          <button onClick={() => setDefaultOwners.mutate({ editorialOwner: editorialOwner || settings?.defaultEditorialOwner || "Editorial Desk", dataQualityOwner: dataQualityOwner || settings?.defaultDataQualityOwner || "Data Desk" })} disabled={setDefaultOwners.isPending} className="rounded-md bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">{setDefaultOwners.isPending ? "Saving…" : "Save defaults"}</button>
        </div>
      </section>

      <section className={`rounded-xl border p-5 ${priorityActive ? "border-amber-500/45 bg-amber-500/10" : "border-border bg-card"}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3"><Zap className={priorityActive ? "mt-0.5 text-amber-500" : "mt-0.5 text-muted-foreground"} size={18} /><div><h3 className="font-bold">Election-Night Priority Mode</h3><p className="mt-1 text-sm text-muted-foreground">When enabled, an additional 30-minute review creates only urgent, review-only recommendations about verified election-night accuracy and coverage gaps.</p>{priorityActive && settings?.priorityModeExpiresAt && <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">Active until {new Date(settings.priorityModeExpiresAt).toLocaleString()}.</p>}</div></div>
          <div className="flex flex-wrap items-center gap-2"><select aria-label="Priority mode duration" value={priorityHours} onChange={(event) => setPriorityHours(event.target.value)} className="rounded-md border border-border bg-background px-2.5 py-2 text-xs"><option value="4">4 hours</option><option value="8">8 hours</option><option value="12">12 hours</option><option value="24">24 hours</option></select><button onClick={() => priorityMode.mutate({ enabled: !priorityActive, durationHours: Number(priorityHours) })} disabled={priorityMode.isPending} className={`rounded-md px-3 py-2 text-xs font-semibold ${priorityActive ? "bg-muted text-muted-foreground" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>{priorityMode.isPending ? "Updating…" : priorityActive ? "End priority mode" : "Enable priority mode"}</button></div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-bold">Approval queue</h3><p className="mt-1 text-xs text-muted-foreground">Filter, assign, then approve a recommendation into a private follow-up task.</p></div><span className="h-fit rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{pending.length} pending in view</span></div>
        <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="rounded-md border border-border bg-background px-3 py-2 text-xs">{recommendationStatuses.map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : label(item)}</option>)}</select><select value={category} onChange={(event) => setCategory(event.target.value as typeof category)} className="rounded-md border border-border bg-background px-3 py-2 text-xs">{recommendationCategories.map((item) => <option key={item} value={item}>{item === "all" ? "All categories" : label(item)}</option>)}</select><select value={priority} onChange={(event) => setPriority(event.target.value as typeof priority)} className="rounded-md border border-border bg-background px-3 py-2 text-xs">{recommendationPriorities.map((item) => <option key={item} value={item}>{item === "all" ? "All priorities" : `${item} priority`}</option>)}</select><input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Filter by owner" className="rounded-md border border-border bg-background px-3 py-2 text-xs" /></div>
        {(recommendations as any[]).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No recommendations match these filters. Run the Research Desk to create new reviewable recommendations.</div>
        ) : (
          <div className="space-y-3">
            {(recommendations as any[]).map((item) => {
              const Icon = statusIcon[item.status as keyof typeof statusIcon] ?? Clock3;
              const evidence = parseEvidence(item.evidence);
              const draftOwner = ownerDrafts[item.id] ?? item.assignedTo ?? "";
              const draftDueDate = dueDateDrafts[item.id] ?? "";
              return <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary">{label(item.category)}</span><span className="rounded bg-muted px-2 py-1 text-muted-foreground">{item.priority} priority</span><span className="inline-flex items-center gap-1 text-muted-foreground"><Icon size={13} />{item.status}</span>{item.assignedTo && <span className="inline-flex items-center gap-1 text-muted-foreground"><UserRound size={13} />{item.assignedTo}</span>}</div>
                    <h4 className="mt-2 font-semibold">{item.title}</h4><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p><p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm"><strong>Suggested next step:</strong> {item.proposedAction}</p>
                    {evidence.length > 0 && <div className="mt-2 text-xs text-muted-foreground">Evidence: {evidence.slice(0, 4).map((source: any, index: number) => <a key={source.id ?? index} href={source.url} target="_blank" rel="noreferrer" className="mr-2 text-primary underline underline-offset-2">{source.title}</a>)}</div>}
                  </div>
                  {item.status === "pending" && <div className="flex w-full shrink-0 flex-col gap-2 sm:w-52"><div className="flex gap-1"><input value={draftOwner} onChange={(event) => setOwnerDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Assign owner" className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs" /><button onClick={() => draftOwner.trim() && assign.mutate({ id: item.id, owner: draftOwner.trim() })} disabled={!draftOwner.trim() || assign.isPending} className="rounded-md bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground">Assign</button></div><input type="date" aria-label="Task due date" value={draftDueDate} onChange={(event) => setDueDateDrafts((current) => ({ ...current, [item.id]: event.target.value }))} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs" /><button onClick={() => approveToTask.mutate({ id: item.id, ...(draftOwner.trim() ? { owner: draftOwner.trim() } : {}), ...(draftDueDate ? { dueDate: draftDueDate } : {}) })} disabled={approveToTask.isPending} className="inline-flex items-center justify-center gap-1 rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><ListTodo size={13} />Approve & task</button><div className="flex gap-2"><button onClick={() => review.mutate({ id: item.id, status: "deferred" })} className="flex-1 rounded-md bg-muted px-2 py-1.5 text-xs font-semibold text-muted-foreground">Defer</button><button onClick={() => review.mutate({ id: item.id, status: "dismissed" })} className="flex-1 rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">Dismiss</button></div></div>}
                </div>
              </article>;
            })}
          </div>
        )}
      </section>

      <section><h3 className="mb-3 font-bold">Approved follow-up tasks</h3><div className="space-y-2">{(tasks as any[]).slice(0, 8).map((task) => { const taskDueDate = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""; return <div key={task.id} className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap gap-2"><span className="font-medium">{task.title}</span>{task.owner && <span className="text-muted-foreground">· {task.owner}</span>}</div><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{task.description}</p></div><div className="flex gap-2"><input type="date" aria-label="Update task due date" defaultValue={taskDueDate} onBlur={(event) => { if (event.target.value !== taskDueDate) updateTask.mutate({ id: task.id, status: task.status as typeof taskStatuses[number], ...(event.target.value ? { dueDate: event.target.value } : {}) }); }} className="rounded-md border border-border bg-background px-2 py-1 text-xs" /><select value={task.status} onChange={(event) => updateTask.mutate({ id: task.id, status: event.target.value as typeof taskStatuses[number], ...(taskDueDate ? { dueDate: taskDueDate } : {}) })} className="rounded-md border border-border bg-background px-2 py-1 text-xs">{taskStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></div></div>; })}{(tasks as any[]).length === 0 && <p className="text-sm text-muted-foreground">Approved recommendations will appear here as private follow-up tasks.</p>}</div></section>

      <section><h3 className="mb-3 font-bold">Recent research runs</h3><div className="space-y-2">{(runs as any[]).slice(0, 6).map((run) => <div key={run.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"><div><span className="font-medium capitalize">{run.trigger}</span><span className="ml-2 text-muted-foreground">{label(run.mode ?? "routine")} · {run.status} · {run.recommendationCount} recommendations</span></div><span className="text-xs text-muted-foreground">{run.startedAt ? new Date(run.startedAt).toLocaleString() : ""}</span></div>)}{(runs as any[]).length === 0 && <p className="text-sm text-muted-foreground">No research run is recorded yet.</p>}</div></section>
    </div>
  );
}

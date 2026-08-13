import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock3, RefreshCw, Sparkles, XCircle } from "lucide-react";

const statusIcon = {
  pending: Clock3,
  approved: CheckCircle2,
  dismissed: XCircle,
  deferred: Clock3,
} as const;

function parseEvidence(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function AgentDeskTab() {
  const utils = trpc.useUtils();
  const { data: recommendations = [] } = trpc.agent.recommendations.useQuery();
  const { data: runs = [] } = trpc.agent.runs.useQuery();
  const { data: settings } = trpc.agent.settings.useQuery();
  const runNow = trpc.agent.runNow.useMutation({
    onSuccess: () => {
      utils.agent.recommendations.invalidate();
      utils.agent.runs.invalidate();
      utils.agent.settings.invalidate();
    },
  });
  const review = trpc.agent.reviewRecommendation.useMutation({
    onSuccess: () => utils.agent.recommendations.invalidate(),
  });
  const pending = (recommendations as any[]).filter((item) => item.status === "pending");

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary"><Sparkles size={18} /><h2 className="font-bold">Autonomous Research Desk</h2></div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              The agent reviews current platform context and creates cited recommendations only. It cannot publish stories, alter election records, or send public alerts.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Planned routine cadence: every {settings?.researchIntervalHours ?? 4} hours. Last run: {settings?.lastRunAt ? new Date(settings.lastRunAt).toLocaleString() : "not yet run"}.</p>
          </div>
          <button onClick={() => runNow.mutate()} disabled={runNow.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            <RefreshCw size={15} className={runNow.isPending ? "animate-spin" : ""} /> {runNow.isPending ? "Researching…" : "Run research now"}
          </button>
        </div>
        {runNow.error && <p className="mt-3 text-sm text-destructive">The run did not complete. No public content or election data was changed.</p>}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Approval queue</h3><span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">{pending.length} pending</span></div>
        {(recommendations as any[]).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Run the Research Desk to create its first reviewable recommendations.</div>
        ) : (
          <div className="space-y-3">
            {(recommendations as any[]).map((item) => {
              const Icon = statusIcon[item.status as keyof typeof statusIcon] ?? Clock3;
              const evidence = parseEvidence(item.evidence);
              return <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded bg-primary/10 px-2 py-1 font-semibold text-primary">{item.category.replace("_", " ")}</span><span className="rounded bg-muted px-2 py-1 text-muted-foreground">{item.priority} priority</span><span className="inline-flex items-center gap-1 text-muted-foreground"><Icon size={13} />{item.status}</span></div>
                    <h4 className="mt-2 font-semibold">{item.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                    <p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm"><strong>Suggested next step:</strong> {item.proposedAction}</p>
                    {evidence.length > 0 && <div className="mt-2 text-xs text-muted-foreground">Evidence: {evidence.slice(0, 4).map((source: any, index: number) => <a key={source.id ?? index} href={source.url} target="_blank" rel="noreferrer" className="mr-2 text-primary underline underline-offset-2">{source.title}</a>)}</div>}
                  </div>
                  {item.status === "pending" && <div className="flex shrink-0 gap-2">
                    <button onClick={() => review.mutate({ id: item.id, status: "approved" })} className="rounded-md bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Approve</button>
                    <button onClick={() => review.mutate({ id: item.id, status: "deferred" })} className="rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">Defer</button>
                    <button onClick={() => review.mutate({ id: item.id, status: "dismissed" })} className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300">Dismiss</button>
                  </div>}
                </div>
              </article>;
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-bold">Recent research runs</h3>
        <div className="space-y-2">
          {(runs as any[]).slice(0, 6).map((run) => <div key={run.id} className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"><div><span className="font-medium capitalize">{run.trigger}</span><span className="ml-2 text-muted-foreground">{run.status} · {run.recommendationCount} recommendations</span></div><span className="text-xs text-muted-foreground">{run.startedAt ? new Date(run.startedAt).toLocaleString() : ""}</span></div>)}
          {(runs as any[]).length === 0 && <p className="text-sm text-muted-foreground">No research run is recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}

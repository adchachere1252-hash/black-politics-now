import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, FileDiff, MessageSquareMore, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const statusLabels: Record<string, string> = {
  pending_review: "Pending review",
  approved: "Approved decision",
  rejected: "Rejected",
  revision_requested: "Revision requested",
};

const kindLabels: Record<string, string> = {
  article_link: "Article-to-record link",
  data_correction: "Data-correction draft",
  editorial_copy: "Editorial-copy draft",
  portrait_source: "Portrait-source research",
};

function parseEvidence(value: string) {
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

function isLink(value: string) { return value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"); }

export function AgentProposedChangesTab() {
  const utils = trpc.useUtils();
  const [status, setStatus] = useState("pending_review");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [researchNotice, setResearchNotice] = useState<string | null>(null);
  const { data: proposals = [], isLoading } = trpc.agent.changeProposals.useQuery(status === "all" ? undefined : { status: status as "pending_review" | "approved" | "rejected" | "revision_requested" });
  const review = trpc.agent.reviewChangeProposal.useMutation({
    onSuccess: () => {
      utils.agent.changeProposals.invalidate();
      utils.agent.tasks.invalidate();
    },
  });
  const runResearch = trpc.agent.runTaskResearchNow.useMutation({
    onSuccess: (task: any) => {
      utils.agent.changeProposals.invalidate();
      utils.agent.tasks.invalidate();
      setResearchNotice(`Research task #${task.id} completed a fresh private pass. Review the newest change set below before making any decision.`);
    },
    onError: () => setResearchNotice(null),
  });
  const runDeskResearch = trpc.agent.runNow.useMutation({
    onSuccess: (run: any) => {
      utils.agent.recommendations.invalidate();
      utils.agent.runs.invalidate();
      setResearchNotice(`Research Desk run #${run.id} completed. Review the recommendations in Agent Desk, approve a bounded agent task, then return here for its private change package.`);
    },
    onError: () => setResearchNotice("The Research Desk run did not complete. No public record changed."),
  });
  const visible = useMemo(() => proposals as any[], [proposals]);

  return <div className="space-y-6">
    <section className="rounded-xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex items-center gap-2 text-primary"><FileDiff size={19}/><h2 className="font-bold">Proposed Changes</h2></div><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">This is the final review page for completed Agent Desk tasks. The agent can submit a proposed article link, data correction, or editorial-copy draft with evidence and a target. Your decision is recorded here; approval does not automatically change WordPress, public articles, election data, or alerts.</p></div><div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-background px-3 py-2 text-xs font-semibold text-muted-foreground"><ShieldCheck size={15} className="text-primary"/> Human approval required</div></div>
    </section>

    <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-bold">Review queue</h3><p className="mt-1 text-xs text-muted-foreground">Approve, reject, or request a revision for each private proposal. The research control runs a fresh cited pass for the underlying Agent Desk task; no action is applied from this page.</p></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-xs"><option value="pending_review">Pending review</option><option value="approved">Approved decisions</option><option value="revision_requested">Revision requested</option><option value="rejected">Rejected</option><option value="all">All change sets</option></select></section>
    {researchNotice && <p className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm text-primary">{researchNotice}</p>}

    {isLoading ? <div className="h-52 animate-pulse rounded-xl bg-muted" /> : visible.length === 0 ? <div className="rounded-xl border border-dashed border-border p-10 text-center"><FileDiff className="mx-auto text-muted-foreground" size={30}/><h3 className="mt-3 font-semibold">No {status === "all" ? "agent change sets" : statusLabels[status]?.toLowerCase() || "matching change sets"} yet</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">Start a fresh Research Desk pass here, then open Agent Desk to approve a bounded agent work package. Its evidence-backed proposals return here for your decision; no public change is automatic.</p><div className="mt-4 flex flex-wrap justify-center gap-2"><button onClick={() => runDeskResearch.mutate()} disabled={runDeskResearch.isPending} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"><RefreshCcw size={14} className={runDeskResearch.isPending ? "animate-spin" : ""}/>{runDeskResearch.isPending ? "Researching…" : "Run research now"}</button><a href="/admin?tab=agent" className="inline-flex rounded-md border border-primary/35 bg-primary/5 px-3 py-2 text-xs font-bold text-primary">Open Agent Desk</a></div></div> : <div className="space-y-4">{visible.map((proposal) => {
      const evidence = parseEvidence(proposal.evidence);
      const isPending = proposal.status === "pending_review";
      return <article key={proposal.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-primary">{kindLabels[proposal.kind] || proposal.kind}</span><span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[.1em] ${isPending ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : proposal.status === "approved" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>{statusLabels[proposal.status] || proposal.status}</span></div><h3 className="mt-3 text-lg font-bold">{proposal.title}</h3><p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Target:</strong> {isLink(proposal.targetReference) ? <a href={proposal.targetReference} target={proposal.targetReference.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-2">{proposal.targetType} <ExternalLink size={12}/></a> : `${proposal.targetType} · ${proposal.targetReference}`}</p></div><p className="shrink-0 text-xs text-muted-foreground">Agent task #{proposal.taskId}</p></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2"><div className="rounded-lg border border-border bg-muted/35 p-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-muted-foreground">Current / before</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{proposal.beforeValue || "Current value requires editor confirmation"}</p></div><div className="rounded-lg border border-primary/25 bg-primary/5 p-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Proposed change</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{proposal.proposedValue}</p></div></div>
        <div className="mt-4 rounded-lg border-l-2 border-primary bg-muted/30 p-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Agent rationale</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{proposal.rationale}</p></div>
        {evidence.length > 0 && <div className="mt-4 text-xs text-muted-foreground"><strong className="text-foreground">Evidence:</strong>{evidence.slice(0, 6).map((source: any, index: number) => <a key={source.id ?? index} href={source.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex text-primary underline underline-offset-2">{source.title || `Source ${index + 1}`}</a>)}</div>}
        {proposal.reviewerNotes && <div className="mt-4 rounded-lg border border-border bg-muted/25 p-3 text-sm"><p className="font-semibold">Reviewer note</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{proposal.reviewerNotes}</p></div>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><p className="text-xs text-muted-foreground">Task #{proposal.taskId} · reruns remain private and replace no public record.</p><button onClick={() => runResearch.mutate({ id: proposal.taskId })} disabled={runResearch.isPending} className="inline-flex items-center gap-1 rounded-md border border-primary/35 bg-primary/5 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"><RefreshCcw size={14}/> {runResearch.isPending ? "Researching…" : "Run fresh research"}</button></div>
        {isPending && <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]"><textarea value={notes[proposal.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [proposal.id]: event.target.value }))} placeholder="Optional note for the review decision or requested revision" rows={2} className="resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"/><div className="flex flex-wrap items-center gap-2"><button onClick={() => review.mutate({ id: proposal.id, status: "approved", ...(notes[proposal.id]?.trim() ? { reviewerNotes: notes[proposal.id].trim() } : {}) })} disabled={review.isPending} className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"><CheckCircle2 size={14}/> Approve</button><button onClick={() => review.mutate({ id: proposal.id, status: "revision_requested", ...(notes[proposal.id]?.trim() ? { reviewerNotes: notes[proposal.id].trim() } : {}) })} disabled={review.isPending} className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"><RefreshCcw size={14}/> Request revision</button><button onClick={() => review.mutate({ id: proposal.id, status: "rejected", ...(notes[proposal.id]?.trim() ? { reviewerNotes: notes[proposal.id].trim() } : {}) })} disabled={review.isPending} className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-500/15 dark:text-red-300"><XCircle size={14}/> Reject</button></div></div>}
        {(review.error || runResearch.error) && <p className="mt-3 text-sm text-destructive">The private research or review request did not save. No public change was made.</p>}
      </article>;
    })}</div>}
    <section className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground"><div className="flex items-start gap-3"><MessageSquareMore size={18} className="mt-0.5 text-primary"/><p><strong className="text-foreground">What approval means:</strong> your decision records that this proposal is editorially accepted. Applying it to a public WordPress article, a map record, or other public surface remains a separate, visible action—not an automatic side effect of approval.</p></div></section>
  </div>;
}

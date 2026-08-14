import { useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, ImagePlus, SearchCheck, ShieldCheck, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const provenanceLabels: Record<string, string> = {
  official_campaign: "Official campaign",
  official_government: "Official government",
  bioguide: "Bioguide",
  licensed_media: "Licensed media",
  other_verified: "Other verified source",
};

type Target = { targetType: "senate" | "house" | "governor" | "black_representation"; targetRecordId: number; targetPhotoField: "candidate1" | "candidate2" | "dem" | "rep" | "profile"; candidateName: string; location: string };

function targetKey(target: Pick<Target, "targetType" | "targetRecordId" | "targetPhotoField">) {
  return `${target.targetType}:${target.targetRecordId}:${target.targetPhotoField}`;
}

export function PortraitReviewTab() {
  const { data: targets = [], refetch: refetchTargets } = trpc.portraits.targets.useQuery();
  const { data: pending = [], refetch: refetchPending } = trpc.portraits.submissions.useQuery({ status: "pending" });
  const { data: reviewed = [], refetch: refetchReviewed } = trpc.portraits.submissions.useQuery();
  const [selectedKey, setSelectedKey] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [provenanceType, setProvenanceType] = useState("official_campaign");
  const [submissionNote, setSubmissionNote] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const targetByKey = useMemo(() => new Map((targets as Target[]).map((target) => [targetKey(target), target])), [targets]);
  const selectedTarget = selectedKey ? targetByKey.get(selectedKey) : undefined;
  const refresh = () => { refetchTargets(); refetchPending(); refetchReviewed(); };
  const submit = trpc.portraits.submit.useMutation({ onSuccess: () => { setImageUrl(""); setSourceUrl(""); setSubmissionNote(""); setSelectedKey(""); setFormError(null); refresh(); }, onError: (error) => setFormError(error.message) });
  const review = trpc.portraits.review.useMutation({ onSuccess: refresh });
  const research = trpc.portraits.researchNow.useMutation({ onSuccess: () => { setSelectedKey(""); refresh(); } });

  const submitCandidate = () => {
    if (!selectedTarget) return setFormError("Select a current missing-photo target first.");
    setFormError(null);
    submit.mutate({ ...selectedTarget, imageUrl: imageUrl.trim(), sourceUrl: sourceUrl.trim(), provenanceType: provenanceType as any, submissionNote: submissionNote.trim() || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-lg font-bold"><ImagePlus size={18} className="text-primary" /> Portrait submission queue</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">Submit a provenance-backed portrait only for a listed photo gap. Approval writes the reviewed URL to its exact race or representation profile; rejection changes nothing public.</p></div><span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary"><ShieldCheck size={13} /> Human review required</span></div>
        <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-sm font-medium">Missing-photo target<select value={selectedKey} onChange={(event) => setSelectedKey(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">Select a candidate ({targets.length} current gaps)</option>{(targets as Target[]).map((target) => <option key={targetKey(target)} value={targetKey(target)}>{target.candidateName} — {target.location}</option>)}</select></label><label className="text-sm font-medium">Portrait image URL<input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…/portrait.jpg" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label><label className="text-sm font-medium">Provenance URL<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://official-source.example/profile" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label><label className="text-sm font-medium">Provenance type<select value={provenanceType} onChange={(event) => setProvenanceType(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">{Object.entries(provenanceLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div>
        <label className="mt-3 block text-sm font-medium">Review note <span className="font-normal text-muted-foreground">(optional)</span><textarea value={submissionNote} onChange={(event) => setSubmissionNote(event.target.value)} placeholder="Why this is an appropriate, conflict-free source…" className="mt-1 min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
        {formError && <p className="mt-3 text-sm text-destructive">{formError}</p>}
        <div className="mt-4 flex flex-wrap gap-2"><button onClick={submitCandidate} disabled={submit.isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{submit.isPending ? "Submitting…" : "Submit for provenance review"}</button><button onClick={() => { if (!selectedTarget) return setFormError("Select a current missing-photo target first."); setFormError(null); research.mutate(selectedTarget); }} disabled={research.isPending} className="inline-flex items-center gap-2 rounded-md border border-primary/35 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-50"><SearchCheck size={15} />{research.isPending ? "Researching…" : "Run portrait research"}</button></div><p className="mt-2 text-xs text-muted-foreground">Portrait research creates a private Agent Desk work package and proposed source only when the evidence is sufficient. It never applies a photo.</p>
      </div>

      <div className="glass-card rounded-xl p-5"><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-bold uppercase tracking-wider">Pending review</h3><p className="mt-1 text-xs text-muted-foreground">Review the portrait and the source before applying it to the public record.</p></div><span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">{pending.length} pending</span></div><div className="mt-4 space-y-3">{(pending as any[]).map((submission) => <div className="grid gap-3 rounded-lg border border-border/70 bg-background/40 p-3 md:grid-cols-[72px_1fr_auto]"><img src={submission.imageUrl} alt="Submitted candidate portrait" className="h-[72px] w-[72px] rounded-md border border-border object-cover" onError={(event) => { event.currentTarget.style.opacity = "0.3"; }} /><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{submission.candidateName}</p><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">{submission.targetType.replace("_", " ")}</span></div><div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground"><a href={submission.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Image <ExternalLink size={11} /></a><a href={submission.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">{provenanceLabels[submission.provenanceType] ?? "Source"} <ExternalLink size={11} /></a></div>{submission.submissionNote && <p className="mt-2 text-xs text-muted-foreground">{submission.submissionNote}</p>}<input value={reviewNotes[submission.id] ?? ""} onChange={(event) => setReviewNotes((notes) => ({ ...notes, [submission.id]: event.target.value }))} placeholder="Required for rejection; optional approval note" className="mt-3 w-full rounded border border-border bg-background px-2 py-1.5 text-xs" /></div><div className="flex items-start gap-2"><button onClick={() => { if (window.confirm(`Approve this portrait for ${submission.candidateName}? This updates the matched public record.`)) review.mutate({ id: submission.id, decision: "approved", reviewNote: reviewNotes[submission.id] || undefined }); }} disabled={review.isPending} className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle2 size={13} /> Approve</button><button onClick={() => review.mutate({ id: submission.id, decision: "rejected", reviewNote: reviewNotes[submission.id] || undefined })} disabled={review.isPending} className="inline-flex items-center gap-1 rounded border border-destructive/40 px-2.5 py-1.5 text-xs font-semibold text-destructive disabled:opacity-50"><XCircle size={13} /> Reject</button></div></div>)}{pending.length === 0 && <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">No portrait submissions are awaiting review.</p>}</div></div>

      <div className="glass-card rounded-xl p-5"><h3 className="text-sm font-bold uppercase tracking-wider">Recent decisions</h3><div className="mt-3 space-y-2">{(reviewed as any[]).filter((submission) => submission.status !== "pending").slice(0, 8).map((submission) => <div className="flex items-center justify-between gap-3 rounded border border-border/60 px-3 py-2 text-sm"><div><span className="font-medium">{submission.candidateName}</span><span className="ml-2 text-xs text-muted-foreground">{submission.reviewedBy ?? "Administrator"} · {submission.reviewedAt ? new Date(submission.reviewedAt).toLocaleDateString() : ""}</span></div><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${submission.status === "approved" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>{submission.status}</span></div>)}{(reviewed as any[]).filter((submission) => submission.status !== "pending").length === 0 && <p className="text-sm text-muted-foreground">No portrait decisions have been recorded.</p>}</div></div>
    </div>
  );
}

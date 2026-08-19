import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, ImagePlus, ShieldCheck, XCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getPortraitApprovalEvidence } from "@/lib/portraitReviewEvidence";
import { getOfficialPortraitSourceLeads } from "@/lib/portraitSourceLeads";

const provenanceLabels: Record<string, string> = {
  official_campaign: "Official campaign",
  official_government: "Official government",
  bioguide: "Bioguide",
  licensed_media: "Licensed media",
  other_verified: "Other verified source",
};

type Target = {
  targetType: "senate" | "house" | "governor" | "black_representation";
  targetRecordId: number;
  targetPhotoField: "candidate1" | "candidate2" | "dem" | "rep" | "profile";
  candidateName: string;
  location: string;
};

function keyFor(target: Pick<Target, "targetType" | "targetRecordId" | "targetPhotoField">) {
  return `${target.targetType}:${target.targetRecordId}:${target.targetPhotoField}`;
}

function parseSources(value: string | null | undefined) {
  try {
    return JSON.parse(value || "[]") as Array<{ title?: string; url?: string }>;
  } catch {
    return [];
  }
}

export function PortraitReviewTab({ initialTargetKey }: { initialTargetKey?: string }) {
  const { data: targets = [], refetch: refetchTargets } = trpc.portraits.targets.useQuery();
  const { data: pending = [], refetch: refetchPending } = trpc.portraits.submissions.useQuery({ status: "pending" });
  const { data: reviewed = [], refetch: refetchReviewed } = trpc.portraits.submissions.useQuery();
  const [selectedKey, setSelectedKey] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [provenanceType, setProvenanceType] = useState("official_campaign");
  const [note, setNote] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [brokenBulkImages, setBrokenBulkImages] = useState<number[]>([]);
  const targetByKey = useMemo(() => new Map((targets as Target[]).map((target) => [keyFor(target), target])), [targets]);
  const selectedTarget = selectedKey ? targetByKey.get(selectedKey) : undefined;
  const selectedPending = selectedTarget ? (pending as any[]).find((item) => keyFor(item) === keyFor(selectedTarget)) : null;
  const sourceLeads = selectedTarget ? getOfficialPortraitSourceLeads({ candidateName: selectedTarget.candidateName, location: selectedTarget.location, targetType: selectedTarget.targetType }) : [];
  const completedDecisions = (reviewed as any[]).filter((item) => item.status !== "pending");
  const bulkReviewItems = pending as any[];
  const bulkReviewItem = bulkReviewItems[Math.min(bulkIndex, Math.max(0, bulkReviewItems.length - 1))] ?? null;
  const bulkImageUnavailable = Boolean(bulkReviewItem && brokenBulkImages.includes(bulkReviewItem.id));

  useEffect(() => {
    if (initialTargetKey && targetByKey.has(initialTargetKey)) {
      setSelectedKey(initialTargetKey);
      return;
    }
    if (!selectedKey && targets.length) setSelectedKey(keyFor(targets[0] as Target));
  }, [initialTargetKey, selectedKey, targetByKey, targets]);

  const refresh = () => {
    void refetchTargets();
    void refetchPending();
    void refetchReviewed();
  };
  const submit = trpc.portraits.submit.useMutation({
    onSuccess: () => {
      setImageUrl("");
      setSourceUrl("");
      setNote("");
      setFormError(null);
      refresh();
    },
    onError: (error) => setFormError(error.message),
  });
  const review = trpc.portraits.review.useMutation({ onSuccess: refresh, onError: (error) => setFormError(error.message) });

  const sendEvidenceForReview = () => {
    if (!selectedTarget) return setFormError("Choose a candidate before submitting image evidence.");
    if (!/^https:\/\//.test(imageUrl.trim()) || !/^https:\/\//.test(sourceUrl.trim())) return setFormError("Add secure https image and source links before sending this image to review.");
    setFormError(null);
    submit.mutate({ ...selectedTarget, imageUrl: imageUrl.trim(), sourceUrl: sourceUrl.trim(), provenanceType: provenanceType as any, submissionNote: note.trim() || undefined });
  };
  const decide = (decision: "approved" | "rejected") => {
    if (!selectedPending) return;
    const reviewNote = reviewNotes[selectedPending.id]?.trim();
    if (decision === "rejected" && !reviewNote) return setFormError("Add a short reason when denying an image so the next search can improve.");
    if (decision === "approved" && !window.confirm(`Approve this image for ${selectedPending.candidateName}? This will update the matched public candidate portrait.`)) return;
    setFormError(null);
    review.mutate({ id: selectedPending.id, decision, reviewNote: reviewNote || undefined });
  };
  const decideBulk = (decision: "approved" | "rejected") => {
    if (!bulkReviewItem) return;
    const reviewNote = reviewNotes[bulkReviewItem.id]?.trim();
    if (decision === "rejected" && !reviewNote) return setFormError("Add a short reason when denying an image so the next search can improve.");
    if (decision === "approved" && bulkImageUnavailable) return setFormError("This proposed image did not load. It cannot be approved; deny it with a note or skip it for follow-up.");
    if (decision === "approved" && !window.confirm(`Approve this image for ${bulkReviewItem.candidateName}? This will update the matched public candidate portrait.`)) return;
    setFormError(null);
    review.mutate(
      { id: bulkReviewItem.id, decision, reviewNote: reviewNote || undefined },
      {
        onSuccess: () => {
          setBulkIndex((current) => Math.max(0, Math.min(current, Math.max(0, bulkReviewItems.length - 2))));
          refresh();
        },
      },
    );
  };

  return <div className="space-y-5">
    <section className="glass-card rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Candidate image desk</p><h2 className="mt-1 flex items-center gap-2 text-xl font-bold"><ImagePlus size={19} className="text-primary" /> Portrait Source Review</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Choose a candidate, use an official-source lead or provide an image and provenance page, then make one visual decision: <strong className="text-foreground">Approve</strong> or <strong className="text-foreground">Deny</strong>. Nothing is public until you approve it.</p></div><span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary"><ShieldCheck size={13}/> You decide before publication</span></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2"><div className="rounded-lg border border-border bg-background/55 p-3"><p className="text-2xl font-bold">{targets.length}</p><p className="text-xs font-semibold text-muted-foreground">Candidates needing an image</p></div><div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.035] p-3"><p className="text-2xl font-bold">{pending.length}</p><p className="text-xs font-semibold text-muted-foreground">Images awaiting your decision</p></div></div>
      <div className="mt-4 rounded-lg border border-primary/25 bg-primary/[0.035] p-3 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Working method:</strong> open a curated official-source lead, copy a direct image URL and the page that establishes provenance, then send the package to the Approve / Deny queue. The platform validates secure links and retains both the image and source for review.</div>
    </section>

    <section className="glass-card rounded-xl p-5">
      <label className="block text-sm font-bold">1. Choose a candidate<select value={selectedKey} onChange={(event) => { setSelectedKey(event.target.value); setFormError(null); }} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm"><option value="">Select a candidate needing an image</option>{(targets as Target[]).map((target) => <option key={keyFor(target)} value={keyFor(target)}>{target.candidateName} — {target.location}</option>)}</select></label>
      {!selectedTarget ? <p className="mt-5 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Select a candidate to prepare source-backed image evidence or review an image.</p> : <div className="mt-5 rounded-xl border border-primary/25 bg-primary/[0.025] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Selected candidate</p><h3 className="mt-1 text-lg font-bold">{selectedTarget.candidateName}</h3><p className="mt-1 text-sm text-muted-foreground">{selectedTarget.location}</p></div>{selectedPending && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">Ready for your decision</span>}</div>
        {formError && <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{formError}</p>}
        {selectedPending ? <div className="mt-5 grid gap-4 rounded-xl border border-amber-500/35 bg-background/70 p-4 md:grid-cols-[160px_1fr]"><img src={selectedPending.imageUrl} alt={`Image proposed for ${selectedPending.candidateName}`} className="h-40 w-40 max-w-full rounded-lg border border-border object-cover"/><div><p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">2. Review this proposed image</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Confirm that the person is {selectedPending.candidateName}, the image is appropriate, and the source supports the identity claim.</p><div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold"><a href={selectedPending.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Open image <ExternalLink size={12}/></a><a href={selectedPending.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Open source <ExternalLink size={12}/></a></div><input value={reviewNotes[selectedPending.id] ?? ""} onChange={(event) => setReviewNotes((notes) => ({ ...notes, [selectedPending.id]: event.target.value }))} placeholder="Optional approval note; required if you deny this image" className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"/><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => decide("approved")} disabled={review.isPending} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={15}/> Approve image</button><button onClick={() => decide("rejected")} disabled={review.isPending} className="inline-flex items-center gap-1 rounded-md border border-destructive/45 bg-destructive/5 px-4 py-2 text-sm font-bold text-destructive disabled:opacity-50"><XCircle size={15}/> Deny image</button></div></div></div> : <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-primary">2. Find an official image</p><p className="mt-2 text-sm text-muted-foreground">Open an official-source lead, then submit the direct image URL together with the page that establishes its provenance. Your submission enters the decision queue for approval or denial.</p><div className="mt-3 flex flex-wrap gap-2">{sourceLeads.map((lead) => <a key={lead.label} href={lead.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-xs font-bold text-primary"><span>{lead.label}</span><ExternalLink size={11}/></a>)}</div><details className="mt-4 rounded-lg border border-border bg-background/65 p-3"><summary className="cursor-pointer text-sm font-bold">Submit official image evidence</summary><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-bold">Direct image URL<input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://…/portrait.jpg" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"/></label><label className="text-xs font-bold">Official source page<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://official-source.example/profile" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"/></label><label className="text-xs font-bold">Source type<select value={provenanceType} onChange={(event) => setProvenanceType(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">{Object.entries(provenanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-bold">Optional note<input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why this image matches the candidate" className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"/></label></div><button onClick={sendEvidenceForReview} disabled={submit.isPending} className="mt-3 inline-flex items-center gap-1 rounded-md border border-primary/45 bg-primary/10 px-4 py-2 text-sm font-bold text-primary disabled:opacity-50"><ImagePlus size={15}/> Send image to Approve / Deny</button></details></div>}</div>}
    </section>

    <section className="glass-card rounded-xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bulk visual review</p><h3 className="mt-1 text-lg font-bold">Review found images one at a time</h3><p className="mt-1 text-sm text-muted-foreground">Bulk mode speeds up review, but it never approves multiple portraits automatically.</p></div>{bulkReviewItem && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">Image {bulkIndex + 1} of {bulkReviewItems.length}</span>}</div>{bulkReviewItem ? <div className="mt-4 grid gap-4 rounded-xl border border-amber-500/35 bg-background/60 p-4 md:grid-cols-[150px_1fr]">{bulkImageUnavailable ? <div className="grid h-36 w-36 place-items-center rounded-lg border border-dashed border-destructive/45 bg-destructive/5 p-3 text-center text-xs font-bold text-destructive">Image unavailable<br/>Do not approve</div> : <img src={bulkReviewItem.imageUrl} alt={`Image proposed for ${bulkReviewItem.candidateName}`} onError={() => setBrokenBulkImages((items) => items.includes(bulkReviewItem.id) ? items : [...items, bulkReviewItem.id])} className="h-36 w-36 max-w-full rounded-lg border border-border object-cover"/>}<div><p className="font-bold">{bulkReviewItem.candidateName}</p><p className="mt-1 text-sm text-muted-foreground">{bulkReviewItem.targetType.replace("_", " ")} · private image result</p><div className="mt-3 flex flex-wrap gap-3 text-xs font-bold"><a href={bulkReviewItem.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Open image <ExternalLink size={12}/></a><a href={bulkReviewItem.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Open source <ExternalLink size={12}/></a></div>{bulkImageUnavailable && <p className="mt-3 text-xs font-semibold text-destructive">Preview failed to load. Deny this item with a note or skip it; approval is blocked.</p>}<input value={reviewNotes[bulkReviewItem.id] ?? ""} onChange={(event) => setReviewNotes((notes) => ({ ...notes, [bulkReviewItem.id]: event.target.value }))} placeholder="Optional approval note; required if you deny this image" className="mt-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"/><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => decideBulk("approved")} disabled={review.isPending || bulkImageUnavailable} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={15}/> Approve this image</button><button onClick={() => decideBulk("rejected")} disabled={review.isPending} className="inline-flex items-center gap-1 rounded-md border border-destructive/45 bg-destructive/5 px-4 py-2 text-sm font-bold text-destructive disabled:opacity-50"><XCircle size={15}/> Deny this image</button><button onClick={() => setBulkIndex((current) => (current + 1) % bulkReviewItems.length)} className="rounded-md border border-border bg-background px-3 py-2 text-sm font-bold text-muted-foreground">Skip for now</button></div></div></div> : <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No images are waiting for a decision. Start a bulk search or choose one candidate above to begin.</p>}</section>

    <section className="glass-card rounded-xl p-5"><h3 className="text-sm font-bold uppercase tracking-wider">Recent image decisions</h3><p className="mt-1 text-xs text-muted-foreground">Each decision retains the visual and cited source for a clear audit trail.</p><div className="mt-4 grid gap-2 md:grid-cols-2">{completedDecisions.slice(0, 8).map((item) => <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/45 p-3"><img src={item.imageUrl} alt={`Reviewed portrait of ${item.candidateName}`} className="h-12 w-12 rounded-md border border-border object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{item.candidateName}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary underline">View source</a></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.status === "approved" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>{item.status}</span></div>)}{completedDecisions.length === 0 && <p className="text-sm text-muted-foreground">No image decisions have been recorded yet.</p>}</div></section>
  </div>;
}

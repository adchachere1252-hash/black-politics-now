import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { AgentDeskTab } from "@/components/AgentDeskTab";
import MiniRepositoryGlobe from "@/components/MiniRepositoryGlobe";
import { useState, useMemo } from "react";
import { Shield, Radio, MapPin, Users, Save, Check, Search, Star, Sparkles, AlertTriangle, CheckCircle2, Clock3, FileText, Headphones, ListChecks, RefreshCw, ShieldCheck } from "lucide-react";

type AdminTab = "overview" | "podcast" | "elections" | "cbc" | "agent" | "audience";

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>(() => {
    const requested = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("tab");
    return requested === "podcast" || requested === "elections" || requested === "cbc" || requested === "agent" || requested === "audience" ? requested : "overview";
  });
  const [focusRecommendationId, setFocusRecommendationId] = useState<number | undefined>();

  if (loading) return <div className="container py-8"><div className="h-40 bg-muted rounded animate-pulse" /></div>;

  if (!isAuthenticated) {
    return (
      <div className="container py-16 text-center">
        <Shield size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
        <p className="text-muted-foreground mb-6">Sign in with your admin account to access the dashboard.</p>
        <button onClick={() => startLogin()} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90">
          Sign In
        </button>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="container py-16 text-center">
        <Shield size={48} className="mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-6">Admin Dashboard</h1>

      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
        {([
          { key: "overview", label: "Overview", icon: Shield },
          { key: "podcast", label: "Podcast Ops", icon: Radio },
          { key: "elections", label: "Election Ops", icon: MapPin },
          { key: "cbc", label: "Black Representation", icon: Star },
          { key: "agent", label: "Agent Desk", icon: Sparkles },
          { key: "audience", label: "Audience", icon: Users },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab onReview={(id) => { setFocusRecommendationId(id); setTab("agent"); }} />}
      {tab === "podcast" && <PodcastOpsTab />}
      {tab === "elections" && <ElectionOpsTab />}
      {tab === "cbc" && <CbcOpsTab />}
      {tab === "agent" && <AgentDeskTab focusRecommendationId={focusRecommendationId} />}
      {tab === "audience" && <AudienceTab />}
    </div>
  );
}

function OverviewTab({ onReview }: { onReview: (id: number) => void }) {
  const { data: scoreboard } = trpc.election.scoreboard.useQuery();
  const { data: episodes } = trpc.podcast.getEpisodes.useQuery();
  const { data: senateRaces } = trpc.election.senate.useQuery();
  const { data: houseRaces } = trpc.election.house.useQuery();
  const { data: governors } = trpc.election.governors.useQuery();
  const { data: priorityRecommendations = [] } = trpc.agent.recommendations.useQuery({ status: "pending", priority: "high" });
  const { data: agentSettings } = trpc.agent.settings.useQuery();
  const { data: agentTasks = [] } = trpc.agent.tasks.useQuery();
  const { data: worldElections = [] } = trpc.world.elections.useQuery();
  const [priorityOwner, setPriorityOwner] = useState("all");

  // Calculate live polling status
  const liveRaces = (senateRaces as any[] ?? []).filter((r: any) => r.pctReporting > 0).length
    + (houseRaces as any[] ?? []).filter((r: any) => r.pctReporting > 0).length
    + (governors as any[] ?? []).filter((r: any) => r.pctReporting > 0).length;
  const isLive = liveRaces > 0;
  const ownerOptions = Array.from(new Set((priorityRecommendations as any[]).map((item) => item.assignedTo).filter(Boolean))) as string[];
  const visiblePriorityRecommendations = (priorityRecommendations as any[]).filter((item) => priorityOwner === "all" || (priorityOwner === "unassigned" ? !item.assignedTo : item.assignedTo === priorityOwner));
  const now = Date.now();
  const reminderTasks = (agentTasks as any[]).filter((task) => task.status !== "completed" && task.dueDate).map((task) => ({ ...task, dueAt: new Date(task.dueDate).getTime() })).filter((task) => Number.isFinite(task.dueAt));
  const overdueTasks = reminderTasks.filter((task) => task.dueAt < now).sort((a, b) => a.dueAt - b.dueAt);
  const upcomingTasks = reminderTasks.filter((task) => task.dueAt >= now && task.dueAt <= now + 3 * 24 * 60 * 60 * 1000).sort((a, b) => a.dueAt - b.dueAt);
  const worldRecords = worldElections as any[];
  const worldUpcoming = worldRecords.filter((record) => record.status === "Upcoming").length;
  const worldLive = worldRecords.filter((record) => record.status === "Voting Today").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Total Episodes</p>
          <p className="text-3xl font-bold">{(episodes as any[])?.length ?? 0}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">Senate Races Called</p>
          <p className="text-3xl font-bold">{(scoreboard?.senate.dem ?? 0) + (scoreboard?.senate.rep ?? 0)}</p>
        </div>
        <div className="glass-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-1">House Races Called</p>
          <p className="text-3xl font-bold">{(scoreboard?.house.dem ?? 0) + (scoreboard?.house.rep ?? 0)}</p>
        </div>
      </div>

      {/* DDHQ Sync Status */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          DDHQ Election Engine Status
          {isLive && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE</span>}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Senate Mapped</p>
            <p className="font-bold">{(senateRaces as any[])?.length ?? 0} races</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">House Mapped</p>
            <p className="font-bold">{(houseRaces as any[])?.length ?? 0} races</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Governor Mapped</p>
            <p className="font-bold">{(governors as any[])?.length ?? 0} races</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Races Reporting</p>
            <p className="font-bold">{liveRaces} {isLive ? "🔴" : "⚪"}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
          <p><strong>Cloud Computer:</strong> 35.229.72.71 — Polling every 60s when active</p>
          <p><strong>Data Source:</strong> DDHQ Public API (same feed as Fox News/Newsweek)</p>
          <p><strong>To start live polling:</strong> SSH → <code className="bg-muted px-1 rounded">cd /home/ubuntu/bpn-automation && node scripts/election-engine.mjs poll</code></p>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-xl p-0">
        <div className="grid min-h-[180px] md:grid-cols-[220px_1fr]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_68%_30%,rgba(56,189,248,0.5),transparent_46%),linear-gradient(135deg,#061426,#0d315c)]">
            <div className="absolute inset-0"><MiniRepositoryGlobe theme="dark" vibrant /></div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded border border-cyan-100/20 bg-slate-950/50 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-50">World Elections monitor</div>
          </div>
          <div className="flex flex-col justify-center p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold uppercase tracking-wider">Global Elections Desk</h3><p className="mt-1 text-xs text-muted-foreground">Operational snapshot of the public World Elections calendar.</p></div><a href="/world" className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-primary">Open World Elections</a></div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-border text-center"><AdminMetric value={worldRecords.length} label="Tracked" /><AdminMetric value={worldUpcoming} label="Upcoming" /><AdminMetric value={worldLive} label="Voting today" /></div>
            <p className="mt-4 text-xs text-muted-foreground">This globe is a monitoring view only; calendar updates remain governed by the World Elections data workflow.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold uppercase tracking-wider">Task reminders</h3><p className="mt-1 text-xs text-muted-foreground">Open Agent Desk follow-up tasks with due dates.</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-red-500/10 px-2 py-1 font-semibold text-red-700 dark:text-red-300">{overdueTasks.length} overdue</span><span className="rounded-full bg-amber-500/10 px-2 py-1 font-semibold text-amber-700 dark:text-amber-300">{upcomingTasks.length} due in 3 days</span></div></div>
        {[...overdueTasks, ...upcomingTasks].slice(0, 4).map((task) => <div key={task.id} className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/50 px-3 py-2"><div><p className="text-sm font-medium">{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.owner ?? "Unassigned"} · due {new Date(task.dueDate).toLocaleDateString()}</p></div><span className={`shrink-0 text-xs font-semibold ${task.dueAt < now ? "text-red-600 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}>{task.dueAt < now ? "Overdue" : "Upcoming"}</span></div>)}
        {reminderTasks.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No open tasks have a due date yet.</p>}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Election-Night Priority Queue</h3>
            <p className="mt-1 text-xs text-muted-foreground">High-priority, review-only Research Desk recommendations.</p>
          </div>
          <div className="flex items-center gap-2"><select aria-label="Filter priority queue by owner" value={priorityOwner} onChange={(event) => setPriorityOwner(event.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"><option value="all">All owners</option><option value="unassigned">Unassigned</option>{ownerOptions.map((owner) => <option key={owner} value={owner}>{owner}</option>)}</select><span className={`rounded-full px-2 py-1 text-xs font-semibold ${agentSettings?.priorityModeEnabled ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>{agentSettings?.priorityModeEnabled ? "Priority mode active" : "Routine mode"}</span></div>
        </div>
        {visiblePriorityRecommendations.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No high-priority recommendations match this owner filter.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {visiblePriorityRecommendations.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-lg border border-border/70 bg-background/50 px-3 py-2">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{item.title}</p><span className="shrink-0 text-xs text-muted-foreground">{item.assignedTo ?? "Unassigned"}</span></div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.proposedAction}</p>
                <button onClick={() => onReview(item.id)} className="mt-2 rounded-md bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary">Review now</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PodcastOpsTab() {
  const { data: operations, isLoading, dataUpdatedAt, refetch } = trpc.podcast.operations.useQuery(undefined, { refetchInterval: 30_000 });
  const latest = (operations as any)?.latest;
  const preflight = (operations as any)?.latestPreflight;
  const recentEpisodes = (operations as any)?.recentEpisodes ?? [];
  const recentRuns = (operations as any)?.recentRuns ?? [];
  const preflights = (operations as any)?.preflights ?? [];
  const fullAudioReady = Boolean(latest?.fullAudioReady);
  const scriptsReady = Boolean(latest && latest.scriptsReady === latest.segmentCount && latest.segmentCount >= latest.expectedSegments);
  const dualAudioReady = Boolean(latest && latest.andrewReady === latest.segmentCount && latest.jennyReady === latest.segmentCount);
  const uniqueSegments = Boolean(latest && latest.duplicateKeys?.length === 0);
  const preflightReady = preflight?.status === "ready";
  const sourceReport = parsePreflightReport(preflight?.report);
  const gateLabel = fullAudioReady ? "Published and verified" : scriptsReady ? "Audio preparation / review" : "Research and script gate";

  if (isLoading) return <div className="space-y-4"><div className="h-32 rounded-xl bg-muted animate-pulse" /><div className="h-64 rounded-xl bg-muted animate-pulse" /></div>;
  return (
    <div className="space-y-5">
      <section className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Editorial control room</p><h2 className="mt-1 text-lg font-bold">Daily Brief Operations</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Monitor the source gate, scripted editorial package, dual-voice audio, and public-release boundary from one protected workspace.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"><RefreshCw size={13} /> Refresh</button><a href="/podcast" className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">Open public brief</a></div></div>
        {!latest ? <p className="mt-5 text-sm text-muted-foreground">No Daily Brief record is available yet.</p> : <><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OpsMetric icon={ShieldCheck} label="Release state" value={gateLabel} tone={fullAudioReady ? "good" : "warn"} /><OpsMetric icon={Clock3} label="Latest brief" value={latest.friendlyDate || latest.date} detail={`${latest.segmentCount}/${latest.expectedSegments} segments · ${latest.durationLabel}`} /><OpsMetric icon={Headphones} label="Dual voice audio" value={`${latest.andrewReady}/${latest.segmentCount} Andrew · ${latest.jennyReady}/${latest.segmentCount} Jenny`} tone={dualAudioReady ? "good" : "warn"} /><OpsMetric icon={RefreshCw} label="Last dashboard sync" value={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Awaiting sync"} detail="Auto-refreshes every 30 sec" /></div><div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground"><p><strong className="text-foreground">Release rule:</strong> the public player is eligible only after the full episode, every Andrew segment, and every Jenny segment pass verification. Current status: <span className={fullAudioReady ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-semibold text-amber-700 dark:text-amber-300"}>{latest.verificationStatus}</span>.</p>{latest.verificationWarnings && <p className="mt-1"><strong className="text-foreground">Verifier note:</strong> {latest.verificationWarnings}</p>}</div></>}
      </section>
      <section className="glass-card rounded-xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wider">Publication-gate timeline</h3><p className="mt-1 text-xs text-muted-foreground">Each stage must pass in order; a held stage blocks public release rather than substituting a shortened briefing.</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${fullAudioReady ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{fullAudioReady ? "All gates passed" : "Publication held"}</span></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><PodcastGate icon={ListChecks} label="Source preflight" detail={preflight ? `${preflight.readyCount}/${preflight.topicCount} required topics ready` : "Awaiting first preflight record"} passed={preflightReady} /><PodcastGate icon={FileText} label="Script package" detail={latest ? `${latest.scriptsReady}/${latest.segmentCount} scripts · ${latest.segmentCount}/${latest.expectedSegments} expected` : "No episode record"} passed={scriptsReady && uniqueSegments} /><PodcastGate icon={Headphones} label="Segment audio" detail={latest ? `${latest.andrewReady}/${latest.segmentCount} Andrew · ${latest.jennyReady}/${latest.segmentCount} Jenny` : "No episode record"} passed={dualAudioReady} /><PodcastGate icon={CheckCircle2} label="Public release" detail={latest?.durationLabel || "Awaiting full episode"} passed={fullAudioReady} /></div></section>
      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><div className="glass-card rounded-xl p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wider">Source preflight monitor</h3><p className="mt-1 text-xs text-muted-foreground">Runs at 5:15 and 5:40 AM ET, then once again immediately before the 6:00 AM guarded generation attempt.</p></div>{preflight ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${preflightReady ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>{preflightReady ? "Ready" : "Blocked"}</span> : null}</div>{sourceReport?.results?.length ? <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">{sourceReport.results.map((item: any) => <SourcePreflightRow key={item.topic} item={item} />)}</div> : <p className="mt-4 text-sm text-muted-foreground">No saved source-preflight detail is available yet. The next scheduled preflight will populate this monitor.</p>}</div><div className="glass-card rounded-xl p-5"><h3 className="text-sm font-bold uppercase tracking-wider">Recovery runbook</h3><div className="mt-4 space-y-3 text-sm"><RunbookStep step="1" title="Preflight first" detail="A missing source blocks script generation before any partial episode is written."/><RunbookStep step="2" title="Resume safely" detail="The locked recovery checks at 7:30 and 8:30 AM ET reuse validated drafts rather than starting over."/><RunbookStep step="3" title="Preserve quality" detail="Scripts, Andrew audio, Jenny audio, and the verified full episode all remain mandatory."/><RunbookStep step="4" title="Escalate clearly" detail="Use the source monitor and recent runs below to identify a held topic before changing a source query."/></div></div></section>
      <section className="grid gap-5 xl:grid-cols-2"><div className="glass-card rounded-xl p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wider">Latest segment diagnostics</h3><p className="mt-1 text-xs text-muted-foreground">Per-segment script and dual-voice asset readiness.</p></div>{latest?.duplicateKeys?.length ? <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300"><AlertTriangle size={12} /> Duplicate key</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={12} /> Unique sequence</span>}</div><div className="mt-4 max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border/70">{(latest?.segments ?? []).map((segment: any) => <div key={segment.key} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 px-3 py-2 text-xs"><div className="min-w-0"><p className="truncate font-medium text-foreground">{segment.label}</p><p className="text-muted-foreground">{segment.durationLabel || "Duration pending"}</p></div><SegmentDot label="Script" passed={segment.hasScript} /><SegmentDot label="A" passed={segment.hasAndrewAudio} /><SegmentDot label="J" passed={segment.hasJennyAudio} /></div>)}{!latest?.segments?.length && <p className="p-4 text-sm text-muted-foreground">No segment diagnostics are available yet.</p>}</div></div><div className="glass-card rounded-xl p-5"><h3 className="text-sm font-bold uppercase tracking-wider">Publication and run history</h3><p className="mt-1 text-xs text-muted-foreground">Recent episodes and any stored pipeline rows, retained for operational accountability.</p><div className="mt-4 max-h-36 space-y-2 overflow-y-auto">{recentEpisodes.map((episode: any) => <div key={episode.date} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/50 px-3 py-2"><div><p className="text-sm font-medium">{episode.friendlyDate}</p><p className="mt-0.5 text-xs text-muted-foreground">{episode.segmentCount} segments · {episode.durationLabel || "Duration pending"}</p></div><span className={`shrink-0 text-xs font-semibold ${episode.verificationStatus === "passed" && episode.hasFullAudio ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{episode.verificationStatus === "passed" && episode.hasFullAudio ? "Verified" : "Held"}</span></div>)}{recentEpisodes.length === 0 && <p className="text-sm text-muted-foreground">No episode history is available yet.</p>}</div><div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent pipeline records</p>{recentRuns.length ? <div className="mt-2 space-y-2">{recentRuns.slice(0, 4).map((run: any) => <div key={run.id} className="flex items-center justify-between gap-3 text-xs"><span className="font-medium text-foreground">{run.episodeDate} · {run.triggeredBy}</span><span className={run.status === "success" ? "text-emerald-700 dark:text-emerald-300" : run.status === "failed" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}>{run.status}</span></div>)}</div> : <p className="mt-2 text-xs text-muted-foreground">No pipeline rows were recorded; episode and preflight diagnostics above remain the operational record.</p>}</div><div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Saved preflight history</p><div className="mt-2 space-y-1">{preflights.slice(0, 3).map((item: any) => <div key={item.episodeDate} className="flex items-center justify-between text-xs"><span>{item.episodeDate}</span><span className={item.status === "ready" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>{item.status} · {item.readyCount}/{item.topicCount}</span></div>)}</div></div></div></section>
    </div>
  );
}

function AdminMetric({ value, label }: { value: string | number; label: string }) {
  return <div className="px-3"><p className="text-xl font-bold text-foreground">{value}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p></div>;
}

function OpsMetric({ icon: Icon, label, value, detail, tone = "neutral" }: { icon: any; label: string; value: string; detail?: string; tone?: "good" | "warn" | "neutral" }) {
  const colors = tone === "good" ? "border-emerald-500/25 bg-emerald-500/5" : tone === "warn" ? "border-amber-500/25 bg-amber-500/5" : "border-border bg-background/50";
  return <div className={`rounded-lg border p-3 ${colors}`}><Icon size={15} className={tone === "good" ? "text-emerald-600 dark:text-emerald-300" : tone === "warn" ? "text-amber-600 dark:text-amber-300" : "text-primary"}/><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold text-foreground">{value}</p>{detail && <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>}</div>;
}

function PodcastGate({ icon: Icon, label, detail, passed }: { icon: any; label: string; detail: string; passed: boolean }) {
  return <div className={`rounded-lg border p-3 ${passed ? "border-emerald-500/25 bg-emerald-500/5" : "border-amber-500/25 bg-amber-500/5"}`}><Icon size={15} className={passed ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}/><p className="mt-2 text-xs font-semibold text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p><p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.1em] ${passed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{passed ? "Passed" : "Held safely"}</p></div>;
}

function SegmentDot({ label, passed }: { label: string; passed: boolean }) {
  return <span title={`${label}: ${passed ? "ready" : "missing"}`} className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${passed ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>{passed ? <Check size={11} /> : label}</span>;
}

function RunbookStep({ step, title, detail }: { step: string; title: string; detail: string }) {
  return <div className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 text-xs font-bold text-primary">{step}</span><div><p className="text-xs font-semibold text-foreground">{title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{detail}</p></div></div>;
}

function SourcePreflightRow({ item }: { item: any }) {
  const ready = item.status === "ready";
  return <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2"><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-foreground">{item.topic}</p><span className={`text-[10px] font-bold uppercase tracking-wide ${ready ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>{ready ? `${item.count} sources` : "Blocked"}</span></div><p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{ready ? item.sources?.join(" · ") : item.error || "Source coverage not sufficient"}</p></div>;
}

function parsePreflightReport(serialized?: string | null): any | null {
  if (!serialized) return null;
  try { const parsed = JSON.parse(serialized); return parsed && Array.isArray(parsed.results) ? parsed : null; } catch { return null; }
}

const RATINGS = ["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"];

function ElectionOpsTab() {
  const [chamber, setChamber] = useState<"senate" | "house" | "governors" | "referendums">("senate");
  const [houseSearch, setHouseSearch] = useState("");
  const { data: senateRaces = [] } = trpc.election.senate.useQuery();
  const { data: houseRaces = [] } = trpc.election.house.useQuery();
  const { data: governors = [] } = trpc.election.governors.useQuery();
  const { data: referendums = [] } = trpc.election.referendums.useQuery();

  const utils = trpc.useUtils();
  const updateSenate = trpc.election.updateSenate.useMutation({ onSuccess: () => utils.election.senate.invalidate() });
  const updateHouse = trpc.election.updateHouse.useMutation({ onSuccess: () => utils.election.house.invalidate() });
  const updateGovernor = trpc.election.updateGovernor.useMutation({ onSuccess: () => utils.election.governors.invalidate() });
  const updateReferendum = trpc.election.updateReferendum.useMutation({ onSuccess: () => utils.election.referendums.invalidate() });

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Election Data Editor</h2>
      <p className="text-xs text-muted-foreground mb-4">Edit race ratings, vote totals, and call winners. Changes save immediately.</p>

      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4 w-fit">
        {(["senate", "house", "governors", "referendums"] as const).map(c => (
          <button key={c} onClick={() => setChamber(c)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${chamber === c ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            {c}
          </button>
        ))}
      </div>

      {chamber === "senate" && (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {(senateRaces as any[]).map((race: any) => (
            <RaceEditor
              key={race.id}
              race={race}
              onSave={(data) => updateSenate.mutate({ id: race.id, data })}
              saving={updateSenate.isPending}
            />
          ))}
        </div>
      )}
      {chamber === "house" && (
        <div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={houseSearch}
              onChange={e => setHouseSearch(e.target.value)}
              placeholder="Search by state or district..."
              className="w-full pl-8 pr-3 py-2 bg-muted rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {(houseRaces as any[]).filter((r: any) => {
            if (!houseSearch) return true;
            const q = houseSearch.toLowerCase();
            return r.stateName?.toLowerCase().includes(q) || r.stateCode?.toLowerCase().includes(q) || `${r.stateName} ${r.district}`.toLowerCase().includes(q) || r.candidate1Name?.toLowerCase().includes(q) || r.candidate2Name?.toLowerCase().includes(q);
          }).map((race: any) => (
            <RaceEditor
              key={race.id}
              race={race}
              onSave={(data) => updateHouse.mutate({ id: race.id, data })}
              saving={updateHouse.isPending}
              showDistrict
            />
          ))}
          </div>
        </div>
      )}
      {chamber === "governors" && (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {(governors as any[]).map((race: any) => (
            <GovEditor
              key={race.id}
              race={race}
              onSave={(data) => updateGovernor.mutate({ id: race.id, data })}
              saving={updateGovernor.isPending}
            />
          ))}
        </div>
      )}
      {chamber === "referendums" && (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {(referendums as any[]).map((ref: any) => (
            <RefEditor
              key={ref.id}
              referendum={ref}
              onSave={(data) => updateReferendum.mutate({ id: ref.id, data })}
              saving={updateReferendum.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RaceEditor({ race, onSave, saving, showDistrict }: { race: any; onSave: (data: any) => void; saving: boolean; showDistrict?: boolean }) {
  const [rating, setRating] = useState(race.rating ?? "");
  const [calledWinner, setCalledWinner] = useState(race.calledWinner ?? "");
  const [calledParty, setCalledParty] = useState(race.calledParty ?? "");
  const [notes, setNotes] = useState(race.notes ?? "");
  const [pctReporting, setPctReporting] = useState(race.pctReporting?.toString() ?? "0");
  const [votes1, setVotes1] = useState(race.candidate1Votes?.toString() ?? "0");
  const [votes2, setVotes2] = useState(race.candidate2Votes?.toString() ?? "0");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      rating: rating || null,
      calledWinner: calledWinner || null,
      calledParty: calledParty || null,
      notes: notes || null,
      pctReporting: parseFloat(pctReporting) || 0,
      candidate1Votes: parseInt(votes1) || 0,
      candidate2Votes: parseInt(votes2) || 0,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold min-w-[120px]">
          {race.stateName}{showDistrict && race.district ? ` - D${race.district}` : ""}
        </span>
        <select value={rating} onChange={e => setRating(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs">
          <option value="">No Rating</option>
          {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          value={calledWinner}
          onChange={e => setCalledWinner(e.target.value)}
          placeholder="Called winner"
          className="bg-muted rounded px-2 py-1 text-xs w-28"
        />
        <select value={calledParty} onChange={e => setCalledParty(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs">
          <option value="">Party</option>
          <option value="D">D</option>
          <option value="R">R</option>
          <option value="I">I</option>
        </select>
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Race notes"
          className="bg-muted rounded px-2 py-1 text-xs w-36"
        />
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={pctReporting}
            onChange={e => setPctReporting(e.target.value)}
            className="bg-muted rounded px-2 py-1 text-xs w-16"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="0"
            value={votes1}
            onChange={e => setVotes1(e.target.value)}
            placeholder="Votes D"
            className="bg-muted rounded px-2 py-1 text-xs w-20"
          />
          <span className="text-xs text-muted-foreground">vs</span>
          <input
            type="number"
            min="0"
            value={votes2}
            onChange={e => setVotes2(e.target.value)}
            placeholder="Votes R"
            className="bg-muted rounded px-2 py-1 text-xs w-20"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={12} /> : <Save size={12} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function GovEditor({ race, onSave, saving }: { race: any; onSave: (data: any) => void; saving: boolean }) {
  const [rating, setRating] = useState(race.rating ?? "");
  const [calledWinner, setCalledWinner] = useState(race.calledWinner ?? "");
  const [notes, setNotes] = useState(race.notes ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ rating: rating || null, calledWinner: calledWinner || null, notes: notes || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold min-w-[120px]">{race.stateName}</span>
        <span className="text-xs text-muted-foreground">{race.demCandidate ?? "TBD"} (D) vs {race.repCandidate ?? "TBD"} (R)</span>
        <select value={rating} onChange={e => setRating(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs">
          <option value="">No Rating</option>
          {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input
          value={calledWinner}
          onChange={e => setCalledWinner(e.target.value)}
          placeholder="Called winner"
          className="bg-muted rounded px-2 py-1 text-xs w-28"
        />
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Race notes"
          className="bg-muted rounded px-2 py-1 text-xs w-40"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={12} /> : <Save size={12} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function RefEditor({ referendum, onSave, saving }: { referendum: any; onSave: (data: any) => void; saving: boolean }) {
  const [result, setResult] = useState(referendum.result ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ result: result || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold min-w-[120px]">{referendum.stateName} - {referendum.measureId}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{referendum.title}</span>
        <select value={result} onChange={e => setResult(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs">
          <option value="">Pending</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={12} /> : <Save size={12} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function CbcOpsTab() {
  const [search, setSearch] = useState("");
  const { data: members = [] } = trpc.election.cbc.useQuery();
  const { data: elections = [] } = trpc.election.blackRepresentationElections.useQuery();
  const utils = trpc.useUtils();
  const updateCbc = trpc.election.updateCbc.useMutation({ onSuccess: () => utils.election.cbc.invalidate() });
  const updateElection = trpc.election.updateBlackRepresentationElection.useMutation({ onSuccess: () => utils.election.blackRepresentationElections.invalidate() });

  const filtered = (members as any[]).filter((m: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.member?.toLowerCase().includes(q) || m.district?.toLowerCase().includes(q) || m.state?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Black Representation Editor</h2>
      <p className="text-xs text-muted-foreground mb-4">Manage people, primary context, source links, and the article-backed contest ledger.</p>
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, district, or state..."
          className="w-full pl-8 pr-3 py-2 bg-muted rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((m: any) => (
          <CbcEditor key={m.id} member={m} onSave={(data) => updateCbc.mutate({ id: m.id, data })} saving={updateCbc.isPending} />
        ))}
      </div>
      <h3 className="text-sm font-bold mt-8 mb-3">Article-Backed Election Results</h3>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {(elections as any[]).filter((race: any) => !search || `${race.state} ${race.district} ${race.winnerName} ${race.runnerUpName}`.toLowerCase().includes(search.toLowerCase())).map((race: any) => (
          <BlackRepresentationElectionEditor key={race.id} race={race} onSave={(data: any) => updateElection.mutate({ id: race.id, data })} saving={updateElection.isPending} />
        ))}
      </div>
    </div>
  );
}

function CbcEditor({ member, onSave, saving }: { member: any; onSave: (data: any) => void; saving: boolean }) {
  const [status, setStatus] = useState(member.cbcStatus ?? "running");
  const [primaryResult, setPrimaryResult] = useState(member.primaryResult ?? "");
  const [notes, setNotes] = useState(member.notes ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ cbcStatus: status, primaryResult: primaryResult || null, notes: notes || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-bold min-w-[140px]">{member.member}</span>
        <span className="text-xs text-muted-foreground">{member.district}</span>
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs">
          <option value="running">Running</option>
          <option value="retiring">Retiring</option>
          <option value="resigned">Resigned</option>
          <option value="deceased">Deceased</option>
          <option value="lost_primary">Lost Primary</option>
          <option value="running_for_governor">Running for Gov</option>
          <option value="running_for_senate">Running for Senate</option>
          <option value="not_up_2026">Not Up 2026</option>
          <option value="challenger">Challenger</option>
          <option value="advanced_to_general">Advanced to General</option>
          <option value="in_runoff">In Runoff</option>
          <option value="too_close_to_call">Too Close to Call</option>
        </select>
        <input
          value={primaryResult}
          onChange={e => setPrimaryResult(e.target.value)}
          placeholder="Primary result"
          className="bg-muted rounded px-2 py-1 text-xs w-36"
        />
        <input
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notes"
          className="bg-muted rounded px-2 py-1 text-xs flex-1 min-w-[120px]"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          {saved ? <Check size={12} /> : <Save size={12} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function BlackRepresentationElectionEditor({ race, onSave, saving }: { race: any; onSave: (data: any) => void; saving: boolean }) {
  const [resultStatus, setResultStatus] = useState(race.resultStatus ?? "upcoming");
  const [winnerName, setWinnerName] = useState(race.winnerName ?? "");
  const [winnerVotes, setWinnerVotes] = useState(race.winnerVotes?.toString() ?? "");
  const [winnerVotePct, setWinnerVotePct] = useState(race.winnerVotePct?.toString() ?? "");
  const [generalOpponent, setGeneralOpponent] = useState(race.generalOpponent ?? "");
  const [sourceUrl, setSourceUrl] = useState(race.sourceUrl ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      resultStatus,
      winnerName: winnerName || null,
      winnerVotes: winnerVotes ? parseInt(winnerVotes) : null,
      winnerVotePct: winnerVotePct || null,
      generalOpponent: generalOpponent || null,
      sourceUrl: sourceUrl || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card rounded-lg p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold min-w-[110px]">{race.district}</span>
        <span className="text-xs text-muted-foreground">{race.electionType} · {race.partyContest ?? "all-party"}</span>
        <select value={resultStatus} onChange={e => setResultStatus(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs">
          <option value="called">Called</option>
          <option value="uncontested">Uncontested</option>
          <option value="too_close_to_call">Too Close</option>
          <option value="upcoming">Upcoming</option>
        </select>
        <input value={winnerName} onChange={e => setWinnerName(e.target.value)} placeholder="Winner" className="bg-muted rounded px-2 py-1 text-xs w-32" />
        <input value={winnerVotes} onChange={e => setWinnerVotes(e.target.value)} placeholder="Votes" type="number" className="bg-muted rounded px-2 py-1 text-xs w-24" />
        <input value={winnerVotePct} onChange={e => setWinnerVotePct(e.target.value)} placeholder="Pct" type="number" step="0.1" className="bg-muted rounded px-2 py-1 text-xs w-16" />
        <input value={generalOpponent} onChange={e => setGeneralOpponent(e.target.value)} placeholder="General opponent" className="bg-muted rounded px-2 py-1 text-xs w-36" />
        <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="Source URL" className="bg-muted rounded px-2 py-1 text-xs flex-1 min-w-[180px]" />
        <button onClick={handleSave} disabled={saving} className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors disabled:opacity-50">
          {saved ? <Check size={12} /> : <Save size={12} />}{saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function AudienceTab() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Audience Insights</h2>
      <p className="text-muted-foreground text-sm">Analytics and subscriber data will appear here once traffic is established.</p>
    </div>
  );
}

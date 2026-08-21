import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { AgentDeskTab } from "@/components/AgentDeskTab";
import { AgentProposedChangesTab } from "@/components/AgentProposedChangesTab";
import { PortraitReviewTab } from "@/components/PortraitReviewTab";
import { PodcastPublishingKit } from "@/components/PodcastPublishingKit";
import { ElectionDayCommandCenterTab } from "@/components/ElectionDayCommandCenterTab";
import { ElectionResultsControlRoomTab } from "@/components/ElectionResultsControlRoomTab";
import { AtlasOperationsAdmin } from "@/components/AtlasOperationsAdmin";
import { CandidateChangesTab } from "@/components/CandidateChangesTab";
import MiniRepositoryGlobe from "@/components/MiniRepositoryGlobe";
import { rankedWorldSignals, worldSignalLabel } from "@/lib/worldElectionDisplay";
import { getAdminElectionEngineBadge } from "@/lib/electionFreshness";
import { buildAdminCandidateRows, type AdminCandidateCategory } from "@/lib/adminCandidates";
import { getOfficialPortraitSourceLeads } from "@/lib/portraitSourceLeads";
import { getAdminFreshness } from "@/lib/adminFreshness";
import { useEffect, useState, useMemo } from "react";
import { ArrowUpRight, Shield, Radio, MapPin, Users, Save, Check, Search, SearchCheck, Star, Sparkles, AlertTriangle, CheckCircle2, Clock3, FileText, Headphones, ListChecks, RefreshCw, ShieldCheck, ImagePlus, FileDiff, Radar, Globe2, ExternalLink, BarChart3, Monitor, Smartphone, TabletSmartphone, MousePointerClick, BellRing, Trash2 } from "lucide-react";

type AdminTab = "overview" | "command" | "results" | "podcast" | "elections" | "candidateChanges" | "candidates" | "cbc" | "atlasWorld" | "agent" | "changes" | "portraits" | "audience";

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>(() => {
    const requested = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("tab");
    return requested === "command" || requested === "results" || requested === "podcast" || requested === "elections" || requested === "candidateChanges" || requested === "candidates" || requested === "cbc" || requested === "atlasWorld" || requested === "agent" || requested === "changes" || requested === "portraits" || requested === "audience" ? requested : "overview";
  });
  const [focusRecommendationId, setFocusRecommendationId] = useState<number | undefined>();
  const [portraitTargetKey, setPortraitTargetKey] = useState<string | undefined>();
  const [blackRepresentationSearch, setBlackRepresentationSearch] = useState("");
  const [governorCandidateSearch, setGovernorCandidateSearch] = useState("");

  const navigateToTab = (nextTab: AdminTab) => {
    setTab(nextTab);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (nextTab === "overview") params.delete("tab");
    else params.set("tab", nextTab);
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  };

  const openActivePortraitBatch = () => {
    setPortraitTargetKey(undefined);
    navigateToTab("portraits");
    window.setTimeout(() => {
      document.getElementById("portrait-research-batch")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };
  const openCandidatePortrait = (targetKey?: string) => {
    setPortraitTargetKey(targetKey);
    navigateToTab("portraits");
  };
  const openBlackRepresentationRecord = (candidateName: string) => {
    setBlackRepresentationSearch(candidateName);
    navigateToTab("cbc");
  };
  const openGovernorCandidateEditor = (location: string) => {
    setGovernorCandidateSearch(location.replace(/\s+Governor$/i, ""));
    navigateToTab("elections");
  };

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

      <div className="mb-6 max-w-full overflow-x-auto pb-1">
        <div className="flex w-max min-w-full gap-1 rounded-lg bg-muted p-1 lg:w-full lg:flex-wrap">
          {([
          { key: "overview", label: "Overview", icon: Shield },
          { key: "command", label: "Command Center", icon: Radar },
          { key: "results", label: "Results Control Room", icon: Radio },
          { key: "podcast", label: "Podcast Ops", icon: Radio },
          { key: "elections", label: "Election Ops", icon: MapPin },
          { key: "candidateChanges", label: "Candidate Changes", icon: Users },
          { key: "candidates", label: "Candidates", icon: Users },
          { key: "cbc", label: "Black Representation", icon: Star },
          { key: "atlasWorld", label: "Atlas & World", icon: Globe2 },
          { key: "agent", label: "Agent Desk", icon: Sparkles },
          { key: "changes", label: "Proposed Changes", icon: FileDiff },
          { key: "portraits", label: "Portrait Review", icon: ImagePlus },
          { key: "audience", label: "Audience & Visits", icon: BarChart3 },
        ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => navigateToTab(key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/[0.045] px-4 py-3">
        <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Portrait operations</p><p className="mt-1 text-sm text-muted-foreground">Open the active research batch, filter its status, and inspect source packages before any portrait reaches the public record.</p></div>
        <button onClick={openActivePortraitBatch} className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90"><ImagePlus size={14} /> Open active batch</button>
      </div>

      {tab === "overview" && <OverviewTab onReview={(id) => { setFocusRecommendationId(id); navigateToTab("agent"); }} onNavigate={(destination) => destination === "portraits" ? openActivePortraitBatch() : navigateToTab(destination)} onNavigateAdmin={navigateToTab} />}
      {tab === "command" && <ElectionDayCommandCenterTab />}
      {tab === "results" && <ElectionResultsControlRoomTab />}
      {tab === "podcast" && <PodcastOpsTab />}
      {tab === "elections" && <ElectionOpsTab initialGovernorSearch={governorCandidateSearch} />}
      {tab === "candidateChanges" && <CandidateChangesTab onManageGovernor={openGovernorCandidateEditor} />}
      {tab === "candidates" && <CandidatesOpsTab onOpenPortraits={openCandidatePortrait} onManageBlackRepresentation={openBlackRepresentationRecord} onManageGovernor={openGovernorCandidateEditor} />}
      {tab === "cbc" && <CbcOpsTab initialSearch={blackRepresentationSearch} />}
      {tab === "atlasWorld" && <AtlasWorldOpsTab />}
      {tab === "agent" && <AgentDeskTab focusRecommendationId={focusRecommendationId} />}
      {tab === "changes" && <AgentProposedChangesTab />}
      {tab === "portraits" && <PortraitReviewTab initialTargetKey={portraitTargetKey} />}
      {tab === "audience" && <AudienceTab />}
    </div>
  );
}

function OverviewTab({ onReview, onNavigate, onNavigateAdmin }: { onReview: (id: number) => void; onNavigate: (destination: "agent" | "changes" | "portraits") => void; onNavigateAdmin: (destination: AdminTab) => void }) {
  const liveRefresh = { refetchInterval: 60_000 };
  const { data: scoreboard } = trpc.election.scoreboard.useQuery(undefined, liveRefresh);
  const { data: episodes } = trpc.podcast.getEpisodes.useQuery(undefined, liveRefresh);
  const { data: senateRaces } = trpc.election.senate.useQuery(undefined, liveRefresh);
  const { data: houseRaces } = trpc.election.house.useQuery(undefined, liveRefresh);
  const { data: governors } = trpc.election.governors.useQuery(undefined, liveRefresh);
  const { data: electionFreshness } = trpc.election.freshness.useQuery(undefined, liveRefresh);
  const { data: priorityRecommendations = [] } = trpc.agent.recommendations.useQuery({ status: "pending", priority: "high" });
  const { data: agentSettings } = trpc.agent.settings.useQuery();
  const { data: dailyAgentSummary } = trpc.agent.dailySummary.useQuery(undefined, { refetchInterval: 60_000 });
  const { data: agentTasks = [] } = trpc.agent.tasks.useQuery();
  const { data: pendingChanges = [] } = trpc.agent.changeProposals.useQuery({ status: "pending_review" });
  const { data: pendingPortraits = [] } = trpc.portraits.submissions.useQuery({ status: "pending" });
  const { data: portraitResearchBatch } = trpc.portraits.latestResearchBatch.useQuery();
  const { data: worldElections = [] } = trpc.world.elections.useQuery(undefined, liveRefresh);
  const { data: worldRefresh, refetch: refetchWorldRefresh } = trpc.world.refreshOperations.useQuery(undefined, liveRefresh);
  const runWorldRefresh = trpc.world.runRefreshNow.useMutation({ onSuccess: () => refetchWorldRefresh() });
  const [priorityOwner, setPriorityOwner] = useState("all");

  // Calculate live polling status
  const liveRaces = (senateRaces as any[] ?? []).filter((r: any) => r.pctReporting > 0).length
    + (houseRaces as any[] ?? []).filter((r: any) => r.pctReporting > 0).length
    + (governors as any[] ?? []).filter((r: any) => r.pctReporting > 0).length;
  const engineBadge = getAdminElectionEngineBadge(electionFreshness);
  const isLive = engineBadge.tone === "live";
  const engineBadgeClass = engineBadge.tone === "live" ? "bg-red-500/20 text-red-400" : engineBadge.tone === "warning" ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground";
  const ownerOptions = Array.from(new Set((priorityRecommendations as any[]).map((item) => item.assignedTo).filter(Boolean))) as string[];
  const visiblePriorityRecommendations = (priorityRecommendations as any[]).filter((item) => priorityOwner === "all" || (priorityOwner === "unassigned" ? !item.assignedTo : item.assignedTo === priorityOwner));
  const now = Date.now();
  const reminderTasks = (agentTasks as any[]).filter((task) => task.status !== "completed" && task.dueDate).map((task) => ({ ...task, dueAt: new Date(task.dueDate).getTime() })).filter((task) => Number.isFinite(task.dueAt));
  const overdueTasks = reminderTasks.filter((task) => task.dueAt < now).sort((a, b) => a.dueAt - b.dueAt);
  const upcomingTasks = reminderTasks.filter((task) => task.dueAt >= now && task.dueAt <= now + 3 * 24 * 60 * 60 * 1000).sort((a, b) => a.dueAt - b.dueAt);
  const worldRecords = worldElections as any[];
  const worldUpcoming = worldRecords.filter((record) => record.status === "Upcoming").length;
  const worldLive = worldRecords.filter((record) => record.status === "Voting Today").length;
  const worldRefreshSettings = worldRefresh?.settings as any;
  const worldRefreshItems = worldRefresh?.items as any[] ?? [];
  const worldRefreshChanges = worldRefreshItems.filter((item) => item.lastStatus === "changed").length;
  const portraitsReadyForReview = portraitResearchBatch?.byStatus?.ready_for_review ?? 0;
  const latestEpisode = (episodes as any[] ?? [])[0];
  const freshnessRows = [
    { label: "Election Watch", value: engineBadge.label, timestamp: electionFreshness?.heartbeatAt, detail: `${electionFreshness?.mode ?? "unknown"} · ${electionFreshness?.sourceHealth ?? "unknown"}`, tone: engineBadge.tone === "warning" ? "warn" as const : "good" as const, destination: "command" as const },
    { label: "Daily Brief", value: latestEpisode?.verificationStatus === "passed" ? "Verified" : latestEpisode ? "Held" : "Awaiting", timestamp: latestEpisode?.updatedAt ?? dailyAgentSummary?.updatedAt, detail: latestEpisode?.date ? `${latestEpisode.date} · ${latestEpisode?.segmentCount ?? 0} segments` : "No current episode record", tone: latestEpisode?.verificationStatus === "passed" ? "good" as const : "warn" as const, destination: "podcast" as const },
    { label: "World Elections", value: worldRefreshSettings?.lastError ? "Needs review" : worldRefreshChanges ? "Review queued" : "Monitored", timestamp: worldRefreshSettings?.lastSuccessAt ?? worldRefreshSettings?.lastRunAt, detail: worldRefreshSettings?.lastError || (worldRefreshChanges ? `${worldRefreshChanges} source changes awaiting review` : "Review-only monitor active"), tone: worldRefreshSettings?.lastError || worldRefreshChanges ? "warn" as const : "good" as const, destination: "atlasWorld" as const },
    { label: "Research & Portraits", value: dailyAgentSummary?.agentRunStatus === "failed" ? "Needs review" : "Tracked", timestamp: dailyAgentSummary?.updatedAt ?? dailyAgentSummary?.generatedAt, detail: dailyAgentSummary ? `${dailyAgentSummary.pendingRecommendations} recommendations · ${dailyAgentSummary.pendingPortraitReviews} portrait reviews` : "Awaiting operational snapshot", tone: dailyAgentSummary?.agentRunStatus === "failed" ? "warn" as const : "good" as const, destination: "agent" as const },
  ];
  const decisionItems: Array<{ id: string; title: string; detail: string; type: string; destination: "agent" | "changes" | "portraits"; recommendationId?: number }> = [
    ...(pendingChanges as any[]).slice(0, 2).map((item) => ({ id: `change-${item.id}`, title: item.title, detail: "Agent change set awaiting decision", type: "Change set", destination: "changes" as const })),
    ...(portraitsReadyForReview > 0 ? [{ id: "portrait-research-ready", title: `${portraitsReadyForReview} portrait research findings ready to inspect`, detail: "Open Portrait Review to filter the active batch and inspect source packages.", type: "Portrait research", destination: "portraits" as const }] : []),
    ...(pendingPortraits as any[]).slice(0, 2).map((item) => ({ id: `portrait-${item.id}`, title: item.candidateName, detail: "Portrait and provenance awaiting review", type: "Portrait", destination: "portraits" as const })),
    ...overdueTasks.slice(0, 2).map((item) => ({ id: `task-${item.id}`, title: item.title, detail: `Overdue · ${item.owner ?? "Unassigned"}`, type: "Task", destination: "agent" as const })),
    ...visiblePriorityRecommendations.slice(0, 2).map((item) => ({ id: `recommendation-${item.id}`, title: item.title, detail: item.proposedAction, type: "Priority", destination: "agent" as const, recommendationId: item.id })),
  ].slice(0, 5);

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

      <section className="glass-card rounded-xl border border-sky-500/25 bg-sky-500/[0.035] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><Clock3 size={16} className="text-sky-600 dark:text-sky-300" /> Operational data freshness</h3><p className="mt-1 max-w-2xl text-xs text-muted-foreground">This dashboard rechecks its election, briefing, World Elections, and review signals every minute while open. Each card shows the last durable update rather than implying a live value when one is unavailable.</p></div><span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-sky-700 dark:text-sky-300">60-second Admin refresh</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{freshnessRows.map((row) => <AdminFreshnessCard key={row.label} {...row} onOpen={() => onNavigateAdmin(row.destination)} />)}</div>
      </section>

      <div className="glass-card rounded-xl border border-primary/25 bg-primary/[0.035] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><Radio size={16} className="text-primary" /> Morning agent summary</h3><p className="mt-1 max-w-2xl text-xs text-muted-foreground">A durable record written by the Daily Brief guard after its morning production outcome. It preserves what the automation found instead of relying on transient logs.</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${dailyAgentSummary?.briefStatus === "passed" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : dailyAgentSummary ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>{dailyAgentSummary ? `${dailyAgentSummary.snapshotDate} · ${dailyAgentSummary.briefStatus}` : "Awaiting next morning run"}</span></div>
        {dailyAgentSummary ? <><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><OpsMetric icon={FileText} label="Brief structure" value={`${dailyAgentSummary.briefSegmentCount}/15`} detail={`${dailyAgentSummary.briefSourceReadyCount} segments with sources`} tone={dailyAgentSummary.briefSegmentCount >= 15 ? "good" : "warn"} /><OpsMetric icon={CheckCircle2} label="Andrew full" value={dailyAgentSummary.andrewFullReady ? "Ready" : "Held"} detail="Continuous episode file" tone={dailyAgentSummary.andrewFullReady ? "good" : "warn"} /><OpsMetric icon={CheckCircle2} label="Jenny full" value={dailyAgentSummary.jennyFullReady ? "Ready" : "Held"} detail="Continuous episode file" tone={dailyAgentSummary.jennyFullReady ? "good" : "warn"} /><OpsMetric icon={SearchCheck} label="Agent queue" value={String(dailyAgentSummary.openAgentTasks)} detail={`${dailyAgentSummary.pendingRecommendations} recommendations pending`} tone={dailyAgentSummary.openAgentTasks > 0 ? "warn" : "good"} /><OpsMetric icon={ImagePlus} label="Portrait evidence" value={String(dailyAgentSummary.portraitEvidenceNeeded)} detail={`${dailyAgentSummary.pendingPortraitReviews} visual reviews pending`} tone={dailyAgentSummary.portraitEvidenceNeeded > 0 ? "warn" : "good"} /></div><p className="mt-3 text-xs text-muted-foreground">{dailyAgentSummary.summary}</p></> : <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">The first durable summary will appear after the next Daily Brief guard completes. Current live operational cards remain available below.</p>}
      </div>

      <div className="glass-card rounded-xl border border-amber-500/25 bg-amber-500/[0.045] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><AlertTriangle size={16} className="text-amber-600 dark:text-amber-300" /> Needs Decision Now</h3><p className="mt-1 text-xs text-muted-foreground">The most time-sensitive private work across proposed changes, portrait review, overdue tasks, and Election Day priority research.</p></div><span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">{decisionItems.length} queued</span></div>
        {decisionItems.length ? <div className="mt-4 grid gap-2 lg:grid-cols-2 xl:grid-cols-3">{decisionItems.map((item) => <button key={item.id} onClick={() => item.recommendationId ? onReview(item.recommendationId) : onNavigate(item.destination)} className="rounded-lg border border-border/70 bg-background/60 p-3 text-left transition-colors hover:border-primary/45 hover:bg-primary/5"><div className="flex items-center justify-between gap-2"><span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.11em] text-primary">{item.type}</span><ArrowUpRight size={13} className="text-primary" /></div><p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.detail}</p></button>)}</div> : <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">No immediate human decisions are waiting. New agent work and portrait submissions will appear here first.</p>}
      </div>

      {/* DDHQ Sync Status */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          DDHQ Election Engine Status
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${engineBadgeClass}`}><span className={`w-2 h-2 rounded-full ${isLive ? "bg-red-500 animate-pulse" : engineBadge.tone === "warning" ? "bg-amber-500" : "bg-muted-foreground/60"}`} />{engineBadge.label}</span>
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
            <p className="text-muted-foreground text-xs">Displayed reporting</p>
            <p className="font-bold">{liveRaces} race{liveRaces === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
          <p><strong>Cloud Computer:</strong> 35.229.72.71 — Polling every 60s when active</p>
          <p><strong>Data Source:</strong> DDHQ Public API (same feed as Fox News/Newsweek)</p>
          <p><strong>Heartbeat:</strong> {engineBadge.mode} · {electionFreshness?.heartbeatAt ? new Date(electionFreshness.heartbeatAt).toLocaleString() : "No heartbeat recorded"} · source {electionFreshness?.sourceHealth ?? "unknown"}</p>
          <p><strong>To start live polling:</strong> SSH → <code className="bg-muted px-1 rounded">cd /home/ubuntu/bpn-automation && node scripts/election-engine.mjs poll</code></p>
        </div>
      </div>

      <div className="glass-card rounded-xl border border-primary/20 bg-primary/[0.035] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><RefreshCw size={16} className="text-primary" /> Homepage refresh health</h3><p className="mt-1 max-w-2xl text-xs text-muted-foreground">The public homepage re-reads approved election and Black Representation records every minute while a visitor keeps the page open. Editorial content refreshes every five minutes; the page itself never writes election data. The results engine polls only during configured general-election windows, while reviewed primary context is displayed separately in Election Ops.</p></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">Approved-record refresh</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OpsMetric icon={RefreshCw} label="Election & representation" value="60 sec" detail="Visitor-side approved-record refresh" tone="good" /><OpsMetric icon={FileText} label="News, brief & Atlas" value="5 min" detail="Visitor-side read refresh" tone="good" /><OpsMetric icon={Radio} label="General-election engine" value={electionFreshness?.heartbeatAt ? new Date(electionFreshness.heartbeatAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Awaiting signal"} detail={`${electionFreshness?.mode ?? "unknown"} · ${electionFreshness?.sourceHealth ?? "unknown"}`} tone={engineBadge.tone === "warning" ? "warn" : "neutral"} /><OpsMetric icon={SearchCheck} label="Primary context" value="Review required" detail="Shown separately; never auto-called" tone="neutral" /></div>
      </div>

      <div className="glass-card overflow-hidden rounded-xl p-0">
        <div className="grid min-h-[180px] md:grid-cols-[220px_1fr]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_68%_30%,rgba(56,189,248,0.5),transparent_46%),linear-gradient(135deg,#061426,#0d315c)]">
            <div className="absolute inset-0"><MiniRepositoryGlobe theme="dark" vibrant /></div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded border border-cyan-100/20 bg-slate-950/50 px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-50">World Elections monitor</div>
          </div>
          <div className="flex flex-col justify-center p-5">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold uppercase tracking-wider">Global Elections Desk</h3><p className="mt-1 text-xs text-muted-foreground">Operational snapshot of the public World Elections calendar.</p></div><div className="flex gap-2"><button onClick={() => runWorldRefresh.mutate()} disabled={runWorldRefresh.isPending} className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50">{runWorldRefresh.isPending ? "Refreshing…" : "Refresh sources now"}</button><a href="/world" className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-primary">Open World Elections</a></div></div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-border text-center"><AdminMetric value={worldRecords.length} label="Tracked" /><AdminMetric value={worldUpcoming} label="Upcoming" /><AdminMetric value={worldLive} label="Voting today" /></div>
            <div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground"><div className="flex flex-wrap items-center justify-between gap-2"><p><strong className="text-foreground">Dated source refresh:</strong> {worldRefreshSettings?.lastSummary ?? "Baseline pending"}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${worldRefreshChanges ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{worldRefreshChanges ? `${worldRefreshChanges} review items` : "No changes queued"}</span></div><p className="mt-1">The workflow fingerprints dated source evidence and routes changes to Data Desk review; it never changes the public calendar automatically.</p></div>
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
  const { data: qaScorecard } = trpc.podcast.qaScorecard.useQuery(undefined, { refetchInterval: 30_000 });
  const utils = trpc.useUtils();
  const recoveryRequest = trpc.podcast.requestRecovery.useMutation({
    onSuccess: () => { void utils.podcast.operations.invalidate(); void refetch(); },
  });
  const guardedRecoveryRequest = trpc.podcast.requestCurrentGuardedRecovery.useMutation({
    onSuccess: () => { void utils.podcast.operations.invalidate(); void refetch(); },
  });
  const latest = (operations as any)?.latest;
  const preflight = (operations as any)?.latestPreflight;
  const recentEpisodes = (operations as any)?.recentEpisodes ?? [];
  const recentRuns = (operations as any)?.recentRuns ?? [];
  const preflights = (operations as any)?.preflights ?? [];
  const recoveryRequests = (operations as any)?.recoveryRequests ?? [];
  const today = (operations as any)?.today;
  const todayGate = today?.gate;
  const todayPreflight = today?.preflight;
  const todayAlert = today?.alert;
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
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Editorial control room</p><h2 className="mt-1 text-lg font-bold">Daily Brief Operations</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Monitor the source gate, paired full episodes, dual-voice audio, and public-release boundary from one protected workspace.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"><RefreshCw size={13} /> Refresh</button><a href="/podcast" className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">Open public brief</a></div></div>
        {!latest ? <p className="mt-5 text-sm text-muted-foreground">No Daily Brief record is available yet.</p> : <><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OpsMetric icon={ShieldCheck} label="Release state" value={gateLabel} tone={fullAudioReady ? "good" : "warn"} /><OpsMetric icon={Clock3} label="Latest brief" value={latest.friendlyDate || latest.date} detail={`${latest.segmentCount}/${latest.expectedSegments} segments · ${latest.durationLabel}`} /><OpsMetric icon={Headphones} label="Dual voice audio" value={`${latest.andrewReady}/${latest.segmentCount} Andrew · ${latest.jennyReady}/${latest.segmentCount} Jenny`} tone={dualAudioReady ? "good" : "warn"} /><OpsMetric icon={RefreshCw} label="Last dashboard sync" value={dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "Awaiting sync"} detail="Auto-refreshes every 30 sec" /></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><PodcastGate icon={Headphones} label="Andrew full episode" detail={latest.andrewFullAudioReady ? "Continuous Andrew mix verified" : "Andrew mix unavailable"} passed={Boolean(latest.andrewFullAudioReady)} /><PodcastGate icon={Headphones} label="Jenny full episode" detail={latest.jennyFullAudioReady ? "Continuous Jenny mix verified" : "Jenny mix unavailable; release stays held"} passed={Boolean(latest.jennyFullAudioReady)} /></div><div className="mt-4 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground"><p><strong className="text-foreground">Release rule:</strong> the public player is eligible only after both full episodes and every Andrew and Jenny segment pass verification. Current status: <span className={fullAudioReady ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-semibold text-amber-700 dark:text-amber-300"}>{latest.verificationStatus}</span>.</p>{latest.verificationWarnings && <p className="mt-1"><strong className="text-foreground">Verifier note:</strong> {latest.verificationWarnings}</p>}</div></>}
      </section>
      <section className={`rounded-xl border p-5 ${todayGate?.passed ? "border-emerald-500/30 bg-emerald-500/[0.045]" : "border-amber-500/35 bg-amber-500/[0.055]"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Morning gate watch</p><h3 className="mt-1 flex items-center gap-2 text-base font-bold"><BellRing size={16} className={todayGate?.passed ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"} /> {today?.date ?? "Today"} Daily Brief</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">At 6:30 AM ET, the operations alert checks current source preflight plus the verified Andrew and Jenny full episodes. It sends one owner alert only when the full release gate remains held.</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${todayGate?.passed ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>{todayGate?.passed ? "Gate passed" : "Attention needed"}</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3"><OpsMetric icon={SearchCheck} label="Source preflight" value={todayPreflight ? `${todayPreflight.readyCount}/${todayPreflight.topicCount} ready` : "Awaiting preflight"} detail={todayPreflight?.checkedAt ? `Checked ${new Date(todayPreflight.checkedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "5:15 and 5:40 AM ET checks"} tone={todayGate?.preflightReady ? "good" : "warn"} /><OpsMetric icon={Headphones} label="Full voice gate" value={todayGate?.fullAudioReady ? "Andrew + Jenny ready" : "Held safely"} detail="Both continuous episode files required" tone={todayGate?.fullAudioReady ? "good" : "warn"} /><OpsMetric icon={BellRing} label="6:30 alert" value={todayAlert?.gateStatus === "alert_sent" ? "Owner notified" : todayAlert?.gateStatus === "alert_failed" ? "Delivery needs review" : todayGate?.passed ? "No alert needed" : "Awaiting check"} detail={todayAlert?.notifiedAt ? `Sent ${new Date(todayAlert.notifiedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "One alert per episode date"} tone={todayAlert?.gateStatus === "alert_failed" || !todayGate?.passed ? "warn" : "good"} /></div>
        <p className="mt-3 text-xs text-muted-foreground">{todayAlert?.message || todayGate?.message || "The current date has not yet written a gate assessment."}</p>
      </section>
      <section className="glass-card rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Safe recovery console</p><h3 className="mt-1 text-base font-bold">Repair audio or re-run today’s guarded workflow</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">Audio repair is limited to an existing brief. The guarded recovery restarts today’s source preflight and may proceed only when the script, paired segment audio, and Andrew/Jenny full episodes all pass.</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => guardedRecoveryRequest.mutate()} disabled={guardedRecoveryRequest.isPending || Boolean(todayGate?.passed)} className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">{guardedRecoveryRequest.isPending ? "Starting guarded recovery…" : todayGate?.passed ? "Today already verified" : "Run guarded recovery for today"}</button>
            {latest && <button onClick={() => recoveryRequest.mutate({ episodeDate: latest.date })} disabled={recoveryRequest.isPending || fullAudioReady} className="rounded-md border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">{recoveryRequest.isPending ? "Queueing…" : fullAudioReady ? "Both mixes verified" : "Queue audio repair"}</button>}
          </div>
        </div>
        {guardedRecoveryRequest.error && <p className="mt-3 rounded-md border border-red-500/25 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-300">Guarded recovery could not be queued: {guardedRecoveryRequest.error.message}</p>}
        {recoveryRequest.error && <p className="mt-3 rounded-md border border-red-500/25 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-300">Audio repair could not be queued: {recoveryRequest.error.message}</p>}
        <div className="mt-4 space-y-2">{recoveryRequests.slice(0, 4).map((request: any) => <div key={request.id} className="rounded-lg border border-border/70 bg-background/50 px-3 py-2 text-xs"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold text-foreground">{request.episodeDate} · {request.recoveryMode === "full_guard" ? "guarded recovery" : "audio repair"} · {request.status}</span><span className="text-muted-foreground">Requested by {request.requestedBy}</span></div><p className="mt-1 text-muted-foreground">{request.resultMessage || request.note || "Awaiting the next safe guard pass."}</p></div>)}{!recoveryRequests.length && <p className="text-sm text-muted-foreground">No manual recovery requests are queued. Scheduled recovery remains active at 7:30 and 8:30 AM ET.</p>}</div>
      </section>
      <section className="glass-card rounded-xl p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wider">Publication-gate timeline</h3><p className="mt-1 text-xs text-muted-foreground">Each stage must pass in order; a held stage blocks public release rather than substituting a shortened briefing.</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${fullAudioReady ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}>{fullAudioReady ? "All gates passed" : "Publication held"}</span></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><PodcastGate icon={ListChecks} label="Source preflight" detail={preflight ? `${preflight.readyCount}/${preflight.topicCount} required topics ready` : "Awaiting first preflight record"} passed={preflightReady} /><PodcastGate icon={FileText} label="Script package" detail={latest ? `${latest.scriptsReady}/${latest.segmentCount} scripts · ${latest.segmentCount}/${latest.expectedSegments} expected` : "No episode record"} passed={scriptsReady && uniqueSegments} /><PodcastGate icon={Headphones} label="Segment audio" detail={latest ? `${latest.andrewReady}/${latest.segmentCount} Andrew · ${latest.jennyReady}/${latest.segmentCount} Jenny` : "No episode record"} passed={dualAudioReady} /><PodcastGate icon={CheckCircle2} label="Public release" detail={latest?.durationLabel || "Awaiting full episode"} passed={fullAudioReady} /></div></section>
      <EditorialQAScorecard scorecard={qaScorecard as any} />
      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]"><div className="glass-card rounded-xl p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wider">Source preflight monitor</h3><p className="mt-1 text-xs text-muted-foreground">Runs at 5:15 and 5:40 AM ET, then once again immediately before the 6:00 AM guarded generation attempt.</p></div>{preflight ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${preflightReady ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>{preflightReady ? "Ready" : "Blocked"}</span> : null}</div>{sourceReport?.results?.length ? <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">{sourceReport.results.map((item: any) => <SourcePreflightRow key={item.topic} item={item} />)}</div> : <p className="mt-4 text-sm text-muted-foreground">No saved source-preflight detail is available yet. The next scheduled preflight will populate this monitor.</p>}</div><div className="glass-card rounded-xl p-5"><h3 className="text-sm font-bold uppercase tracking-wider">Recovery runbook</h3><div className="mt-4 space-y-3 text-sm"><RunbookStep step="1" title="Preflight first" detail="A missing source blocks script generation before any partial episode is written."/><RunbookStep step="2" title="Resume safely" detail="The locked recovery checks at 7:30 and 8:30 AM ET reuse validated drafts rather than starting over."/><RunbookStep step="3" title="Preserve quality" detail="Scripts, Andrew audio, Jenny audio, and the verified full episode all remain mandatory."/><RunbookStep step="4" title="Escalate clearly" detail="Use the source monitor and recent runs below to identify a held topic before changing a source query."/></div></div></section>
      <section className="grid gap-5 xl:grid-cols-2"><div className="glass-card rounded-xl p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wider">Latest segment diagnostics</h3><p className="mt-1 text-xs text-muted-foreground">Per-segment script and dual-voice asset readiness.</p></div>{latest?.duplicateKeys?.length ? <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300"><AlertTriangle size={12} /> Duplicate key</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={12} /> Unique sequence</span>}</div><div className="mt-4 max-h-72 divide-y divide-border overflow-y-auto rounded-lg border border-border/70">{(latest?.segments ?? []).map((segment: any) => <div key={segment.key} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-2 px-3 py-2 text-xs"><div className="min-w-0"><p className="truncate font-medium text-foreground">{segment.label}</p><p className="text-muted-foreground">{segment.durationLabel || "Duration pending"}</p></div><SegmentDot label="Script" passed={segment.hasScript} /><SegmentDot label="A" passed={segment.hasAndrewAudio} /><SegmentDot label="J" passed={segment.hasJennyAudio} /></div>)}{!latest?.segments?.length && <p className="p-4 text-sm text-muted-foreground">No segment diagnostics are available yet.</p>}</div></div><div className="glass-card rounded-xl p-5"><h3 className="text-sm font-bold uppercase tracking-wider">Publication and run history</h3><p className="mt-1 text-xs text-muted-foreground">Recent episodes and any stored pipeline rows, retained for operational accountability.</p><div className="mt-4 max-h-36 space-y-2 overflow-y-auto">{recentEpisodes.map((episode: any) => <div key={episode.date} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/50 px-3 py-2"><div><p className="text-sm font-medium">{episode.friendlyDate}</p><p className="mt-0.5 text-xs text-muted-foreground">{episode.segmentCount} segments · {episode.durationLabel || "Duration pending"}</p></div><span className={`shrink-0 text-xs font-semibold ${episode.verificationStatus === "passed" && episode.hasFullAudio ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{episode.verificationStatus === "passed" && episode.hasFullAudio ? "Verified" : "Held"}</span></div>)}{recentEpisodes.length === 0 && <p className="text-sm text-muted-foreground">No episode history is available yet.</p>}</div><div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recent pipeline records</p>{recentRuns.length ? <div className="mt-2 space-y-2">{recentRuns.slice(0, 4).map((run: any) => <div key={run.id} className="flex items-center justify-between gap-3 text-xs"><span className="font-medium text-foreground">{run.episodeDate} · {run.triggeredBy}</span><span className={run.status === "success" ? "text-emerald-700 dark:text-emerald-300" : run.status === "failed" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}>{run.status}</span></div>)}</div> : <p className="mt-2 text-xs text-muted-foreground">No pipeline rows were recorded; episode and preflight diagnostics above remain the operational record.</p>}</div><div className="mt-4 border-t border-border pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Saved preflight history</p><div className="mt-2 space-y-1">{preflights.slice(0, 3).map((item: any) => <div key={item.episodeDate} className="flex items-center justify-between text-xs"><span>{item.episodeDate}</span><span className={item.status === "ready" ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}>{item.status} · {item.readyCount}/{item.topicCount}</span></div>)}</div></div></div></section>
      <PodcastPublishingKit />
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

function AdminFreshnessCard({ label, value, timestamp, detail, tone, onOpen }: { label: string; value: string; timestamp?: Date | string | number | null; detail: string; tone: "good" | "warn"; onOpen: () => void }) {
  const freshness = getAdminFreshness(timestamp);
  const effectiveTone = tone === "warn" || freshness.stale ? "warn" : "good";
  const colors = effectiveTone === "good" ? "border-emerald-500/25 bg-emerald-500/5 hover:border-emerald-500/50" : "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/55";
  return <button type="button" onClick={onOpen} className={`rounded-lg border p-3 text-left transition-colors ${colors}`}><div className="flex items-start justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{label}</p><ArrowUpRight size={13} className={effectiveTone === "good" ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"} /></div><p className="mt-2 text-sm font-semibold text-foreground">{value}</p><p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{detail}</p><p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.08em] ${effectiveTone === "good" ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{freshness.stale && freshness.minutesAgo !== null ? `Stale · ${freshness.label}` : freshness.label}</p></button>;
}

function PodcastGate({ icon: Icon, label, detail, passed }: { icon: any; label: string; detail: string; passed: boolean }) {
  return <div className={`rounded-lg border p-3 ${passed ? "border-emerald-500/25 bg-emerald-500/5" : "border-amber-500/25 bg-amber-500/5"}`}><Icon size={15} className={passed ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-300"}/><p className="mt-2 text-xs font-semibold text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p><p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.1em] ${passed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>{passed ? "Passed" : "Held safely"}</p></div>;
}

function EditorialQAScorecard({ scorecard }: { scorecard: any }) {
  const scores = scorecard?.scores ?? [];
  const currentScores = scores.filter((score: any) => !score.baseline);
  const latest = currentScores[0];
  if (!scorecard) return <section className="glass-card rounded-xl p-5"><div className="h-32 animate-pulse rounded-lg bg-muted" /></section>;
  return <section className="glass-card rounded-xl p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Editorial QA Scorecard</p><h3 className="mt-1 text-base font-bold">Pre–July benchmark standard</h3><p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">Every post–July release is measured against the preserved original flow, then the stronger current requirements: source evidence, complete scripts, reconciled duration, paired segments, and Andrew/Jenny full mixes. Held history stays visible without being rewritten.</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${latest?.status === "verified" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>{latest?.status === "verified" ? "Current standard met" : "Integrity hold present"}</span></div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><OpsMetric icon={ListChecks} label="Latest QA score" value={latest?.score === null || latest?.score === undefined ? "Baseline" : `${latest.score}/100`} detail={latest ? `${latest.date} · ${latest.status}` : "No scored release"} tone={latest?.status === "verified" ? "good" : "warn"} /><OpsMetric icon={CheckCircle2} label="Verified releases" value={String(scorecard.verifiedCount ?? 0)} detail="Meet every current benchmark gate" tone="good" /><OpsMetric icon={AlertTriangle} label="Integrity holds" value={String(scorecard.heldCount ?? 0)} detail="Visible; never auto-rewritten" tone={scorecard.heldCount ? "warn" : "good"} /><OpsMetric icon={ShieldCheck} label="Preserved baselines" value={String(scorecard.baselineCount ?? 0)} detail="Original pre–July archive standard" tone="neutral" /></div>
    <div className="mt-4 max-h-80 divide-y divide-border overflow-y-auto rounded-lg border border-border/70 bg-background/40">{scores.map((score: any) => { const checks = Object.values(score.checks ?? {}).filter(Boolean).length; const totalChecks = Object.keys(score.checks ?? {}).length || 7; const tone = score.status === "verified" ? "text-emerald-700 dark:text-emerald-300" : score.status === "baseline" ? "text-sky-700 dark:text-sky-300" : "text-amber-700 dark:text-amber-300"; return <div key={score.date} className="px-3 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-semibold text-foreground">{score.date} <span className="font-normal text-muted-foreground">{score.day}</span></p><p className="mt-0.5 text-[11px] text-muted-foreground">{score.baseline ? "Preserved original archive baseline" : `${score.editorialSegments} editorial segments · ${score.sourceBackedEditorialSegments} with source evidence`}</p></div><div className="flex items-center gap-2"><span className={`text-xs font-bold ${tone}`}>{score.score === null ? "Baseline" : `${score.score}/100`}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${score.status === "verified" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : score.status === "baseline" ? "bg-sky-500/15 text-sky-700 dark:text-sky-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>{score.status}</span></div></div>{!score.baseline && <div className="mt-2"><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className={score.status === "verified" ? "h-full bg-emerald-500" : "h-full bg-amber-500"} style={{ width: `${Math.round((checks / totalChecks) * 100)}%` }} /></div><p className="mt-1 text-[11px] text-muted-foreground">{score.status === "verified" ? "All benchmark gates passed." : score.holdReasons?.[0] || "Held for review."}</p></div>}</div>; })}</div>
  </section>;
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

function ElectionOpsTab({ initialGovernorSearch = "" }: { initialGovernorSearch?: string }) {
  const [chamber, setChamber] = useState<"senate" | "house" | "governors" | "referendums">("senate");
  const [houseSearch, setHouseSearch] = useState("");
  const [governorSearch, setGovernorSearch] = useState("");
  const activeRefresh = { refetchInterval: 60_000 };
  const { data: primaryContexts = [] } = trpc.election.primaryContexts.useQuery(undefined, activeRefresh);
  const { data: senateRaces = [] } = trpc.election.senate.useQuery(undefined, activeRefresh);
  const { data: houseRaces = [] } = trpc.election.house.useQuery(undefined, activeRefresh);
  const { data: governors = [] } = trpc.election.governors.useQuery(undefined, activeRefresh);
  const { data: referendums = [] } = trpc.election.referendums.useQuery(undefined, activeRefresh);

  const utils = trpc.useUtils();
  const updateSenate = trpc.election.updateSenate.useMutation({ onSuccess: () => utils.election.senate.invalidate() });
  const updateHouse = trpc.election.updateHouse.useMutation({ onSuccess: () => utils.election.house.invalidate() });
  const updateGovernor = trpc.election.updateGovernor.useMutation({ onSuccess: () => utils.election.governors.invalidate() });
  const updateReferendum = trpc.election.updateReferendum.useMutation({ onSuccess: () => utils.election.referendums.invalidate() });

  useEffect(() => {
    if (!initialGovernorSearch) return;
    setChamber("governors");
    setGovernorSearch(initialGovernorSearch);
  }, [initialGovernorSearch]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Election Data Editor</h2>
      <p className="text-xs text-muted-foreground mb-4">Edit race ratings, vote totals, and call winners. Changes save immediately.</p>
      {(primaryContexts as any[]).length > 0 && <section className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.055] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-amber-700 dark:text-amber-200">Primary context review</p><h3 className="mt-1 text-sm font-bold">{(primaryContexts as any[])[0].title}</h3><p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">{(primaryContexts as any[])[0].summary}</p></div><span className="rounded-full border border-amber-500/30 bg-background/70 px-2 py-1 text-[10px] font-bold uppercase text-amber-800 dark:text-amber-200">Reviewed {(primaryContexts as any[])[0].reviewedAt}</span></div><div className="mt-3 rounded-lg border border-border/70 bg-background/55 p-3 text-xs text-muted-foreground"><strong className="text-foreground">General map boundary:</strong> {(primaryContexts as any[])[0].generalElectionBoundary}<a className="ml-2 font-semibold text-primary hover:underline" href={(primaryContexts as any[])[0].sourceUrl} target="_blank" rel="noreferrer">Open official source ↗</a></div><p className="mt-2 text-[11px] text-muted-foreground">The homepage re-reads approved records every 60 seconds while open. The current election engine is intentionally in standby outside an active general-election polling window, so preliminary primary context is shown separately and never becomes an automatic general-election call.</p></section>}

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
        <div>
          <div className="relative mb-3"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={governorSearch} onChange={e => setGovernorSearch(e.target.value)} placeholder="Search a Governor contest or candidate..." className="w-full rounded-lg bg-muted py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {(governors as any[]).filter((race: any) => {
            if (!governorSearch) return true;
            const query = governorSearch.toLowerCase();
            return race.stateName?.toLowerCase().includes(query) || race.stateCode?.toLowerCase().includes(query) || race.demCandidate?.toLowerCase().includes(query) || race.repCandidate?.toLowerCase().includes(query);
          }).map((race: any) => (
            <GovEditor
              key={race.id}
              race={race}
              onSave={(data) => updateGovernor.mutate({ id: race.id, data })}
              saving={updateGovernor.isPending}
            />
          ))}
          </div>
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
  const [manualCallSource, setManualCallSource] = useState(race.calledSourceUrl ?? "");
  const [callError, setCallError] = useState("");
  const [pctReporting, setPctReporting] = useState(race.pctReporting?.toString() ?? "0");
  const [votes1, setVotes1] = useState(race.candidate1Votes?.toString() ?? "0");
  const [votes2, setVotes2] = useState(race.candidate2Votes?.toString() ?? "0");
  const [saved, setSaved] = useState(false);

  const confirmManualCall = () => {
    if (!calledWinner) return setCallError("Select one of the listed candidates before confirming a manual call.");
    let sourceUrl: URL;
    try {
      sourceUrl = new URL(manualCallSource.trim());
      if (sourceUrl.protocol !== "https:" && sourceUrl.protocol !== "http:") throw new Error("Unsupported protocol");
    } catch {
      return setCallError("Add a valid HTTPS or HTTP results source URL before confirming this call.");
    }
    setCallError("");
    onSave({ rating: rating || null, calledWinner, calledParty: calledParty || null, status: "Called", calledAt: Date.now(), calledSourceUrl: sourceUrl.toString(), notes: `${notes ? `${notes}\n\n` : ""}Manual administrator call. Evidence source: ${sourceUrl.toString()}`, pctReporting: parseFloat(pctReporting) || 0, candidate1Votes: parseInt(votes1) || 0, candidate2Votes: parseInt(votes2) || 0 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
        <select aria-label="Select verified race winner" value={calledWinner} onChange={e => { const winner = e.target.value; setCalledWinner(winner); setCalledParty(winner === race.candidate1Name ? race.candidate1Party ?? "" : winner === race.candidate2Name ? race.candidate2Party ?? "" : ""); }} className="bg-amber-500/10 rounded px-2 py-1 text-xs min-w-[180px]">
          <option value="">Select winner from ballot</option>
          {race.candidate1Name && <option value={race.candidate1Name}>{race.candidate1Name} ({race.candidate1Party ?? "?"})</option>}
          {race.candidate2Name && <option value={race.candidate2Name}>{race.candidate2Name} ({race.candidate2Party ?? "?"})</option>}
        </select>
        <input value={manualCallSource} onChange={e => setManualCallSource(e.target.value)} placeholder="Required results source URL" type="url" className="bg-muted rounded px-2 py-1 text-xs w-52" />
        <button onClick={confirmManualCall} disabled={saving || !calledWinner} className="rounded bg-amber-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50">Confirm call</button>
        {race.calledSourceUrl && <a href={race.calledSourceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-primary underline underline-offset-2">Evidence ↗</a>}
        {callError && <span className="text-[10px] text-destructive">{callError}</span>}
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
  const [manualCallSource, setManualCallSource] = useState(race.calledSourceUrl ?? "");
  const [callError, setCallError] = useState("");
  const [saved, setSaved] = useState(false);
  const [candidateLogOpen, setCandidateLogOpen] = useState(false);

  const confirmManualCall = () => {
    if (!calledWinner) return setCallError("Select the Democratic or Republican candidate before confirming a manual call.");
    let sourceUrl: URL;
    try {
      sourceUrl = new URL(manualCallSource.trim());
      if (sourceUrl.protocol !== "https:" && sourceUrl.protocol !== "http:") throw new Error("Unsupported protocol");
    } catch {
      return setCallError("Add a valid HTTPS or HTTP results source URL before confirming this call.");
    }
    setCallError("");
    onSave({ rating: rating || null, calledWinner, calledParty: calledWinner === race.demCandidate ? "D" : "R", status: "Called", calledAt: Date.now(), calledSourceUrl: sourceUrl.toString(), notes: `${notes ? `${notes}\n\n` : ""}Manual administrator call. Evidence source: ${sourceUrl.toString()}` });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSave = () => {
    onSave({ rating: rating || null, calledWinner: calledWinner || null, notes: notes || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return <div className="glass-card rounded-lg p-3">
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-bold min-w-[120px]">{race.stateName}</span>
      <span className="text-xs text-muted-foreground">{race.demCandidate ?? "TBD"} (D) vs {race.repCandidate ?? "TBD"} (R)</span>
      <select value={rating} onChange={e => setRating(e.target.value)} className="bg-muted rounded px-2 py-1 text-xs"><option value="">No Rating</option>{RATINGS.map(r => <option key={r} value={r}>{r}</option>)}</select>
      <input value={calledWinner} onChange={e => setCalledWinner(e.target.value)} placeholder="Called winner" className="bg-muted rounded px-2 py-1 text-xs w-28" />
      <select aria-label="Select Governor winner" value="" onChange={e => { if (e.target.value) setCalledWinner(e.target.value); }} className="bg-amber-500/10 rounded px-2 py-1 text-xs min-w-[150px]"><option value="">Select winner from ballot</option>{race.demCandidate && <option value={race.demCandidate}>{race.demCandidate} (D)</option>}{race.repCandidate && <option value={race.repCandidate}>{race.repCandidate} (R)</option>}</select>
      <input value={manualCallSource} onChange={e => setManualCallSource(e.target.value)} placeholder="Required results source URL" type="url" className="bg-muted rounded px-2 py-1 text-xs w-52" />
      <button onClick={confirmManualCall} disabled={saving || !calledWinner} className="rounded bg-amber-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50">Confirm call</button>
      {race.calledSourceUrl && <a href={race.calledSourceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-primary underline underline-offset-2">Evidence ↗</a>}
      {callError && <span className="text-[10px] text-destructive">{callError}</span>}
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Race notes" className="bg-muted rounded px-2 py-1 text-xs w-40" />
      <button onClick={handleSave} disabled={saving} className="ml-auto flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs hover:bg-primary/30 transition-colors disabled:opacity-50">{saved ? <Check size={12} /> : <Save size={12} />}{saved ? "Saved" : "Save"}</button>
      <button onClick={() => setCandidateLogOpen((value) => !value)} className="rounded border border-primary/35 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">{candidateLogOpen ? "Close candidate log" : "Manage candidates"}</button>
    </div>
    {candidateLogOpen && <GovernorCandidateLogEditor race={race} onClose={() => setCandidateLogOpen(false)} />}
  </div>;
}

function GovernorCandidateLogEditor({ race, onClose }: { race: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const [demCandidate, setDemCandidate] = useState(race.demCandidate ?? "");
  const [repCandidate, setRepCandidate] = useState(race.repCandidate ?? "");
  const [demOffice, setDemOffice] = useState(race.demPreviousOffice ?? "");
  const [repOffice, setRepOffice] = useState(race.repPreviousOffice ?? "");
  const [sourceUrl, setSourceUrl] = useState(race.candidateSourceUrl ?? "");
  const [sourceLabel, setSourceLabel] = useState(race.candidateSourceLabel ?? "");
  const [editorNote, setEditorNote] = useState("");
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const { data: history = [] } = trpc.election.governorCandidateHistory.useQuery({ id: race.id });
  const saveCandidateLog = trpc.election.updateGovernorCandidateLog.useMutation({
    onSuccess: async () => { await Promise.all([utils.election.governors.invalidate(), utils.election.governorCandidateHistory.invalidate({ id: race.id })]); setEditorNote(""); setError(""); setSavedMessage("Saved. The public Governor record and private source history refreshed."); },
    onError: (mutationError) => setError(mutationError.message || "The candidate log could not be saved."),
  });
  const save = () => {
    if (!demCandidate.trim() || !repCandidate.trim() || !sourceUrl.trim() || !sourceLabel.trim()) return setError("Democratic candidate, Republican candidate, source label, and source URL are required.");
    try {
      const url = new URL(sourceUrl.trim());
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Unsupported protocol");
      setSavedMessage("");
      saveCandidateLog.mutate({ id: race.id, demCandidate: demCandidate.trim(), repCandidate: repCandidate.trim(), demPreviousOffice: demOffice.trim() || null, repPreviousOffice: repOffice.trim() || null, candidateSourceUrl: url.toString(), candidateSourceLabel: sourceLabel.trim(), editorNote: editorNote.trim() || null });
    } catch { setError("Enter a valid HTTPS or HTTP source URL before saving the candidate log."); }
  };
  return <section className="mt-3 rounded-lg border border-primary/30 bg-primary/[0.045] p-3" aria-label={`${race.stateName} Governor candidate log`}>
    <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Manual general-election candidate log</p><p className="mt-1 text-xs text-muted-foreground">This updates the public Governor record and keeps a private source-backed change history. It does not call a winner or alter results.</p></div><button type="button" onClick={onClose} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close</button></div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Democratic candidate<input value={demCandidate} onChange={(event) => setDemCandidate(event.target.value)} placeholder="Candidate name" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Republican candidate<input value={repCandidate} onChange={(event) => setRepCandidate(event.target.value)} placeholder="Candidate name" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Democratic candidate context<input value={demOffice} onChange={(event) => setDemOffice(event.target.value)} placeholder="Current or prior office" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Republican candidate context<input value={repOffice} onChange={(event) => setRepOffice(event.target.value)} placeholder="Current or prior office" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label></div>
    <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"><label className="text-xs font-semibold text-muted-foreground">Source label<input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} placeholder="e.g., PBS NewsHour / AP" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Source URL<input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://…" type="url" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label></div>
    <label className="mt-2 block text-xs font-semibold text-muted-foreground">Editor note (private audit context)<textarea value={editorNote} onChange={(event) => setEditorNote(event.target.value)} placeholder="Why this candidate log was changed" className="mt-1 min-h-16 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label>
    <div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={save} disabled={saveCandidateLog.isPending} className="inline-flex items-center gap-1 rounded bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{saveCandidateLog.isPending ? "Saving candidate log…" : <><Save size={13} /> Save candidate log</>}</button>{race.candidateSourceUrl && <a href={race.candidateSourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline underline-offset-4">Current public source <ExternalLink size={12} /></a>}{savedMessage && <span role="status" className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{savedMessage}</span>}{error && <span className="text-xs text-destructive">{error}</span>}</div>
    {history.length > 0 && <div className="mt-3 border-t border-primary/15 pt-3"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Recent private change history</p><div className="mt-2 space-y-1.5">{history.slice(0, 3).map((item: any) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span><strong className="text-foreground">{item.demCandidate || "—"}</strong> (D) vs <strong className="text-foreground">{item.repCandidate || "—"}</strong> (R)</span><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">{item.sourceLabel}</a></div>)}</div></div>}
  </section>;
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

function CbcOpsTab({ initialSearch = "" }: { initialSearch?: string }) {
  const [search, setSearch] = useState("");
  const [createMode, setCreateMode] = useState<"profile" | "contest" | null>(null);
  const [saveReceipt, setSaveReceipt] = useState("");
  const { data: members = [] } = trpc.election.cbc.useQuery();
  const { data: elections = [] } = trpc.election.blackRepresentationElections.useQuery();
  const utils = trpc.useUtils();
  const updateCbc = trpc.election.updateCbc.useMutation({ onSuccess: async () => { await utils.election.cbc.invalidate(); } });
  const updateElection = trpc.election.updateBlackRepresentationElection.useMutation({ onSuccess: async () => { await utils.election.blackRepresentationElections.invalidate(); } });
  const removeCbc = trpc.election.removeCbc.useMutation({ onSuccess: () => utils.election.cbc.invalidate() });
  const removeElection = trpc.election.removeBlackRepresentationElection.useMutation({ onSuccess: () => utils.election.blackRepresentationElections.invalidate() });
  const createProfile = trpc.election.createBlackRepresentationProfile.useMutation({ onSuccess: async () => { await utils.election.cbc.invalidate(); setCreateMode(null); setSaveReceipt("Profile saved. The public Black Representation list and protected addition history refreshed."); } });
  const createContest = trpc.election.createBlackRepresentationContest.useMutation({ onSuccess: async () => { await utils.election.blackRepresentationElections.invalidate(); setCreateMode(null); setSaveReceipt("Contest saved. The public Black Representation map ledger and protected addition history refreshed."); } });

  useEffect(() => {
    if (initialSearch) setSearch(initialSearch);
  }, [initialSearch]);

  const filtered = (members as any[]).filter((m: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.member?.toLowerCase().includes(q) || m.district?.toLowerCase().includes(q) || m.state?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h2 className="text-lg font-bold mb-1">Black Representation Editor</h2>
      <p className="text-xs text-muted-foreground mb-4">Manage people, primary context, source links, and the map contest ledger. Add a source-backed Black Representation profile or a contest directly here; manual additions appear publicly only after their protected save completes.</p>
      <div className="mb-4 flex flex-wrap items-center gap-2"><button onClick={() => { setSaveReceipt(""); createProfile.reset(); setCreateMode(createMode === "profile" ? null : "profile"); }} className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90">Add Black Rep profile</button><button onClick={() => { setSaveReceipt(""); createContest.reset(); setCreateMode(createMode === "contest" ? null : "contest"); }} className="rounded-md border border-primary/45 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5">Add Black Rep race</button>{saveReceipt && <span role="status" className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{saveReceipt}</span>}</div>
      {createMode === "profile" && <BlackRepresentationProfileCreateForm saving={createProfile.isPending} error={createProfile.error?.message} onCancel={() => setCreateMode(null)} onCreate={(input) => createProfile.mutate(input)} />}
      {createMode === "contest" && <BlackRepresentationContestCreateForm saving={createContest.isPending} error={createContest.error?.message} onCancel={() => setCreateMode(null)} onCreate={(input) => createContest.mutate(input)} />}
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
          <CbcEditor key={m.id} member={m} onSave={(data) => updateCbc.mutateAsync({ id: m.id, data })} onRemove={(data) => removeCbc.mutate({ id: m.id, ...data })} removalError={removeCbc.error?.message} saving={updateCbc.isPending || removeCbc.isPending} />
        ))}
      </div>
      <h3 className="text-sm font-bold mt-8 mb-3">Article-Backed Election Results</h3>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {(elections as any[]).filter((race: any) => !search || `${race.state} ${race.district} ${race.winnerName} ${race.runnerUpName}`.toLowerCase().includes(search.toLowerCase())).map((race: any) => (
          <BlackRepresentationElectionEditor key={race.id} race={race} onSave={(data: any) => updateElection.mutateAsync({ id: race.id, data })} onRemove={(data: any) => removeElection.mutate({ id: race.id, ...data })} removalError={removeElection.error?.message} saving={updateElection.isPending || removeElection.isPending} />
        ))}
      </div>
    </div>
  );
}

function BlackRepresentationProfileCreateForm({ onCreate, onCancel, saving, error }: { onCreate: (input: any) => void; onCancel: () => void; saving: boolean; error?: string }) {
  const [form, setForm] = useState({ member: "", state: "", stateCode: "", district: "", party: "D", chamber: "house", status: "running", roleType: "challenger", isCurrentMember: false, upIn2026: true, raceStage: "general", sourceLabel: "", sourceUrl: "", additionNote: "" });
  const update = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => onCreate({ ...form, stateCode: form.stateCode.toUpperCase(), additionNote: form.additionNote || null });
  return <section className="mb-5 rounded-xl border border-primary/35 bg-primary/5 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Create Black Representation profile</p><p className="mt-1 text-xs text-muted-foreground">A public profile must have a named person, jurisdiction, current status, and reviewable source package. This does not call an election or create a vote total.</p></div><button onClick={onCancel} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-4 grid gap-2 md:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Candidate / member name<input value={form.member} onChange={(e) => update("member", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">State<input value={form.state} onChange={(e) => update("state", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">State code<input value={form.stateCode} maxLength={2} onChange={(e) => update("stateCode", e.target.value.toUpperCase())} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">District / jurisdiction<span className="ml-1 font-normal">(up to 128 characters)</span><input value={form.district} maxLength={128} placeholder="District 12, U.S. Virgin Islands at-large, statewide" onChange={(e) => update("district", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Party<select value={form.party} onChange={(e) => update("party", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="D">Democratic</option><option value="R">Republican</option><option value="I">Independent</option></select></label><label className="text-xs font-semibold text-muted-foreground">Office<select value={form.chamber} onChange={(e) => update("chamber", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="house">House</option><option value="senate">Senate</option><option value="governor">Governor</option></select></label><label className="text-xs font-semibold text-muted-foreground">Representation status<select value={form.status} onChange={(e) => update("status", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="running">Running</option><option value="challenger">Challenger</option><option value="advanced_to_general">Advanced to General</option><option value="in_runoff">In runoff</option><option value="won_general">Won General Election</option><option value="lost_general">Lost General Election</option><option value="withdrawn">Withdrawn</option></select></label><label className="text-xs font-semibold text-muted-foreground">Role<select value={form.roleType} onChange={(e) => update("roleType", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="challenger">Challenger</option><option value="nominee">Nominee</option><option value="incumbent">Incumbent</option><option value="former_member">Former member</option><option value="delegate">Delegate</option></select></label></div><div className="mt-2 grid gap-2 md:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Source label<input value={form.sourceLabel} onChange={(e) => update("sourceLabel", e.target.value)} placeholder="Official filing or reporting outlet" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Source URL<input type="url" value={form.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} placeholder="https://…" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label></div><label className="mt-2 block text-xs font-semibold text-muted-foreground">Private addition note<textarea value={form.additionNote} onChange={(e) => update("additionNote", e.target.value)} className="mt-1 min-h-16 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label><div className="mt-3 flex flex-wrap items-center gap-2"><button disabled={saving || !form.member.trim() || !form.state.trim() || form.stateCode.length !== 2 || !form.district.trim() || !form.sourceLabel.trim() || !form.sourceUrl.trim()} onClick={submit} className="rounded bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving ? "Adding profile…" : "Create source-backed profile"}</button>{error && <span className="text-xs text-destructive">{error}</span>}</div></section>;
}

function BlackRepresentationContestCreateForm({ onCreate, onCancel, saving, error }: { onCreate: (input: any) => void; onCancel: () => void; saving: boolean; error?: string }) {
  const [form, setForm] = useState({ state: "", stateCode: "", district: "", chamber: "house", electionType: "general", resultStatus: "upcoming", winnerName: "", winnerParty: "", runnerUpName: "", runnerUpParty: "", generalOpponent: "", electionDate: "", sourceLabel: "", sourceUrl: "", additionNote: "" });
  const update = (key: string, value: any) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => onCreate({ ...form, stateCode: form.stateCode.toUpperCase(), winnerName: form.winnerName || null, winnerParty: form.winnerParty || null, runnerUpName: form.runnerUpName || null, runnerUpParty: form.runnerUpParty || null, generalOpponent: form.generalOpponent || null, electionDate: form.electionDate || null, additionNote: form.additionNote || null });
  return <section className="mb-5 rounded-xl border border-primary/35 bg-primary/5 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">Create Black Representation map race</p><p className="mt-1 text-xs text-muted-foreground">Add a source-backed contest to the public Black Representation map. Upcoming races may remain uncalled; an outcome is never inferred from this form.</p></div><button onClick={onCancel} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-4 grid gap-2 md:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">State<input value={form.state} onChange={(e) => update("state", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">State code<input value={form.stateCode} maxLength={2} onChange={(e) => update("stateCode", e.target.value.toUpperCase())} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">District / jurisdiction<input value={form.district} placeholder="District 12 or statewide" onChange={(e) => update("district", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Office<select value={form.chamber} onChange={(e) => update("chamber", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="house">House</option><option value="senate">Senate</option><option value="governor">Governor</option></select></label><label className="text-xs font-semibold text-muted-foreground">Election type<select value={form.electionType} onChange={(e) => update("electionType", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="general">General</option><option value="primary">Primary</option><option value="runoff">Runoff</option><option value="special">Special</option></select></label><label className="text-xs font-semibold text-muted-foreground">Map status<select value={form.resultStatus} onChange={(e) => update("resultStatus", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground"><option value="upcoming">Upcoming</option><option value="too_close_to_call">Too close to call</option><option value="called">Called</option><option value="uncontested">Uncontested</option><option value="withdrawn">Withdrawn</option></select></label><label className="text-xs font-semibold text-muted-foreground">Named candidate / winner<input value={form.winnerName} onChange={(e) => update("winnerName", e.target.value)} className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Party<input value={form.winnerParty} onChange={(e) => update("winnerParty", e.target.value)} placeholder="D, R, I" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label></div><div className="mt-2 grid gap-2 md:grid-cols-2"><label className="text-xs font-semibold text-muted-foreground">Source label<input value={form.sourceLabel} onChange={(e) => update("sourceLabel", e.target.value)} placeholder="Official filing or reporting outlet" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs font-semibold text-muted-foreground">Source URL<input type="url" value={form.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} placeholder="https://…" className="mt-1 h-9 w-full rounded border border-border bg-background px-2 text-sm text-foreground" /></label></div><label className="mt-2 block text-xs font-semibold text-muted-foreground">Private addition note<textarea value={form.additionNote} onChange={(e) => update("additionNote", e.target.value)} className="mt-1 min-h-16 w-full rounded border border-border bg-background px-2 py-2 text-sm text-foreground" /></label><div className="mt-3 flex flex-wrap items-center gap-2"><button disabled={saving || !form.state.trim() || form.stateCode.length !== 2 || !form.district.trim() || !form.sourceLabel.trim() || !form.sourceUrl.trim()} onClick={submit} className="rounded bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving ? "Adding race…" : "Create source-backed race"}</button>{error && <span className="text-xs text-destructive">{error}</span>}</div></section>;
}

function CandidatesOpsTab({ onOpenPortraits, onManageBlackRepresentation, onManageGovernor }: { onOpenPortraits: (targetKey?: string) => void; onManageBlackRepresentation: (candidateName: string) => void; onManageGovernor: (location: string) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | AdminCandidateCategory>("all");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const { data: senate = [] } = trpc.election.senate.useQuery();
  const { data: house = [] } = trpc.election.house.useQuery();
  const { data: governors = [] } = trpc.election.governors.useQuery();
  const { data: blackRepresentation = [] } = trpc.election.cbc.useQuery();
  const { data: missingTargets = [] } = trpc.portraits.targets.useQuery();
  const { data: portraitSubmissions = [] } = trpc.portraits.submissions.useQuery();
  const utils = trpc.useUtils();

  const candidates = useMemo(() => buildAdminCandidateRows({
    senate: senate as any[], house: house as any[], governors: governors as any[], blackRepresentation: blackRepresentation as any[], missingTargets: missingTargets as any[], portraitSubmissions: portraitSubmissions as any[],
  }), [senate, house, governors, blackRepresentation, missingTargets, portraitSubmissions]);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleCandidates = candidates.filter((candidate) => (category === "all" || candidate.category === category) && (!normalizedSearch || `${candidate.candidateName} ${candidate.location} ${candidate.party}`.toLowerCase().includes(normalizedSearch)));
  const photoSummary = candidates.reduce((summary, candidate) => ({ ...summary, [candidate.photoStatus]: summary[candidate.photoStatus] + 1 }), { needs_verification: 0, pending_review: 0, evidence_needed: 0 });
  const statusCopy = { needs_verification: "Needs verification", pending_review: "Review image", evidence_needed: "Image missing" } as const;
  const categoryCopy: Record<AdminCandidateCategory, string> = { senate: "Senate", house: "House", governor: "Governor", black_representation: "Black Representation" };
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId) ?? null;
  const selectedSourceLeads = selectedCandidate ? getOfficialPortraitSourceLeads({ candidateName: selectedCandidate.candidateName, location: selectedCandidate.location, targetType: selectedCandidate.category }) : [];

  return <div className="space-y-5">
    <section className="glass-card rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Candidate operations</p><h2 className="mt-1 text-xl font-bold">All candidates</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">One protected view of every Senate, House, Governor, and Black Representation candidate already tracked by the platform. A stored image URL is not treated as verified: candidates are labeled as image missing, needs verification, or awaiting your image decision. Black Representation cards also include a protected route to manage or delete the matched profile.</p></div><button onClick={() => onOpenPortraits()} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"><ImagePlus size={14} /> Open Portrait Review</button></div>
      <div className="mt-4 flex flex-wrap gap-2">{category === "governor" && <button onClick={() => onManageGovernor(search)} className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-background px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5"><MapPin size={14} /> Manage Governor candidate log</button>}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><OpsMetric icon={CheckCircle2} label="Needs verification" value={String(photoSummary.needs_verification)} detail="Stored image needs human/source review" tone="warn" /><OpsMetric icon={Clock3} label="Review image" value={String(photoSummary.pending_review)} detail="Visual submission awaits your decision" tone="warn" /><OpsMetric icon={ImagePlus} label="Image missing" value={String(photoSummary.evidence_needed)} detail="No current image or evidence package" tone="warn" /></div>
    </section>
    <section className="glass-card rounded-xl p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full lg:max-w-md"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search candidate, state, district, or party..." className="w-full rounded-lg bg-muted py-2 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" /></div><div className="flex flex-wrap gap-2">{(["all", "senate", "house", "governor", "black_representation"] as const).map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${category === item ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"}`}>{item === "all" ? "All" : categoryCopy[item]}</button>)}</div></div>
      <p className="mt-3 text-xs text-muted-foreground">Showing {visibleCandidates.length} of {candidates.length} candidate records. Portraits are public only after a source-backed visual submission is approved in Portrait Review.</p>
      {selectedCandidate && <section className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4" aria-label="Selected candidate portrait operations"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Selected candidate</p><h3 className="mt-1 text-lg font-bold">{selectedCandidate.candidateName}</h3><p className="mt-1 text-sm text-muted-foreground">{selectedCandidate.location} · {selectedCandidate.party || categoryCopy[selectedCandidate.category]} · {statusCopy[selectedCandidate.photoStatus]}</p><p className="mt-3 max-w-2xl text-xs leading-5 text-muted-foreground">Use the source leads below to prepare a verifiable portrait submission. A portrait reaches the public record only after visual review and an explicit approval.</p></div><button onClick={() => setSelectedCandidateId(null)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close details</button></div><div className="mt-4 flex flex-wrap gap-2">{selectedCandidate.photoUrl && <a href={selectedCandidate.photoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-xs font-bold text-foreground"><ExternalLink size={13} /> Inspect stored image</a>}<button onClick={() => onOpenPortraits(selectedCandidate.id)} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"><ImagePlus size={13} /> {selectedCandidate.photoStatus === "pending_review" ? "Approve or deny image" : selectedCandidate.photoStatus === "needs_verification" ? "Verify or replace image" : "Open source review"}</button>{selectedCandidate.category === "black_representation" && <button onClick={() => onManageBlackRepresentation(selectedCandidate.candidateName)} className="inline-flex items-center gap-1 rounded-md border border-destructive/45 bg-destructive/5 px-3 py-2 text-xs font-bold text-destructive"><Trash2 size={13} /> Manage / delete profile</button>}</div><div className="mt-4 grid gap-2 md:grid-cols-3">{selectedSourceLeads.map((lead) => <a key={lead.label} href={lead.url} target="_blank" rel="noreferrer" className="rounded-lg border border-border bg-background/70 p-3 text-xs hover:border-primary/45"><span className="flex items-center justify-between font-bold text-primary">{lead.label}<ExternalLink size={12}/></span><span className="mt-1 block leading-5 text-muted-foreground">{lead.detail}</span></a>)}</div></section>}
      <div className="mt-4 grid max-h-[62vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">{visibleCandidates.map((candidate) => <article key={candidate.id} className={`flex items-start gap-3 rounded-lg border bg-background/50 p-3 ${candidate.id === selectedCandidateId ? "border-primary ring-1 ring-primary/25" : "border-border/70"}`}><div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-bold text-muted-foreground">{candidate.photoUrl ? <img src={candidate.photoUrl} alt="" className="h-full w-full object-cover" /> : candidate.candidateName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-semibold text-foreground">{candidate.candidateName}</p><span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${candidate.photoStatus === "needs_verification" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : candidate.photoStatus === "pending_review" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{statusCopy[candidate.photoStatus]}</span></div><p className="mt-0.5 truncate text-xs text-muted-foreground">{candidate.location} · {candidate.party || categoryCopy[candidate.category]}</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1"><button onClick={() => setSelectedCandidateId(candidate.id)} className="text-xs font-semibold text-primary hover:underline">Portrait actions</button>{candidate.photoUrl && <a href={candidate.photoUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">Inspect image</a>}<button onClick={() => onOpenPortraits(candidate.id)} className="text-xs font-semibold text-primary hover:underline">Open source review</button>{candidate.category === "black_representation" && <button onClick={() => onManageBlackRepresentation(candidate.candidateName)} className="text-xs font-bold text-destructive hover:underline">Manage / delete profile</button>}</div></div></article>)}{visibleCandidates.length === 0 && <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">No candidate records match the current filters.</p>}</div>
    </section>
  </div>;
}

function CbcEditor({ member, onSave, onRemove, removalError, saving }: { member: any; onSave: (data: any) => Promise<unknown>; onRemove: (data: { reason: string; sourceUrl?: string }) => void; removalError?: string; saving: boolean }) {
  const [status, setStatus] = useState(member.status ?? "running");
  const [primaryResult, setPrimaryResult] = useState(member.primaryResult ?? "");
  const [notes, setNotes] = useState(member.notes ?? "");
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [removalSource, setRemovalSource] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    try {
      setSaveError("");
      setSaved(false);
      await onSave({ status, primaryResult: primaryResult || null, notes: notes || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The profile could not be saved.");
    }
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
          <option value="withdrawn">Withdrawn</option>
          <option value="deceased">Deceased</option>
          <option value="lost_primary">Lost Primary</option>
          <option value="running_for_governor">Running for Gov</option>
          <option value="running_for_senate">Running for Senate</option>
          <option value="not_up_2026">Not Up 2026</option>
          <option value="challenger">Challenger</option>
          <option value="advanced_to_general">Advanced to General</option>
          <option value="in_runoff">In Runoff</option>
          <option value="too_close_to_call">Too Close to Call</option>
          <option value="elected">Elected</option>
          <option value="won_general">Won General Election</option>
          <option value="lost_general">Lost General Election</option>
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
        <button onClick={() => setRemoving((current) => !current)} disabled={saving} className="flex items-center gap-1 rounded border border-destructive/45 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 size={12} /> Remove profile</button>
      </div>
      {saved && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Saved. The public profile refreshed.</p>}
      {saveError && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">Save failed: {saveError}</p>}
      {removing && <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3"><p className="text-xs font-semibold text-destructive">Remove this Black Representation profile</p><p className="mt-1 text-xs text-muted-foreground">This creates an audit record. A profile with a linked contest cannot be removed until that contest is separately reviewed.</p>{removalError && <p className="mt-2 text-xs font-medium text-destructive">Removal blocked: {removalError}</p>}<div className="mt-2 flex flex-wrap gap-2"><input value={removalReason} onChange={e => setRemovalReason(e.target.value)} placeholder="Reason (12+ characters)" className="min-w-[220px] flex-1 rounded bg-background px-2 py-1 text-xs" /><input value={removalSource} onChange={e => setRemovalSource(e.target.value)} placeholder="Optional evidence URL" className="min-w-[180px] flex-1 rounded bg-background px-2 py-1 text-xs" /><button onClick={() => onRemove({ reason: removalReason, sourceUrl: removalSource || undefined })} disabled={saving || removalReason.trim().length < 12} className="rounded bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground disabled:opacity-50">Confirm removal</button></div></div>}
    </div>
  );
}

function BlackRepresentationElectionEditor({ race, onSave, onRemove, removalError, saving }: { race: any; onSave: (data: any) => Promise<unknown>; onRemove: (data: { reason: string; sourceUrl?: string }) => void; removalError?: string; saving: boolean }) {
  const [resultStatus, setResultStatus] = useState(race.resultStatus ?? "upcoming");
  const [winnerName, setWinnerName] = useState(race.winnerName ?? "");
  const [winnerVotes, setWinnerVotes] = useState(race.winnerVotes?.toString() ?? "");
  const [winnerVotePct, setWinnerVotePct] = useState(race.winnerVotePct?.toString() ?? "");
  const [generalOpponent, setGeneralOpponent] = useState(race.generalOpponent ?? "");
  const [sourceUrl, setSourceUrl] = useState(race.sourceUrl ?? "");
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [removalSource, setRemovalSource] = useState("");
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    try {
      setSaveError("");
      setSaved(false);
      await onSave({
        resultStatus,
        winnerName: winnerName || null,
        winnerVotes: winnerVotes ? Number.parseInt(winnerVotes, 10) : null,
        winnerVotePct: winnerVotePct ? Number.parseFloat(winnerVotePct) : null,
        generalOpponent: generalOpponent || null,
        sourceUrl: sourceUrl || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The contest could not be saved.");
    }
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
          <option value="withdrawn">Withdrawn</option>
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
      {saved && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Saved. The public contest refreshed.</p>}
      {saveError && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">Save failed: {saveError}</p>}
      {removing && <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3"><p className="text-xs font-semibold text-destructive">Remove this contest record</p><p className="mt-1 text-xs text-muted-foreground">The complete prior record, reason, source, and administrator are retained in the removal audit.</p>{removalError && <p className="mt-2 text-xs font-medium text-destructive">Removal blocked: {removalError}</p>}<div className="mt-2 flex flex-wrap gap-2"><input value={removalReason} onChange={e => setRemovalReason(e.target.value)} placeholder="Reason (12+ characters)" className="min-w-[220px] flex-1 rounded bg-background px-2 py-1 text-xs" /><input value={removalSource} onChange={e => setRemovalSource(e.target.value)} placeholder="Optional evidence URL" className="min-w-[180px] flex-1 rounded bg-background px-2 py-1 text-xs" /><button onClick={() => onRemove({ reason: removalReason, sourceUrl: removalSource || undefined })} disabled={saving || removalReason.trim().length < 12} className="rounded bg-destructive px-2 py-1 text-xs font-bold text-destructive-foreground disabled:opacity-50">Confirm removal</button></div></div>}
      <button onClick={() => setRemoving((current) => !current)} disabled={saving} className="mt-2 inline-flex items-center gap-1 rounded border border-destructive/45 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"><Trash2 size={12} /> Remove contest</button>
    </div>
  );
}

function AtlasWorldOpsTab() {
  const { data: worldElections = [] } = trpc.world.elections.useQuery();
  const { data: worldRefresh, refetch: refetchWorldRefresh } = trpc.world.refreshOperations.useQuery();
  const runWorldRefresh = trpc.world.runRefreshNow.useMutation({ onSuccess: () => refetchWorldRefresh() });
  const records = worldElections as any[];
  const signals = rankedWorldSignals(records).slice(0, 3);
  const refreshSettings = worldRefresh?.settings as any;
  const monitoring = worldRefresh?.monitoring as any;
  const reviewItems = ((worldRefresh?.items as any[] ?? []).filter((item) => item.lastStatus === "changed" || item.lastStatus === "needs_review")).length;

  return <div className="space-y-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-primary text-xs font-bold uppercase tracking-[.16em]">Public map integrity</p><h2 className="mt-1 text-xl font-bold">Atlas & World Elections Operations</h2><p className="mt-1 max-w-3xl text-sm text-muted-foreground">A compact review surface for the public 50-state historical map and the review-only World Elections refresh workflow.</p></div><div className="flex gap-2"><a href="/atlas" className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5">Open Atlas</a><a href="/world" className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5">Open World Elections</a></div></div>

    <div className="space-y-4">
      <AtlasOperationsAdmin />

      <section className="glass-card rounded-xl p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider"><Globe2 size={16} className="text-cyan-500" /> World Elections public signal</h3><p className="mt-1 text-xs text-muted-foreground">Homepage and World page signals rank the current database records; source monitoring proposes review work only.</p></div><button onClick={() => runWorldRefresh.mutate()} disabled={runWorldRefresh.isPending} className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50">{runWorldRefresh.isPending ? "Refreshing…" : "Refresh sources"}</button></div><div className="mt-4 space-y-2">{signals.length ? signals.map((signal: any) => <div key={signal.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/50 px-3 py-2"><div><p className="text-sm font-semibold text-foreground">{signal.country}</p><p className="text-xs text-muted-foreground">{worldSignalLabel(signal)} · {signal.electionDate}</p></div><span className="rounded bg-cyan-500/10 px-2 py-1 text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-300">{signal.status}</span></div>) : <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">No World Elections signals are currently available.</p>}</div><div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.045] p-3 text-xs text-muted-foreground"><div className="flex flex-wrap items-center justify-between gap-2"><p><strong className="text-foreground">Autonomous monitor:</strong> {monitoring?.scheduleActive ? "Scheduled" : "Awaiting schedule activation"}</p><span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-300">{monitoring?.cadence === "hourly" ? "Hourly voting-day watch" : monitoring?.cadence === "six_hour" ? "Every 6 hours · next 30 days" : "Daily baseline"}</span></div><p className="mt-1">{monitoring?.votingTodayCount ?? 0} voting today · {monitoring?.nearTermCount ?? 0} election{(monitoring?.nearTermCount ?? 0) === 1 ? "" : "s"} within 30 days. Source changes enter Data Desk review; public records are not changed automatically.</p></div><div className="mt-3 rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground"><p><strong className="text-foreground">Last review:</strong> {refreshSettings?.lastSummary ?? "No dated source-refresh summary is recorded yet."}</p><p className="mt-1"><strong className="text-foreground">Review queue:</strong> {reviewItems} change{reviewItems === 1 ? "" : "s"} require Data Desk approval; public records are not changed automatically.</p></div></section>
    </div>
  </div>;
}

function AudienceTab() {
  const [days, setDays] = useState<7 | 30>(7);
  const { data: summary, isLoading, dataUpdatedAt, refetch } = trpc.siteAnalytics.engagementSummary.useQuery({ days }, { refetchInterval: 60_000 });
  const maxDailyVisits = Math.max(...(summary?.daily.map((item) => item.visits) ?? []), 1);
  const deviceIcon = { desktop: Monitor, tablet: TabletSmartphone, mobile: Smartphone } as const;

  if (isLoading) return <div className="space-y-4"><div className="h-32 rounded-xl bg-muted animate-pulse" /><div className="h-72 rounded-xl bg-muted animate-pulse" /></div>;

  return (
    <div className="space-y-5">
      <section className="glass-card rounded-xl border border-primary/25 bg-primary/[0.035] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Audience intelligence</p>
            <h2 className="mt-1 text-lg font-bold">Site Engagement & Visits</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Understand which public experiences are being reached, without turning readers into a profile. Reporting begins with this release and refreshes every minute.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-border bg-background p-0.5">
              {([7, 30] as const).map((range) => <button key={range} onClick={() => setDays(range)} className={`rounded px-2.5 py-1 text-xs font-semibold ${days === range ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{range} days</button>)}
            </div>
            <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"><RefreshCw size={13} /> Refresh</button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <EngagementMetric icon={MousePointerClick} label="Today’s visits" value={summary?.todayVisits ?? 0} detail="Public route views" tone="gold" />
          <EngagementMetric icon={Users} label="Today’s unique sessions" value={summary?.todayUniqueSessions ?? 0} detail="Anonymous browser sessions" tone="good" />
          <EngagementMetric icon={BarChart3} label={`${days}-day visits`} value={summary?.totalVisits ?? 0} detail="All recorded public views" />
          <EngagementMetric icon={Users} label={`${days}-day unique sessions`} value={summary?.uniqueSessions ?? 0} detail="Not an account or person count" />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="glass-card rounded-xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-bold uppercase tracking-wider">Daily visit pattern</h3><p className="mt-1 text-xs text-muted-foreground">Public route views over the selected period.</p></div><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase text-muted-foreground">{summary?.daily.length ?? 0} active days</span></div>
          {summary?.daily.length ? <div className="mt-5 flex h-40 items-end gap-2 border-b border-border/80 pb-5">{summary.daily.map((item) => <div key={item.day} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`${item.day}: ${item.visits} visits · ${item.uniqueSessions} unique sessions`}><span className="text-[10px] font-semibold text-foreground opacity-0 transition-opacity group-hover:opacity-100">{item.visits}</span><div className="w-full max-w-10 rounded-t bg-primary/75 transition-colors group-hover:bg-primary" style={{ height: `${Math.max(8, Math.round((item.visits / maxDailyVisits) * 100))}%` }} /><span className="text-[9px] text-muted-foreground">{new Date(`${item.day}T00:00:00`).toLocaleDateString(undefined, { month: "numeric", day: "numeric" })}</span></div>)}</div> : <EngagementEmpty title="No public visits recorded yet" detail="Collection begins with this release. The first visit will appear here after the dashboard refreshes." />}
        </div>
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-bold uppercase tracking-wider">Device mix</h3><p className="mt-1 text-xs text-muted-foreground">Screen-class estimates; raw browser fingerprints are not stored.</p>
          {summary?.devices.length ? <div className="mt-4 space-y-3">{summary.devices.map((item) => { const Icon = deviceIcon[item.deviceType]; const share = summary.totalVisits ? Math.round((item.visits / summary.totalVisits) * 100) : 0; return <div key={item.deviceType}><div className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2 font-semibold capitalize text-foreground"><Icon size={14} className="text-primary" />{item.deviceType}</span><span className="text-muted-foreground">{item.visits} visits · {share}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${share}%` }} /></div></div>; })}</div> : <EngagementEmpty title="Device mix will appear with traffic" detail="Only desktop, tablet, and mobile categories are stored." />}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="glass-card rounded-xl p-5"><div><h3 className="text-sm font-bold uppercase tracking-wider">Most visited public pages</h3><p className="mt-1 text-xs text-muted-foreground">Route-level interest, ranked by recorded visits.</p></div>{summary?.topPages.length ? <div className="mt-4 divide-y divide-border overflow-hidden rounded-lg border border-border/70">{summary.topPages.map((page, index) => <div key={page.pagePath} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5"><span className="text-xs font-bold text-primary">{index + 1}</span><div className="min-w-0"><p className="truncate font-mono text-xs font-semibold text-foreground">{page.pagePath}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{page.uniqueSessions} unique sessions</p></div><span className="text-sm font-bold text-foreground">{page.visits}</span></div>)}</div> : <EngagementEmpty title="No page rankings yet" detail="Rankings appear once public visitors open the site." />}</div>
        <div className="glass-card rounded-xl p-5"><div><h3 className="text-sm font-bold uppercase tracking-wider">Referring sites</h3><p className="mt-1 text-xs text-muted-foreground">External host names only; paths, search terms, and full referrer URLs are never retained.</p></div>{summary?.referrers.length ? <div className="mt-4 space-y-2">{summary.referrers.map((referrer) => <div key={referrer.referrerHost} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/50 px-3 py-2.5"><span className="truncate text-sm font-medium text-foreground">{referrer.referrerHost}</span><span className="shrink-0 text-xs font-bold text-primary">{referrer.visits} visits</span></div>)}</div> : <EngagementEmpty title="No external referrers yet" detail="Direct visits and internal navigation intentionally do not create referrer records." />}</div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="glass-card rounded-xl p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-sm font-bold uppercase tracking-wider">Recent public activity</h3><p className="mt-1 text-xs text-muted-foreground">The latest anonymous route views. Session identifiers are deliberately never shown.</p></div><span className="text-[11px] text-muted-foreground">Updated {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "now"}</span></div>{summary?.recentActivity.length ? <div className="mt-4 max-h-80 divide-y divide-border overflow-y-auto rounded-lg border border-border/70">{summary.recentActivity.map((event) => { const Icon = deviceIcon[event.deviceType]; return <div key={event.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2.5"><div className="min-w-0"><p className="truncate font-mono text-xs font-semibold text-foreground">{event.pagePath}</p><p className="mt-0.5 truncate text-[11px] text-muted-foreground">{event.referrerHost ? `From ${event.referrerHost}` : "Direct or internal visit"}</p></div><div className="flex items-center gap-2 text-[11px] text-muted-foreground"><Icon size={13} /><span>{new Date(event.visitedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div></div>; })}</div> : <EngagementEmpty title="No anonymous activity to show" detail="This private log starts after the engagement tracker is live." />}</div>
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.045] p-5"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-emerald-700 dark:text-emerald-300" /><h3 className="text-sm font-bold uppercase tracking-wider">Privacy boundary</h3></div><p className="mt-3 text-sm leading-6 text-muted-foreground">This workspace records a page path, visit time, screen class, a one-way session hash, and an external host name when available. It does not record IP addresses, raw user agents, personal account data, full referrer URLs, query strings, or page content.</p><div className="mt-4 rounded-lg border border-emerald-500/20 bg-background/50 p-3 text-xs text-muted-foreground"><p><strong className="text-foreground">Interpretation note:</strong> “Unique sessions” estimates distinct browser sessions, not distinct people. It is useful for editorial reach trends, not audience identity.</p></div></div>
      </section>
    </div>
  );
}

function EngagementMetric({ icon: Icon, label, value, detail, tone = "neutral" }: { icon: typeof Users; label: string; value: number; detail: string; tone?: "neutral" | "gold" | "good" }) {
  const toneClass = tone === "gold" ? "border-primary/30 bg-primary/[0.05]" : tone === "good" ? "border-emerald-500/25 bg-emerald-500/[0.045]" : "border-border bg-background/50";
  return <div className={`rounded-lg border p-3 ${toneClass}`}><div className="flex items-start justify-between gap-2"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold text-foreground">{value.toLocaleString()}</p></div><Icon size={16} className={tone === "good" ? "text-emerald-700 dark:text-emerald-300" : "text-primary"} /></div><p className="mt-1 text-[11px] text-muted-foreground">{detail}</p></div>;
}

function EngagementEmpty({ title, detail }: { title: string; detail: string }) {
  return <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center"><p className="text-sm font-semibold text-foreground">{title}</p><p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">{detail}</p></div>;
}

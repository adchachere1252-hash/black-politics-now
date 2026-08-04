import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useState } from "react";
import { Shield, Radio, MapPin, Users } from "lucide-react";

type AdminTab = "overview" | "podcast" | "elections" | "audience";

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<AdminTab>("overview");

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

      {tab === "overview" && <OverviewTab />}
      {tab === "podcast" && <PodcastOpsTab />}
      {tab === "elections" && <ElectionOpsTab />}
      {tab === "audience" && <AudienceTab />}
    </div>
  );
}

function OverviewTab() {
  const { data: scoreboard } = trpc.election.scoreboard.useQuery();
  const { data: episodes } = trpc.podcast.getEpisodes.useQuery();
  return (
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
  );
}

function PodcastOpsTab() {
  const { data: runs = [] } = trpc.podcast.pipelineRuns.useQuery();
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Pipeline Runs</h2>
      {(runs as any[]).length === 0 ? (
        <p className="text-muted-foreground text-sm">No pipeline runs recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {(runs as any[]).map((run: any) => (
            <div key={run.id} className="glass-card rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{run.episodeDate}</p>
                <p className="text-xs text-muted-foreground">Status: {run.status}</p>
              </div>
              <span className="text-xs text-muted-foreground">{run.startedAt ? new Date(run.startedAt).toLocaleString() : ""}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ElectionOpsTab() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Election Data Management</h2>
      <p className="text-muted-foreground text-sm">Use the Election Center page to view race data. Admin editing features coming soon.</p>
      <p className="text-xs text-muted-foreground mt-2">Tip: Race updates can be made via the database panel in Settings.</p>
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

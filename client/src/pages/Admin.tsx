import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { useState, useMemo } from "react";
import { Shield, Radio, MapPin, Users, Save, Check, Search, Star } from "lucide-react";

type AdminTab = "overview" | "podcast" | "elections" | "cbc" | "audience";

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
          { key: "cbc", label: "CBC Members", icon: Star },
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
      {tab === "cbc" && <CbcOpsTab />}
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
  const [pctReporting, setPctReporting] = useState(race.pctReporting?.toString() ?? "0");
  const [votes1, setVotes1] = useState(race.candidate1Votes?.toString() ?? "0");
  const [votes2, setVotes2] = useState(race.candidate2Votes?.toString() ?? "0");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({
      rating: rating || null,
      calledWinner: calledWinner || null,
      calledParty: calledParty || null,
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
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ rating: rating || null, calledWinner: calledWinner || null });
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
  const utils = trpc.useUtils();
  const updateCbc = trpc.election.updateCbc.useMutation({ onSuccess: () => utils.election.cbc.invalidate() });

  const filtered = (members as any[]).filter((m: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return m.member?.toLowerCase().includes(q) || m.district?.toLowerCase().includes(q) || m.state?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">CBC Member Editor</h2>
      <p className="text-xs text-muted-foreground mb-4">Edit CBC member statuses, primary results, and notes.</p>
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
    </div>
  );
}

function CbcEditor({ member, onSave, saving }: { member: any; onSave: (data: any) => void; saving: boolean }) {
  const [status, setStatus] = useState(member.status ?? "running");
  const [primaryResult, setPrimaryResult] = useState(member.primaryResult ?? "");
  const [notes, setNotes] = useState(member.notes ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ status, primaryResult: primaryResult || null, notes: notes || null });
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

function AudienceTab() {
  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Audience Insights</h2>
      <p className="text-muted-foreground text-sm">Analytics and subscriber data will appear here once traffic is established.</p>
    </div>
  );
}

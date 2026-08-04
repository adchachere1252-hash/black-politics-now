import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Star, Users, Scale, MapPin, AlertTriangle } from "lucide-react";
import { USMap } from "@/components/USMap";
import { USMapFull } from "@/components/USMapFull";
import { ResultsTicker } from "@/components/ResultsTicker";

const RATINGS = ["All", "Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"] as const;
type ViewTab = "house" | "senate" | "governors" | "cbc" | "redistricting";

// ─── Starfield Background ─────────────────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    const stars: { x: number; y: number; r: number; a: number; da: number; color: string }[] = [];

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
    }
    resize();
    window.addEventListener("resize", resize);

    // Generate small, subtle stars — tiny pinpoints like a real night sky
    const starColors = ["255,255,255", "210,225,255", "255,245,220", "190,210,255"];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.0 + 0.3, // tiny: 0.3px to 1.3px
        a: Math.random() * 0.4 + 0.3, // subtle: 0.3 to 0.7 opacity
        da: (Math.random() - 0.5) * 0.008, // very gentle twinkle
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    function draw() {
      ctx!.fillStyle = "#0a0a14";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      // Draw small twinkling stars — no glow, no spikes, just pinpoints
      for (const s of stars) {
        s.a += s.da;
        if (s.a > 0.7) { s.a = 0.7; s.da *= -1; }
        if (s.a < 0.2) { s.a = 0.2; s.da *= -1; }
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${s.color}, ${s.a})`;
        ctx!.fill();
      }

      // Occasional subtle shooting star (rare, thin, fast)
      if (Math.random() < 0.003) {
        const sx = Math.random() * canvas!.width * 0.7;
        const sy = Math.random() * canvas!.height * 0.4;
        const len = 40 + Math.random() * 30;
        const grad = ctx!.createLinearGradient(sx, sy, sx + len, sy + len * 0.5);
        grad.addColorStop(0, "rgba(255,255,255,0.6)");
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx!.beginPath();
        ctx!.moveTo(sx, sy);
        ctx!.lineTo(sx + len, sy + len * 0.5);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ background: "#0a0a14" }} />;
}

export default function Elections() {
  const [tab, setTab] = useState<ViewTab>("senate");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const { data: senateRaces = [] } = trpc.election.senate.useQuery();
  const { data: houseRaces = [] } = trpc.election.house.useQuery();
  const { data: governors = [] } = trpc.election.governors.useQuery();
  const { data: cbcMembers = [] } = trpc.election.cbc.useQuery();
  const { data: redistrictingStates = [] } = trpc.election.redistricting.useQuery();
  const { data: scoreboard } = trpc.election.scoreboard.useQuery();

  // Build map data from senate races
  const mapData = useMemo(() => {
    const data: Record<string, { rating: string | null; candidate1: string; candidate2: string; calledWinner?: string | null }> = {};
    (senateRaces as any[]).forEach((r: any) => {
      if (r.stateCode) {
        data[r.stateCode] = {
          rating: r.rating,
          candidate1: `${r.candidate1Name ?? "TBD"} (${r.candidate1Party ?? "?"})`,
          candidate2: `${r.candidate2Name ?? "TBD"} (${r.candidate2Party ?? "?"})`,
          calledWinner: r.calledWinner,
        };
      }
    });
    return data;
  }, [senateRaces]);

  const filteredSenate = useMemo(() => {
    let races = senateRaces as any[];
    if (ratingFilter !== "All") races = races.filter(r => r.rating === ratingFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      races = races.filter(r => r.stateName?.toLowerCase().includes(q) || r.candidate1Name?.toLowerCase().includes(q) || r.candidate2Name?.toLowerCase().includes(q));
    }
    if (selectedState) races = races.filter(r => r.stateCode === selectedState);
    return races;
  }, [senateRaces, ratingFilter, searchQuery, selectedState]);

  const filteredHouse = useMemo(() => {
    let races = houseRaces as any[];
    if (ratingFilter !== "All") races = races.filter(r => r.rating === ratingFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      races = races.filter(r => r.stateName?.toLowerCase().includes(q) || r.candidate1Name?.toLowerCase().includes(q) || r.candidate2Name?.toLowerCase().includes(q));
    }
    if (selectedState) races = races.filter(r => r.stateCode === selectedState);
    return races;
  }, [houseRaces, ratingFilter, searchQuery, selectedState]);

  const filteredGovs = useMemo(() => {
    let races = governors as any[];
    if (ratingFilter !== "All") races = races.filter(r => r.rating === ratingFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      races = races.filter(r => r.stateName?.toLowerCase().includes(q));
    }
    if (selectedState) races = races.filter(r => r.stateCode === selectedState);
    return races;
  }, [governors, ratingFilter, searchQuery, selectedState]);

  const filteredCbc = useMemo(() => {
    let members = cbcMembers as any[];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      members = members.filter(m => m.member?.toLowerCase().includes(q) || m.state?.toLowerCase().includes(q) || m.district?.toLowerCase().includes(q));
    }
    if (selectedState) members = members.filter(m => m.stateCode === selectedState);
    return members;
  }, [cbcMembers, searchQuery, selectedState]);

  const filteredRedistricting = useMemo(() => {
    let states = redistrictingStates as any[];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      states = states.filter(s => s.stateName?.toLowerCase().includes(q) || s.reason?.toLowerCase().includes(q));
    }
    if (selectedState) states = states.filter(s => s.stateCode === selectedState);
    return states;
  }, [redistrictingStates, searchQuery, selectedState]);

  const tabs: { id: ViewTab; label: string; icon: any }[] = [
    { id: "cbc", label: "CBC", icon: Star },
    { id: "governors", label: "Governor", icon: MapPin },
    { id: "house", label: "House", icon: Users },
    { id: "redistricting", label: "Redistricting", icon: AlertTriangle },
    { id: "senate", label: "Senate", icon: Scale },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Starfield background */}
      <Starfield />

      <div className="container py-8 relative z-10">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold mb-1">2026 U.S. Election Center</h1>
          <p className="text-muted-foreground text-sm">Real-time race ratings, results, and analysis.</p>
        </div>

        {/* Results Ticker */}
        <div className="mb-6">
          <ResultsTicker senateRaces={senateRaces as any[]} houseRaces={houseRaces as any[]} governors={governors as any[]} />
        </div>

        {/* Tabs + Filters (moved under ticker) */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="flex gap-0.5 bg-muted/50 backdrop-blur rounded-lg p-0.5 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search races..."
                className="w-full pl-8 pr-3 py-2 bg-muted/50 backdrop-blur rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            {(tab === "senate" || tab === "house" || tab === "governors") && (
              <select
                value={ratingFilter}
                onChange={e => setRatingFilter(e.target.value)}
                className="bg-muted/50 backdrop-blur rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Interactive Map */}
        <div className="glass-card rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Interactive Election Map</h2>
            {selectedState && (
              <button onClick={() => setSelectedState(null)} className="text-xs text-primary hover:underline">
                Clear filter ({selectedState})
              </button>
            )}
          </div>
          {/* Full geographic map on desktop, simplified on mobile */}
          <div className="hidden md:block">
            <USMapFull
              raceData={mapData}
              onStateClick={(id) => setSelectedState(prev => prev === id ? null : id)}
              selectedState={selectedState}
            />
          </div>
          <div className="md:hidden">
            <USMap
              raceData={mapData}
              onStateClick={(id) => setSelectedState(prev => prev === id ? null : id)}
              selectedState={selectedState}
            />
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"].map(r => (
              <div key={r} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getRatingColor(r) }} />
                <span className="text-xs text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scoreboard */}
        {scoreboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <ScoreCard label="Senate Dem" value={scoreboard.senate.dem} color="var(--color-solid-d)" />
            <ScoreCard label="Senate Rep" value={scoreboard.senate.rep} color="var(--color-solid-r)" />
            <ScoreCard label="House Dem" value={scoreboard.house.dem} color="var(--color-solid-d)" />
            <ScoreCard label="House Rep" value={scoreboard.house.rep} color="var(--color-solid-r)" />
          </div>
        )}

        {/* Race list */}
        {tab === "senate" && <RaceGrid races={filteredSenate} chamber="senate" />}
        {tab === "house" && <RaceGrid races={filteredHouse} chamber="house" />}
        {tab === "governors" && <GovernorGrid races={filteredGovs} />}
        {tab === "cbc" && <CbcGrid members={filteredCbc} />}
        {tab === "redistricting" && <RedistrictingGrid states={filteredRedistricting} />}
      </div>
    </div>
  );
}

function getRatingColor(rating: string | null): string {
  switch (rating) {
    case "Solid D": return "#1a4fa0";
    case "Likely D": return "#3a6fc0";
    case "Lean D": return "#5b8fd4";
    case "Toss-up": return "#7c3aed";
    case "Lean R": return "#d96b4a";
    case "Likely R": return "#c04040";
    case "Solid R": return "#b22222";
    default: return "#2a2f3a";
  }
}

function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function RaceGrid({ races, chamber }: { races: any[]; chamber: string }) {
  if (races.length === 0) return <p className="text-center text-muted-foreground py-8">No races match your filters.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {races.map((race) => (
        <div key={race.id} className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">
              {race.stateName}
              {chamber === "house" && race.district ? ` - ${race.districtLabel || `District ${race.district}`}` : ""}
            </h3>
            <RatingBadge rating={race.rating} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{race.candidate1Name ?? "TBD"} ({race.candidate1Party ?? "?"})</span>
            <span>{race.candidate2Name ?? "TBD"} ({race.candidate2Party ?? "?"})</span>
          </div>
          {(race.candidate1VotePct || race.candidate2VotePct) && (
            <div className="flex h-2 rounded-full overflow-hidden bg-muted mt-2">
              <div className="bg-[var(--color-solid-d)]" style={{ width: `${race.candidate1VotePct ?? 0}%` }} />
              <div className="bg-[var(--color-solid-r)]" style={{ width: `${race.candidate2VotePct ?? 0}%` }} />
            </div>
          )}
          {race.calledWinner && (
            <p className="text-xs text-primary mt-2 font-medium">Winner: {race.calledWinner} ({race.calledParty})</p>
          )}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Status: {race.status}</span>
            {race.pctReporting != null && <span>{race.pctReporting}% reporting</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function GovernorGrid({ races }: { races: any[] }) {
  if (races.length === 0) return <p className="text-center text-muted-foreground py-8">No races match your filters.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {races.map((race) => (
        <div key={race.id} className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">{race.stateName}</h3>
            <RatingBadge rating={race.rating} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{race.demCandidate ?? "TBD"} (D)</span>
            <span>{race.repCandidate ?? "TBD"} (R)</span>
          </div>
          {race.calledWinner && (
            <p className="text-xs text-primary mt-2 font-medium">Winner: {race.calledWinner}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function CbcGrid({ members }: { members: any[] }) {
  if (members.length === 0) return <p className="text-center text-muted-foreground py-8">No CBC members match your search.</p>;

  const statusColors: Record<string, string> = {
    running: "bg-green-500/20 text-green-400",
    retiring: "bg-amber-500/20 text-amber-400",
    resigned: "bg-red-500/20 text-red-400",
    deceased: "bg-gray-500/20 text-gray-400",
    lost_primary: "bg-rose-500/20 text-rose-400",
    running_for_governor: "bg-purple-500/20 text-purple-400",
    running_for_senate: "bg-blue-500/20 text-blue-400",
    not_up_2026: "bg-gray-500/20 text-gray-400",
    challenger: "bg-cyan-500/20 text-cyan-400",
  };

  const statusLabels: Record<string, string> = {
    running: "Running",
    retiring: "Retiring",
    resigned: "Resigned",
    deceased: "Deceased/Vacancy",
    lost_primary: "Lost Primary",
    running_for_governor: "Running for Governor",
    running_for_senate: "Running for Senate",
    not_up_2026: "Not Up in 2026",
    challenger: "Challenger",
  };

  // Summary stats
  const running = members.filter(m => m.status === "running").length;
  const retiring = members.filter(m => m.status === "retiring").length;
  const runningForHigher = members.filter(m => m.status === "running_for_governor" || m.status === "running_for_senate").length;

  return (
    <div>
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-primary">{members.length}</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Running</p>
          <p className="text-2xl font-bold text-green-400">{running}</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Retiring</p>
          <p className="text-2xl font-bold text-amber-400">{retiring}</p>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground">Running for Higher Office</p>
          <p className="text-2xl font-bold text-purple-400">{runningForHigher}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {members.map((m) => (
          <div key={m.id} className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">{m.member}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status] ?? "bg-muted text-muted-foreground"}`}>
                {statusLabels[m.status] ?? m.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`font-bold ${m.party === "D" ? "text-blue-400" : m.party === "R" ? "text-red-400" : "text-gray-400"}`}>
                ({m.party})
              </span>
              <span>{m.district}</span>
              <span>•</span>
              <span>{m.state}</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="capitalize">{m.chamber}</span>
              {!m.upIn2026 && <span className="text-gray-500">• Not up in 2026</span>}
            </div>
            {m.primaryResult && (
              <p className="mt-2 text-xs text-green-400/80 italic">{m.primaryResult}</p>
            )}
            {m.notes && (
              <p className="mt-1 text-xs text-muted-foreground/70">{m.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RedistrictingGrid({ states }: { states: any[] }) {
  if (states.length === 0) return <p className="text-center text-muted-foreground py-8">No redistricting states match your search.</p>;
  return (
    <div className="grid grid-cols-1 gap-4">
      {states.map((s) => (
        <div key={s.id} className="glass-card rounded-lg p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">{s.stateName} ({s.stateCode})</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.enacted ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
              {s.enacted ? "Enacted" : "Pending"}
            </span>
          </div>
          {s.reason && <p className="text-sm text-foreground/80 mb-2">{s.reason}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {s.method && (
              <div>
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="text-sm font-medium">{s.method}</p>
              </div>
            )}
            {s.delegationBefore && (
              <div>
                <p className="text-xs text-muted-foreground">Delegation Before</p>
                <p className="text-sm font-medium">{s.delegationBefore}</p>
              </div>
            )}
            {s.projectedImpact && (
              <div>
                <p className="text-xs text-muted-foreground">Projected Impact</p>
                <p className="text-sm font-medium text-primary">{s.projectedImpact}</p>
              </div>
            )}
          </div>
          {s.litigationNotes && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1 font-medium">Litigation Notes</p>
              <p className="text-xs text-foreground/70 leading-relaxed">{s.litigationNotes}</p>
            </div>
          )}
          {s.status && (
            <p className="text-xs text-muted-foreground mt-2">Status: {s.status}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RatingBadge({ rating }: { rating: string | null }) {
  const cls = getRatingClass(rating);
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{rating ?? "N/A"}</span>;
}

function getRatingClass(rating: string | null) {
  switch (rating) {
    case "Solid D": return "rating-solid-d";
    case "Likely D": return "rating-likely-d";
    case "Lean D": return "rating-lean-d";
    case "Toss-up": return "rating-tossup";
    case "Lean R": return "rating-lean-r";
    case "Likely R": return "rating-likely-r";
    case "Solid R": return "rating-solid-r";
    default: return "bg-muted text-muted-foreground";
  }
}

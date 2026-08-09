import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Search, Star, Users, Scale, MapPin, AlertTriangle } from "lucide-react";
import { USMap } from "@/components/USMap";
import { USMapFull } from "@/components/USMapFull";
import { ResultsTicker } from "@/components/ResultsTicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RATINGS = ["All", "Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"] as const;
type ViewTab = "house" | "senate" | "governors" | "cbc" | "redistricting";

// Helper to convert state name to state code
const STATE_NAME_TO_CODE: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC", "Florida": "FL",
  "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN",
  "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME",
  "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
  "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
  "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI",
  "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI",
  "Wyoming": "WY"
};
function getStateCodeFromName(name: string): string | null {
  return STATE_NAME_TO_CODE[name] ?? null;
}

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
  const [statePopupOpen, setStatePopupOpen] = useState(false);
  const [popupState, setPopupState] = useState<string | null>(null);
  const { theme } = useTheme();

  // Auto-refresh every 60s when live results are coming in
  const isLive = typeof window !== "undefined" && (window as any).__BPN_LIVE_MODE__;
  const refetchInterval = isLive ? 60_000 : false;

  const { data: senateRaces = [] } = trpc.election.senate.useQuery(undefined, { refetchInterval });
  const { data: houseRaces = [] } = trpc.election.house.useQuery(undefined, { refetchInterval });
  const { data: governors = [] } = trpc.election.governors.useQuery(undefined, { refetchInterval });
  const { data: cbcMembers = [] } = trpc.election.cbc.useQuery();
  const { data: redistrictingStates = [] } = trpc.election.redistricting.useQuery();
  const { data: scoreboard } = trpc.election.scoreboard.useQuery(undefined, { refetchInterval });

  // Detect live mode: if any race has pctReporting > 0, we're in live mode
  const hasLiveData = useMemo(() => {
    return (senateRaces as any[]).some((r: any) => r.pctReporting > 0) ||
      (houseRaces as any[]).some((r: any) => r.pctReporting > 0) ||
      (governors as any[]).some((r: any) => r.pctReporting > 0);
  }, [senateRaces, houseRaces, governors]);

  // Set global live mode flag for auto-refresh
  if (typeof window !== "undefined") {
    (window as any).__BPN_LIVE_MODE__ = hasLiveData;
  }

  // Build map data from senate races
  // Build map data based on active tab
  const mapData = useMemo(() => {
    const data: Record<string, { rating: string | null; candidate1: string; candidate2: string; calledWinner?: string | null }> = {};
    if (tab === "senate") {
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
    } else if (tab === "governors") {
      (governors as any[]).forEach((r: any) => {
        if (r.stateCode) {
          data[r.stateCode] = {
            rating: r.rating,
            candidate1: r.demCandidate ? `${r.demCandidate} (D)` : "Dem: Pending",
            candidate2: r.repCandidate ? `${r.repCandidate} (R)` : "Rep: Pending",
            calledWinner: r.calledWinner,
          };
        }
      });
    } else if (tab === "house") {
      // Aggregate House races by state - show most competitive rating
      const stateRatings: Record<string, string[]> = {};
      (houseRaces as any[]).forEach((r: any) => {
        if (r.stateCode) {
          if (!stateRatings[r.stateCode]) stateRatings[r.stateCode] = [];
          if (r.rating) stateRatings[r.stateCode].push(r.rating);
        }
      });
      Object.entries(stateRatings).forEach(([code, ratings]) => {
        const priority = ["Toss-up", "Lean D", "Lean R", "Likely D", "Likely R", "Solid D", "Solid R"];
        const best = priority.find(p => ratings.includes(p)) ?? ratings[0] ?? null;
        const dCount = ratings.filter(r => r.includes("D")).length;
        const rCount = ratings.filter(r => r.includes("R")).length;
        const tossups = ratings.filter(r => r === "Toss-up").length;
        data[code] = {
          rating: best,
          candidate1: `${ratings.length} districts`,
          candidate2: `D: ${dCount} | R: ${rCount}${tossups ? ` | Toss-up: ${tossups}` : ""}`,
          calledWinner: null,
        };
      });
    } else if (tab === "cbc") {
      // Show CBC member states highlighted in blue
      const cbcStates: Record<string, number> = {};
      (cbcMembers as any[]).forEach((m: any) => {
        const stateCode = getStateCodeFromName(m.state);
        if (stateCode) {
          cbcStates[stateCode] = (cbcStates[stateCode] || 0) + 1;
        }
      });
      Object.entries(cbcStates).forEach(([code, count]) => {
        data[code] = {
          rating: "Solid D", // Blue to highlight CBC presence
          candidate1: `${count} CBC member${count > 1 ? "s" : ""}`,
          candidate2: "Congressional Black Caucus",
          calledWinner: null,
        };
      });
    } else if (tab === "redistricting") {
      // Show redistricting states
      (redistrictingStates as any[]).forEach((s: any) => {
        const code = getStateCodeFromName(s.stateName);
        if (code) {
          data[code] = {
            rating: s.impact === "Gains Black seats" ? "Solid D" : s.impact === "Loses Black seats" ? "Solid R" : "Toss-up",
            candidate1: s.impact || "Redistricting",
            candidate2: `${s.affectedDistricts || 0} affected districts`,
            calledWinner: null,
          };
        }
      });
    }
    return data;
  }, [senateRaces, houseRaces, governors, cbcMembers, redistrictingStates, tab]);

  // Get data for a specific state based on active tab (for popup)
  const popupData = useMemo(() => {
    if (!popupState) return [];
    if (tab === "house") return (houseRaces as any[]).filter(r => r.stateCode === popupState);
    if (tab === "senate") return (senateRaces as any[]).filter(r => r.stateCode === popupState);
    if (tab === "governors") return (governors as any[]).filter(r => r.stateCode === popupState);
    if (tab === "cbc") return (cbcMembers as any[]).filter(m => m.stateCode === popupState);
    if (tab === "redistricting") return (redistrictingStates as any[]).filter(s => s.stateCode === popupState);
    return [];
  }, [tab, houseRaces, senateRaces, governors, cbcMembers, redistrictingStates, popupState]);

  // Handle state click - open popup with House races
  const handleStateClick = (stateId: string) => {
    setSelectedState(prev => prev === stateId ? null : stateId);
    setPopupState(stateId);
    setStatePopupOpen(true);
  };

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
      {/* Starfield background - only in dark mode */}
      {theme === "dark" && <Starfield />}

      <div className="container py-8 relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold">2026 U.S. Election Center</h1>
            {hasLiveData && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/40 rounded-full text-xs font-bold text-red-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                LIVE
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {hasLiveData ? "Results updating every 60 seconds." : "Real-time race ratings, results, and analysis."}
          </p>
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
              onStateClick={handleStateClick}
              selectedState={selectedState}
            />
          </div>
          <div className="md:hidden">
            <USMap
              raceData={mapData}
              onStateClick={handleStateClick}
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
        <TabScoreboard tab={tab} senateRaces={senateRaces as any[]} houseRaces={houseRaces as any[]} governors={governors as any[]} cbcMembers={cbcMembers as any[]} redistrictingStates={redistrictingStates as any[]} />

        {/* Race list */}
        {tab === "senate" && <RaceGrid races={filteredSenate} chamber="senate" />}
        {tab === "house" && <RaceGrid races={filteredHouse} chamber="house" />}
        {tab === "governors" && <GovernorGrid races={filteredGovs} />}
        {tab === "cbc" && <CbcGrid members={filteredCbc} />}
        {tab === "redistricting" && <RedistrictingGrid states={filteredRedistricting} />}

        {/* State popup dialog showing tab-specific data */}
        <Dialog open={statePopupOpen} onOpenChange={setStatePopupOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{popupState ? Object.entries(STATE_NAME_TO_CODE).find(([,v]) => v === popupState)?.[0] || popupState : ""} — {tab === "senate" ? "Senate Race" : tab === "governors" ? "Governor Race" : tab === "house" ? "House Races" : tab === "cbc" ? "CBC Members" : "Redistricting"}</DialogTitle>
            </DialogHeader>
            {popupData.length > 0 ? (
              <div className="space-y-3">
                {popupData.map((item: any, idx: number) => (
                  <div key={item.id || idx} className="border border-border rounded-lg p-3">
                    {tab === "house" && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">District {item.district}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.rating === "Toss-up" ? "bg-purple-500/20 text-purple-400" : item.rating?.includes("D") ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                            {item.rating}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">{item.candidate1Name} ({item.candidate1Party})</span>
                          <span className="text-red-400">{item.candidate2Name} ({item.candidate2Party})</span>
                        </div>
                      </>
                    )}
                    {tab === "senate" && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{item.stateName} Senate</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.rating === "Toss-up" ? "bg-purple-500/20 text-purple-400" : item.rating?.includes("D") ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                            {item.rating}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">{item.candidate1Name} ({item.candidate1Party})</span>
                          <span className="text-red-400">{item.candidate2Name} ({item.candidate2Party})</span>
                        </div>
                        {item.pctReporting > 0 && <p className="text-xs text-muted-foreground mt-1">{item.pctReporting}% reporting</p>}
                        {item.incumbent && <p className="text-xs text-muted-foreground mt-1">Incumbent: {item.incumbent} ({item.incumbentParty})</p>}
                      </>
                    )}
                    {tab === "governors" && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{item.stateName} Governor</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.rating === "Toss-up" ? "bg-purple-500/20 text-purple-400" : item.rating?.includes("D") ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                            {item.rating}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-400">{item.demCandidate} (D)</span>
                          <span className="text-red-400">{item.repCandidate} (R)</span>
                        </div>
                        {item.incumbent && <p className="text-xs text-muted-foreground mt-1">Incumbent: {item.incumbent} ({item.incumbentParty})</p>}
                      </>
                    )}
                    {tab === "cbc" && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{item.member}</span>
                          <span className="text-xs text-muted-foreground">{item.district}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${item.cbcStatus === "running" ? "bg-green-500/20 text-green-400" : item.cbcStatus === "retiring" ? "bg-yellow-500/20 text-yellow-400" : item.cbcStatus === "lost_primary" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
                            {item.cbcStatus === "lost_primary" ? "Lost Primary" : item.cbcStatus}
                          </span>
                          {item.primaryResult && <span className="text-muted-foreground">{item.primaryResult}</span>}
                        </div>
                      </>
                    )}
                    {tab === "redistricting" && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{item.stateName}</span>
                          <span className="text-xs text-muted-foreground">{item.totalDistricts} districts</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </>
                    )}
                    {item.notes && <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No {tab === "senate" ? "Senate race" : tab === "governors" ? "Governor race" : tab === "house" ? "House races" : tab === "cbc" ? "CBC members" : "redistricting data"} found for this state.</p>
            )}
          </DialogContent>
        </Dialog>
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

function TabScoreboard({ tab, senateRaces, houseRaces, governors, cbcMembers, redistrictingStates }: { tab: ViewTab; senateRaces: any[]; houseRaces: any[]; governors: any[]; cbcMembers: any[]; redistrictingStates: any[] }) {
  if (tab === "senate") {
    const solidD = senateRaces.filter(r => r.rating === "Solid D").length;
    const leanD = senateRaces.filter(r => r.rating === "Lean D" || r.rating === "Likely D").length;
    const tossup = senateRaces.filter(r => r.rating === "Toss-up").length;
    const leanR = senateRaces.filter(r => r.rating === "Lean R" || r.rating === "Likely R").length;
    const solidR = senateRaces.filter(r => r.rating === "Solid R").length;
    return (
      <div className="grid grid-cols-5 gap-2 mb-6">
        <ScoreCard label="Safe D" value={solidD} color="var(--color-solid-d)" />
        <ScoreCard label="Lean/Likely D" value={leanD} color="var(--color-lean-d)" />
        <ScoreCard label="Toss-up" value={tossup} color="var(--color-tossup)" />
        <ScoreCard label="Lean/Likely R" value={leanR} color="var(--color-lean-r)" />
        <ScoreCard label="Safe R" value={solidR} color="var(--color-solid-r)" />
      </div>
    );
  }
  if (tab === "house") {
    const solidD = houseRaces.filter(r => r.rating === "Solid D").length;
    const leanD = houseRaces.filter(r => r.rating === "Lean D" || r.rating === "Likely D").length;
    const tossup = houseRaces.filter(r => r.rating === "Toss-up").length;
    const leanR = houseRaces.filter(r => r.rating === "Lean R" || r.rating === "Likely R").length;
    const solidR = houseRaces.filter(r => r.rating === "Solid R").length;
    return (
      <div className="grid grid-cols-5 gap-2 mb-6">
        <ScoreCard label="Safe D" value={solidD} color="var(--color-solid-d)" />
        <ScoreCard label="Lean/Likely D" value={leanD} color="var(--color-lean-d)" />
        <ScoreCard label="Toss-up" value={tossup} color="var(--color-tossup)" />
        <ScoreCard label="Lean/Likely R" value={leanR} color="var(--color-lean-r)" />
        <ScoreCard label="Safe R" value={solidR} color="var(--color-solid-r)" />
      </div>
    );
  }
  if (tab === "governors") {
    const solidD = governors.filter(r => r.rating === "Solid D").length;
    const leanD = governors.filter(r => r.rating === "Lean D" || r.rating === "Likely D").length;
    const tossup = governors.filter(r => r.rating === "Toss-up").length;
    const leanR = governors.filter(r => r.rating === "Lean R" || r.rating === "Likely R").length;
    const solidR = governors.filter(r => r.rating === "Solid R").length;
    return (
      <div className="grid grid-cols-5 gap-2 mb-6">
        <ScoreCard label="Safe D" value={solidD} color="var(--color-solid-d)" />
        <ScoreCard label="Lean/Likely D" value={leanD} color="var(--color-lean-d)" />
        <ScoreCard label="Toss-up" value={tossup} color="var(--color-tossup)" />
        <ScoreCard label="Lean/Likely R" value={leanR} color="var(--color-lean-r)" />
        <ScoreCard label="Safe R" value={solidR} color="var(--color-solid-r)" />
      </div>
    );
  }
  if (tab === "cbc") {
    const running = cbcMembers.filter(m => m.status === "running").length;
    const retiring = cbcMembers.filter(m => m.status === "retiring").length;
    const higher = cbcMembers.filter(m => m.status === "running_for_governor" || m.status === "running_for_senate").length;
    const lost = cbcMembers.filter(m => m.status === "lost_primary" || m.status === "resigned" || m.status === "deceased").length;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <ScoreCard label="Running" value={running} color="#22c55e" />
        <ScoreCard label="Retiring" value={retiring} color="#f59e0b" />
        <ScoreCard label="Higher Office" value={higher} color="#a855f7" />
        <ScoreCard label="Lost/Vacant" value={lost} color="#ef4444" />
      </div>
    );
  }
  if (tab === "redistricting") {
    return (
      <div className="grid grid-cols-3 gap-2 mb-6">
        <ScoreCard label="States Affected" value={redistrictingStates.length} color="#7c3aed" />
        <ScoreCard label="Gains Black Seats" value={redistrictingStates.filter(s => s.impact?.includes("Gain")).length} color="#22c55e" />
        <ScoreCard label="Loses Black Seats" value={redistrictingStates.filter(s => s.impact?.includes("Los")).length} color="#ef4444" />
      </div>
    );
  }
  return null;
}

function RaceGrid({ races, chamber }: { races: any[]; chamber: string }) {
  if (races.length === 0) return <p className="text-center text-muted-foreground py-8">No races match your filters.</p>;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {races.map((race) => (
        <div
          key={race.id}
          className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => setExpandedId(expandedId === race.id ? null : race.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">
              {race.stateName}
              {chamber === "house" && race.district ? ` - ${race.districtLabel || `District ${race.district}`}` : ""}
            </h3>
            <div className="flex items-center gap-2">
              <RatingBadge rating={race.rating} />
              <span className="text-xs text-muted-foreground">{expandedId === race.id ? "▲" : "▼"}</span>
            </div>
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
          {/* Expanded detail section */}
          {expandedId === race.id && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-in fade-in duration-200">
              {race.incumbent && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Incumbent:</span> <span className="text-foreground">{race.incumbent} ({race.incumbentParty}){race.incumbentRetiring ? " — Retiring" : ""}</span></div>
              )}
              {race.previousParty && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Previous Party:</span> <span className="text-foreground">{race.previousParty}</span></div>
              )}
              {race.primaryDate && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Primary Date:</span> <span className="text-foreground">{race.primaryDate}</span></div>
              )}
              {race.primaryWinner && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Primary Winner:</span> <span className="text-foreground">{race.primaryWinner} ({race.primaryParty})</span></div>
              )}
              {race.candidate1Bio && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">{race.candidate1Name} Bio:</span> <span className="text-foreground">{race.candidate1Bio}</span></div>
              )}
              {race.candidate2Bio && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">{race.candidate2Name} Bio:</span> <span className="text-foreground">{race.candidate2Bio}</span></div>
              )}
              {race.isSpecial && race.specialNote && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Special Election:</span> <span className="text-foreground">{race.specialNote}</span></div>
              )}
              {race.notes && (
                <div className="text-xs p-2 bg-muted/50 rounded mt-1"><span className="text-muted-foreground font-medium">Notes:</span> <span className="text-foreground">{race.notes}</span></div>
              )}
              {!race.incumbent && !race.notes && !race.candidate1Bio && !race.primaryWinner && (
                <p className="text-xs text-muted-foreground italic">No additional details available.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GovernorGrid({ races }: { races: any[] }) {
  if (races.length === 0) return <p className="text-center text-muted-foreground py-8">No races match your filters.</p>;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {races.map((race) => (
        <div
          key={race.id}
          className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => setExpandedId(expandedId === race.id ? null : race.id)}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">{race.stateName}</h3>
            <div className="flex items-center gap-2">
              <RatingBadge rating={race.rating} />
              <span className="text-xs text-muted-foreground">{expandedId === race.id ? "▲" : "▼"}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{race.demCandidate ?? "TBD"} (D)</span>
            <span>{race.repCandidate ?? "TBD"} (R)</span>
          </div>
          {race.calledWinner && (
            <p className="text-xs text-primary mt-2 font-medium">Winner: {race.calledWinner}</p>
          )}
          {/* Expanded detail section */}
          {expandedId === race.id && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-in fade-in duration-200">
              {race.incumbent && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Incumbent:</span> <span className="text-foreground">{race.incumbent} ({race.incumbentParty}){race.termLimited ? " — Term Limited" : ""}</span></div>
              )}
              {race.previousParty && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Previous Party:</span> <span className="text-foreground">{race.previousParty}</span></div>
              )}
              {race.primaryDate && (
                <div className="text-xs"><span className="text-muted-foreground font-medium">Primary Date:</span> <span className="text-foreground">{race.primaryDate}</span></div>
              )}
              {race.notes && (
                <div className="text-xs p-2 bg-muted/50 rounded mt-1"><span className="text-muted-foreground font-medium">Notes:</span> <span className="text-foreground">{race.notes}</span></div>
              )}
              {!race.incumbent && !race.notes && !race.primaryDate && (
                <p className="text-xs text-muted-foreground italic">No additional details available.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CbcGrid({ members }: { members: any[] }) {
  if (members.length === 0) return <p className="text-center text-muted-foreground py-8">No CBC members match your search.</p>;
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
          <div
            key={m.id}
            className="glass-card rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                {m.photo && <img src={m.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-border/50" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <h3 className="text-sm font-bold">{m.member}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status] ?? "bg-muted text-muted-foreground"}`}>
                  {statusLabels[m.status] ?? m.status}
                </span>
                <span className="text-xs text-muted-foreground">{expandedId === m.id ? "▲" : "▼"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`font-bold ${m.party === "D" ? "text-blue-400" : m.party === "R" ? "text-red-400" : "text-gray-400"}`}>
                ({m.party})
              </span>
              <span>{m.district}</span>
              <span>•</span>
              <span>{m.state}</span>
            </div>
            {/* Expanded detail section */}
            {expandedId === m.id && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-in fade-in duration-200">
                <div className="text-xs"><span className="text-muted-foreground font-medium">Chamber:</span> <span className="text-foreground capitalize">{m.chamber}</span></div>
                <div className="text-xs"><span className="text-muted-foreground font-medium">Up in 2026:</span> <span className="text-foreground">{m.upIn2026 ? "Yes" : "No"}</span></div>
                {m.generalOpponent && (
                  <div className="text-xs"><span className="text-muted-foreground font-medium">General Election Opponent:</span> <span className="text-foreground">{m.generalOpponent}</span></div>
                )}
                {m.primaryResult && (
                  <div className="text-xs"><span className="text-muted-foreground font-medium">Primary Result:</span> <span className="text-green-400">{m.primaryResult}</span></div>
                )}
                {m.notes && (
                  <div className="text-xs p-2 bg-muted/50 rounded mt-1"><span className="text-muted-foreground font-medium">Notes:</span> <span className="text-foreground">{m.notes}</span></div>
                )}
                {!m.primaryResult && !m.notes && !m.generalOpponent && (
                  <p className="text-xs text-muted-foreground italic">No additional details available.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RedistrictingGrid({ states }: { states: any[] }) {
  if (states.length === 0) return <p className="text-center text-muted-foreground py-8">No redistricting states match your search.</p>;
  const [expandedId, setExpandedId] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-1 gap-4">
      {states.map((s) => (
        <div
          key={s.id}
          className="glass-card rounded-lg p-5 hover:border-primary/30 transition-colors cursor-pointer"
          onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">{s.stateName} ({s.stateCode})</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.enacted ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                {s.enacted ? "Enacted" : "Pending"}
              </span>
              <span className="text-xs text-muted-foreground">{expandedId === s.id ? "▲" : "▼"}</span>
            </div>
          </div>
          {s.reason && <p className="text-sm text-foreground/80 mb-2">{s.reason}</p>}
          {/* Expanded detail section */}
          {expandedId === s.id && (
            <>
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
            </>
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

import { trpc } from "@/lib/trpc";
import { useState, useMemo, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Search, Star, Users, Scale, MapPin, AlertTriangle, ExternalLink, Trophy, BadgeCheck, Clock3, FileSearch, GitCompareArrows } from "lucide-react";
import { USMapFull } from "@/components/USMapFull";
import { ResultsTicker } from "@/components/ResultsTicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buildElectionMapFreshnessPresentation } from "@/lib/electionFreshness";
import { buildBlackPoliticalRepresentationMapData } from "@/lib/representationMap";
import { buildRepresentationTimeline, buildStateComparisons, getSourceReviewBadge, type SourceReviewBadge } from "@/lib/blackRepresentationInsights";

const RATINGS = ["All", "Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"] as const;
type ViewTab = "house" | "senate" | "governors" | "cbc" | "redistricting";

function normalizeViewTab(value: string | null): ViewTab {
  if (value === "governor" || value === "governors") return "governors";
  if (value === "cbc" || value === "house" || value === "redistricting" || value === "senate") return value;
  return "senate";
}

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
  const [tab, setTab] = useState<ViewTab>(() => {
    const requested = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("tab");
    return normalizeViewTab(requested);
  });
  const [ratingFilter, setRatingFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statePopupOpen, setStatePopupOpen] = useState(false);
  const [popupState, setPopupState] = useState<string | null>(null);
  const { theme } = useTheme();

  const selectTab = (nextTab: ViewTab) => {
    setTab(nextTab);
    setSelectedState(null);
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("tab", nextTab === "governors" ? "governor" : nextTab);
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const syncTabFromUrl = () => setTab(normalizeViewTab(new URLSearchParams(window.location.search).get("tab")));
    window.addEventListener("popstate", syncTabFromUrl);
    return () => window.removeEventListener("popstate", syncTabFromUrl);
  }, []);

  // Poll every minute so Election Night data begins flowing without requiring a page refresh.
  const refetchInterval = 60_000;

  const { data: senateRaces = [] } = trpc.election.senate.useQuery(undefined, { refetchInterval });
  const { data: houseRaces = [] } = trpc.election.house.useQuery(undefined, { refetchInterval });
  const { data: governors = [] } = trpc.election.governors.useQuery(undefined, { refetchInterval });
  const { data: cbcMembers = [] } = trpc.election.cbc.useQuery(undefined, { refetchInterval });
  const { data: blackRepresentationElections = [] } = trpc.election.blackRepresentationElections.useQuery(undefined, { refetchInterval });
  const { data: redistrictingStates = [] } = trpc.election.redistricting.useQuery();
  const { data: scoreboard } = trpc.election.scoreboard.useQuery(undefined, { refetchInterval });
  const { data: electionFreshness } = trpc.election.freshness.useQuery(undefined, { refetchInterval });

  // Detect live mode from in-progress contests only. Historical special/primary calls
  // retain their results without making the entire Election Center look live.
  const hasLiveData = useMemo(() => {
    const isInProgress = (race: any) => Number(race.pctReporting || 0) > 0
      && !race.calledWinner
      && race.status === "Voting";
    return (senateRaces as any[]).some(isInProgress) ||
      (houseRaces as any[]).some(isInProgress) ||
      (governors as any[]).some(isInProgress);
  }, [senateRaces, houseRaces, governors]);

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
      Object.assign(data, buildBlackPoliticalRepresentationMapData(cbcMembers as any[], (member) => member.stateCode ?? getStateCodeFromName(member.state ?? "")));
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

  const mapRecordUpdatedAt = useMemo(() => {
    const activeRecords = tab === "senate" ? senateRaces as any[]
      : tab === "house" ? houseRaces as any[]
      : tab === "governors" ? governors as any[]
      : tab === "cbc" ? cbcMembers as any[]
      : redistrictingStates as any[];
    const timestamps = activeRecords
      .map((record: any) => record.updatedAt ?? record.updated_at)
      .map((value: any) => value ? new Date(value).getTime() : NaN)
      .filter(Number.isFinite);
    return timestamps.length ? Math.max(...timestamps) : null;
  }, [tab, senateRaces, houseRaces, governors, cbcMembers, redistrictingStates]);
  const mapFreshness = useMemo(() => buildElectionMapFreshnessPresentation(mapRecordUpdatedAt, electionFreshness), [mapRecordUpdatedAt, electionFreshness]);

  // Get data for a specific state based on active tab (for popup)
  const popupData = useMemo(() => {
    if (!popupState) return [];
    if (tab === "house") return (houseRaces as any[]).filter(r => r.stateCode === popupState);
    if (tab === "senate") return (senateRaces as any[]).filter(r => r.stateCode === popupState);
    if (tab === "governors") return (governors as any[]).filter(r => r.stateCode === popupState);
    if (tab === "cbc") {
      const members = (cbcMembers as any[]).filter(m => m.stateCode === popupState).map(m => ({ ...m, popupType: "member" }));
      const elections = (blackRepresentationElections as any[]).filter(r => r.stateCode === popupState).map(r => ({ ...r, popupType: "election" }));
      return [...members, ...elections];
    }
    if (tab === "redistricting") return (redistrictingStates as any[]).filter(s => s.stateCode === popupState);
    return [];
  }, [tab, houseRaces, senateRaces, governors, cbcMembers, blackRepresentationElections, redistrictingStates, popupState]);

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
    { id: "cbc", label: "Black Reps", icon: Star },
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
          <ResultsTicker senateRaces={senateRaces as any[]} houseRaces={houseRaces as any[]} />
        </div>

        {/* Tabs + Filters (moved under ticker) */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="flex gap-0.5 bg-muted/50 backdrop-blur rounded-lg p-0.5 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => selectTab(t.id)}
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

        {/* Interactive U.S. map remains a desktop website experience. */}
        <div className="glass-card mb-6 hidden rounded-xl p-4 lg:block">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div><h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Interactive Election Map</h2><p className={`mt-0.5 text-[11px] font-semibold ${mapFreshness.status === "warning" ? "text-amber-700 dark:text-amber-300" : mapFreshness.status === "live" ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>{mapFreshness.primary}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{mapFreshness.detail}</p></div>
            {selectedState && (
              <button onClick={() => setSelectedState(null)} className="text-xs text-primary hover:underline">
                Clear filter ({selectedState})
              </button>
            )}
          </div>
          <div>
            <USMapFull
              raceData={mapData}
              onStateClick={handleStateClick}
              selectedState={selectedState}
              showLegend={false}
            />
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 justify-center">
            {(tab === "cbc" ? ["Black Political Representation presence"] : ["Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"]).map(r => (
              <div key={r} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tab === "cbc" ? "var(--color-representation)" : getRatingColor(r) }} />
                <span className="text-xs text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="mb-6 rounded-xl border border-primary/25 bg-primary/[0.045] p-4 lg:hidden">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Desktop Website Feature</p>
          <h2 className="mt-1 text-base font-bold text-foreground">Interactive U.S. map</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">The state-by-state map is reserved for larger desktop screens. Race filters, live results, and the full list below remain available here without a map that is difficult to use on a phone.</p>
        </section>

        {/* Scoreboard */}
        <TabScoreboard tab={tab} senateRaces={senateRaces as any[]} houseRaces={houseRaces as any[]} governors={governors as any[]} cbcMembers={cbcMembers as any[]} blackRepresentationElections={blackRepresentationElections as any[]} redistrictingStates={redistrictingStates as any[]} />

        {/* Race list */}
        {tab === "senate" && <RaceGrid races={filteredSenate} chamber="senate" />}
        {tab === "house" && <RaceGrid races={filteredHouse} chamber="house" />}
        {tab === "governors" && <GovernorGrid races={filteredGovs} />}
        {tab === "cbc" && <CbcGrid members={filteredCbc} allMembers={cbcMembers as any[]} elections={(blackRepresentationElections as any[]).filter((r: any) => (!selectedState || r.stateCode === selectedState) && (!searchQuery || `${r.state} ${r.district} ${r.winnerName} ${r.runnerUpName}`.toLowerCase().includes(searchQuery.toLowerCase())))} allElections={blackRepresentationElections as any[]} selectedState={selectedState} onSelectState={setSelectedState} />}
        {tab === "redistricting" && <RedistrictingGrid states={filteredRedistricting} />}

        {/* State popup dialog showing tab-specific data */}
        <Dialog open={statePopupOpen} onOpenChange={setStatePopupOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{popupState ? Object.entries(STATE_NAME_TO_CODE).find(([,v]) => v === popupState)?.[0] || popupState : ""} — {tab === "senate" ? "Senate Race" : tab === "governors" ? "Governor Race" : tab === "house" ? "House Races" : tab === "cbc" ? "Black Representation" : "Redistricting"}</DialogTitle>
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
                    {tab === "cbc" && item.popupType === "member" && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{item.member}</span>
                          <span className="text-xs text-muted-foreground">{item.district}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${item.status === "advanced_to_general" ? "bg-green-500/20 text-green-400" : item.status === "in_runoff" || item.status === "too_close_to_call" ? "bg-amber-500/20 text-amber-400" : item.status === "retiring" ? "bg-yellow-500/20 text-yellow-400" : item.status === "lost_primary" ? "bg-red-500/20 text-red-400" : "bg-gray-500/20 text-gray-400"}`}>
                            {formatBlackRepStatus(item.status)}
                          </span>
                          {item.primaryResult && <span className="text-muted-foreground">{item.primaryResult}</span>}
                        </div>
                      </>
                    )}
                    {tab === "cbc" && item.popupType === "election" && (
                      <>
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-bold text-sm">{item.district} · {item.electionType}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.resultStatus === "called" || item.resultStatus === "uncontested" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                            {item.resultStatus?.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.winnerName ?? "Result pending"}{item.winnerParty ? ` (${item.winnerParty})` : ""}
                          {item.winnerVotePct != null ? ` · ${Number(item.winnerVotePct).toFixed(1)}%` : ""}
                          {item.winnerVotes ? ` · ${Number(item.winnerVotes).toLocaleString()} votes` : ""}
                        </p>
                        {item.generalOpponent && <p className="text-xs text-muted-foreground mt-1">General election: {item.generalOpponent}</p>}
                        {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">View source <ExternalLink size={11} /></a>}
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
              <p className="text-muted-foreground text-sm">No {tab === "senate" ? "Senate race" : tab === "governors" ? "Governor race" : tab === "house" ? "House races" : tab === "cbc" ? "Black representatives" : "redistricting data"} found for this state.</p>
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

function TabScoreboard({ tab, senateRaces, houseRaces, governors, cbcMembers, blackRepresentationElections, redistrictingStates }: { tab: ViewTab; senateRaces: any[]; houseRaces: any[]; governors: any[]; cbcMembers: any[]; blackRepresentationElections: any[]; redistrictingStates: any[] }) {
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
    return (
      <div className="grid grid-cols-2 gap-2 mb-6">
        <ScoreCard label="Tracked People" value={cbcMembers.length} color="#a855f7" />
        <ScoreCard label="Article-Backed Races" value={blackRepresentationElections.length} color="#38bdf8" />
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
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-primary">Winner: {race.calledWinner} ({race.calledParty}){race.calledSourceUrl && <a href={race.calledSourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Evidence source ↗</a>}</p>
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
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-primary">Winner: {race.calledWinner}{race.calledSourceUrl && <a href={race.calledSourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Evidence source ↗</a>}</p>
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

function CbcGrid({ members, allMembers, elections, allElections, selectedState, onSelectState }: { members: any[]; allMembers: any[]; elections: any[]; allElections: any[]; selectedState: string | null; onSelectState: (stateCode: string | null) => void }) {
  if (members.length === 0) return <p className="text-center text-muted-foreground py-8">No members match your search.</p>;
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

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
    advanced_to_general: "bg-green-500/20 text-green-400",
    elected: "bg-emerald-500/20 text-emerald-300",
    won_general: "bg-emerald-500/20 text-emerald-300",
    lost_general: "bg-rose-500/20 text-rose-300",
    in_runoff: "bg-purple-500/20 text-purple-400",
    too_close_to_call: "bg-amber-500/20 text-amber-400",
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
    advanced_to_general: "Advanced to General",
    elected: "Elected",
    won_general: "Won General Election",
    lost_general: "Lost General Election",
    in_runoff: "In Runoff",
    too_close_to_call: "Too Close to Call",
  };

  return (
    <div>
      <StateComparisonDashboard members={allMembers} elections={allElections} selectedState={selectedState} onSelectState={onSelectState} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {members.map((m) => (
          <button
            type="button"
            key={m.id}
            className="glass-card rounded-lg p-4 text-left hover:border-primary/30 transition-colors"
            onClick={() => setSelectedMember(m)}
          >
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="flex items-center gap-2">
                {m.photo && <img src={m.photo} alt="" className="w-8 h-8 rounded-full object-cover border border-border/50" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <h3 className="text-sm font-bold">{m.member}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status] ?? "bg-muted text-muted-foreground"}`}>
                  {statusLabels[m.status] ?? formatBlackRepStatus(m.status)}
                </span>
                <SourceReviewBadge badge={getSourceReviewBadge(m)} />
                <span className="text-xs font-semibold text-primary">Details</span>
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
          </button>
        ))}
      </div>
      <Sheet open={Boolean(selectedMember)} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {selectedMember && <CbcProfileDrawer member={selectedMember} statusLabel={statusLabels[selectedMember.status] ?? formatBlackRepStatus(selectedMember.status)} />}
        </SheetContent>
      </Sheet>
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Article-Backed Election Results</h2>
          <span className="text-xs text-muted-foreground">{elections.length} tracked contests</span>
        </div>
        {elections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No article-backed contests match the current filter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {elections.map((race: any) => (
              <article key={race.id} className="glass-card rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{race.district}</p>
                    <p className="text-xs text-muted-foreground">{race.state} · {race.electionType} {race.partyContest ? `· ${race.partyContest}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-1.5"><span className={`shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${race.resultStatus === "called" || race.resultStatus === "uncontested" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>{race.resultStatus?.replaceAll("_", " ")}</span><SourceReviewBadge badge={getSourceReviewBadge(race)} /></div>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <p className="font-semibold text-foreground">{race.winnerName ?? "Result pending"}{race.winnerParty ? ` (${race.winnerParty})` : ""}</p>
                  {(race.winnerVotes || race.winnerVotePct != null) && <p className="text-muted-foreground">{race.winnerVotes ? `${Number(race.winnerVotes).toLocaleString()} votes` : ""}{race.winnerVotes && race.winnerVotePct != null ? " · " : ""}{race.winnerVotePct != null ? `${Number(race.winnerVotePct).toFixed(1)}%` : ""}</p>}
                  {race.runnerUpName && <p className="text-muted-foreground">vs. {race.runnerUpName}{race.runnerUpParty ? ` (${race.runnerUpParty})` : ""}{race.runnerUpVotes ? ` · ${Number(race.runnerUpVotes).toLocaleString()} votes` : ""}{race.runnerUpVotePct != null ? `${race.runnerUpVotes ? " · " : " · "}${Number(race.runnerUpVotePct).toFixed(1)}%` : ""}</p>}
                  {race.generalOpponent && <p className="text-muted-foreground">General: {race.generalOpponent}</p>}
                </div>
                {race.redistrictingContext && <p className="mt-3 text-xs p-2 bg-purple-500/10 border border-purple-500/20 rounded text-foreground/90">{race.redistrictingContext}</p>}
                {race.notes && <p className="mt-3 text-xs p-2 bg-muted/50 rounded text-foreground/90">{race.notes}</p>}
                {race.sourceUrl && <a href={race.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3">View {race.sourceLabel ?? "source"} <ExternalLink size={11} /></a>}
              </article>
            ))}
          </div>
        )}
      </div>
      <PrimaryGeneralTimeline members={allMembers} elections={allElections} selectedState={selectedState} />
    </div>
  );
}

function CbcProfileDrawer({ member, statusLabel }: { member: any; statusLabel: string }) {
  const primaryTotal = member.primaryVotes || member.primaryVotePct != null
    ? `${member.primaryVotes ? `${Number(member.primaryVotes).toLocaleString()} votes` : ""}${member.primaryVotes && member.primaryVotePct != null ? " · " : ""}${member.primaryVotePct != null ? `${Number(member.primaryVotePct).toFixed(1)}%` : ""}`
    : null;
  return <>
    <SheetHeader className="border-b border-border pr-10"><div className="flex items-center gap-3">{member.photo && <img src={member.photo} alt="" className="h-12 w-12 rounded-full object-cover border border-border" />}<div><SheetTitle>{member.member}</SheetTitle><SheetDescription>{member.district} · {member.state} · {member.party}</SheetDescription></div></div></SheetHeader>
    <div className="space-y-4 p-4 text-sm">
      <div className="rounded-lg border border-primary/25 bg-primary/5 p-3"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-primary">2026 status</p><SourceReviewBadge badge={getSourceReviewBadge(member)} /></div><p className="mt-1 font-semibold text-foreground">{statusLabel}</p></div>
      <DrawerField label="Chamber" value={member.chamber ? `${member.chamber.charAt(0).toUpperCase()}${member.chamber.slice(1)}` : null} />
      <DrawerField label="Up in 2026" value={member.upIn2026 ? "Yes" : "No"} />
      <DrawerField label="Primary result" value={member.primaryResult} accent />
      <DrawerField label="Primary total" value={primaryTotal} />
      <DrawerField label="Primary opponent" value={member.primaryOpponent} />
      <DrawerField label="General-election opponent" value={member.generalOpponent} />
      {member.redistrictingContext && <DrawerContext label="Redistricting context" value={member.redistrictingContext} tone="purple" />}
      {member.aipacFunding && <DrawerContext label="Funding context" value={member.aipacFunding} tone="amber" />}
      {member.notes && <DrawerContext label="Platform notes" value={member.notes} tone="neutral" />}
      {member.sourceUrl && <a href={member.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">View source reporting <ExternalLink size={13} /></a>}
    </div>
  </>;
}

function SourceReviewBadge({ badge }: { badge: SourceReviewBadge }) {
  const styles = badge.tone === "verified"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : badge.tone === "article"
      ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  const Icon = badge.tone === "verified" ? BadgeCheck : badge.tone === "article" ? FileSearch : Clock3;
  return <span title={badge.detail} className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${styles}`}><Icon size={11} />{badge.label}</span>;
}

function StateComparisonDashboard({ members, elections, selectedState, onSelectState }: { members: any[]; elections: any[]; selectedState: string | null; onSelectState: (stateCode: string | null) => void }) {
  const comparisons = useMemo(() => buildStateComparisons(members, elections), [members, elections]);
  const visible = comparisons.slice(0, 12);
  const formatDate = (value: number | null) => value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No timestamp";
  return <section className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.035] p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><div className="flex items-center gap-2"><GitCompareArrows size={16} className="text-primary" /><h2 className="text-sm font-bold uppercase tracking-wider">State comparison</h2></div><p className="mt-1 text-xs text-muted-foreground">Compare people, contest transitions, evidence coverage, and review needs. Select a state to focus the map, record cards, and timeline.</p></div>
      {selectedState && <button onClick={() => onSelectState(null)} className="text-xs font-semibold text-primary hover:underline">Clear state focus</button>}
    </div>
    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
      {visible.map((state) => <button type="button" key={state.stateCode} onClick={() => onSelectState(state.stateCode)} className={`rounded-lg border p-3 text-left transition-colors ${selectedState === state.stateCode ? "border-primary bg-primary/10" : "border-border bg-background/50 hover:border-primary/35"}`}>
        <div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold">{state.stateName}</p><p className="text-[11px] text-muted-foreground">{state.trackedPeople} people · {state.contests} contests</p></div><span className="text-xs font-bold text-primary">{state.stateCode}</span></div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px]"><span className="text-emerald-700 dark:text-emerald-300">{state.advanced} advanced</span><span className="text-amber-700 dark:text-amber-300">{state.transitions} transitions</span><span className="text-muted-foreground">{state.sourceReviewed} sourced</span>{state.needsReview > 0 && <span className="text-amber-700 dark:text-amber-300">{state.needsReview} review</span>}</div>
        <p className="mt-2 text-[10px] text-muted-foreground">Updated: {formatDate(state.latestAt)}</p>
      </button>)}
    </div>
  </section>;
}

function PrimaryGeneralTimeline({ members, elections, selectedState }: { members: any[]; elections: any[]; selectedState: string | null }) {
  const items = useMemo(() => buildRepresentationTimeline(members, elections, selectedState).slice(0, 16), [members, elections, selectedState]);
  const stageStyles: Record<string, string> = { primary: "bg-teal-500/15 text-teal-700 dark:text-teal-300", runoff: "bg-purple-500/15 text-purple-700 dark:text-purple-300", general: "bg-primary/15 text-primary", certified: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", review: "bg-amber-500/15 text-amber-700 dark:text-amber-300" };
  const title = selectedState ? `${selectedState} primary-to-general timeline` : "Primary-to-general timeline";
  return <section className="mt-8 rounded-xl border border-border bg-card/70 p-4">
    <div className="flex items-center gap-2"><Clock3 size={16} className="text-primary" /><div><h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2><p className="mt-1 text-xs text-muted-foreground">A record-stage trail. A primary nomination is never presented as a general-election call or certified result.</p></div></div>
    {items.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No timeline entries match the current state focus.</p> : <ol className="mt-4 space-y-3 border-l border-primary/25 pl-4">{items.map((item) => <li key={item.id} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" /><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${stageStyles[item.stage]}`}>{item.stage}</span><span className="text-xs text-muted-foreground">{item.date ? new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date pending"}</span><SourceReviewBadge badge={item.sourceBadge} /></div><p className="mt-1 text-sm font-semibold">{item.district} · {item.headline}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Open source <ExternalLink size={11} /></a>}</li>)}</ol>}
  </section>;
}

function DrawerField({ label, value, accent = false }: { label: string; value: string | null | undefined; accent?: boolean }) {
  if (!value) return null;
  return <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className={`mt-1 ${accent ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>{value}</p></div>;
}

function DrawerContext({ label, value, tone }: { label: string; value: string; tone: "purple" | "amber" | "neutral" }) {
  const classes = tone === "purple" ? "border-purple-500/25 bg-purple-500/10" : tone === "amber" ? "border-amber-500/25 bg-amber-500/10" : "border-border bg-muted/50";
  return <div className={`rounded-lg border p-3 ${classes}`}><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-sm leading-relaxed text-foreground">{value}</p></div>;
}

function formatBlackRepStatus(status?: string | null) {
  if (!status) return "Tracking";
  return status.replaceAll("_", " ").replace(/\b\w/g, char => char.toUpperCase());
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

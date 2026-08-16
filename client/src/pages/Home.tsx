import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play, Maximize2, Download, Info, X, Globe2, Landmark, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { USMapFull } from "@/components/USMapFull";
import { ResultsTicker } from "@/components/ResultsTicker";
import HomepageExample from "@/pages/HomepageExample";
import { rankedWorldSignals, worldSignalLabel } from "@/lib/worldElectionDisplay";
import { homepageContentQueryOptions, homepageElectionQueryOptions } from "@/lib/homepageRefresh";
import { resolveFullEpisodeVoiceUrl } from "@/lib/fullEpisodeVoice";
import { getDailyBriefSegmentRole } from "@/lib/dailyBriefStructure";

type MapView = "house" | "senate" | "governor" | "blackrep";

export default function Home() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const updateLayout = () => setIsDesktop(desktopQuery.matches);
    updateLayout();
    desktopQuery.addEventListener("change", updateLayout);
    return () => desktopQuery.removeEventListener("change", updateLayout);
  }, []);

  return isDesktop ? <HomepageExample mode="home" /> : <MobileHome />;
}

function MobileHome({ showDiscoveryRail = false, previewMode = false }: { showDiscoveryRail?: boolean; previewMode?: boolean }) {
  const { data: newsData, isLoading: newsLoading } = trpc.news.list.useQuery({ page: 1, perPage: 6 }, homepageContentQueryOptions);
  const { data: episodes, isLoading: podLoading } = trpc.podcast.getEpisodes.useQuery(undefined, homepageContentQueryOptions);
  const { data: scoreboard } = trpc.election.scoreboard.useQuery(undefined, homepageElectionQueryOptions);
  const { data: senateRaces } = trpc.election.senate.useQuery(undefined, homepageElectionQueryOptions);
  const { data: houseRaces } = trpc.election.house.useQuery(undefined, homepageElectionQueryOptions);
  const { data: governors } = trpc.election.governors.useQuery(undefined, homepageElectionQueryOptions);
  const { data: cbcMembers } = trpc.election.cbc.useQuery(undefined, homepageElectionQueryOptions);
  const { data: blackRepresentationElections } = trpc.election.blackRepresentationElections.useQuery(undefined, homepageElectionQueryOptions);
  const { play, voicePreference, setVoicePreference, currentTrack, progress, duration } = useAudio();
  const [mapView, setMapView] = useState<MapView>("house");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [statePopupOpen, setStatePopupOpen] = useState(false);

  // State name lookup
  const STATE_NAMES: Record<string, string> = { AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",DC:"District of Columbia" };

  // Build popup data based on current map view and selected state
  const popupData = useMemo(() => {
    if (!selectedState) return [];
    if (mapView === "house") return (houseRaces as any[] ?? []).filter(r => r.stateCode === selectedState);
    if (mapView === "senate") return (senateRaces as any[] ?? []).filter(r => r.stateCode === selectedState);
    if (mapView === "governor") return (governors as any[] ?? []).filter(r => r.stateCode === selectedState);
    if (mapView === "blackrep") {
      const members = (cbcMembers as any[] ?? []).filter(member => member.stateCode === selectedState).map(member => ({ ...member, popupType: "member" }));
      const elections = (blackRepresentationElections as any[] ?? []).filter(election => election.stateCode === selectedState).map(election => ({ ...election, popupType: "election" }));
      return [...members, ...elections];
    }
    return [];
  }, [mapView, houseRaces, senateRaces, governors, cbcMembers, blackRepresentationElections, selectedState]);

  const handleStateClick = (stateId: string) => {
    setSelectedState(prev => prev === stateId ? null : stateId);
    setStatePopupOpen(true);
  };

  const latestEpisode = episodes?.[0];
  const selectedFullEpisodeUrl = latestEpisode ? resolveFullEpisodeVoiceUrl(latestEpisode, voicePreference) : "";
  const latestEpisodeHasAudio = Boolean(selectedFullEpisodeUrl);
  const activeBriefTrack = currentTrack?.episodeDate === latestEpisode?.date ? currentTrack : null;
  const activeBriefProgress = activeBriefTrack && duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;
  // Build map data from senate races (for senate view) or house (aggregate by state)
  const mapData = useMemo(() => {
    const data: Record<string, { rating: string | null; candidate1: string; candidate2: string; calledWinner?: string | null }> = {};
    if (mapView === "senate") {
      (senateRaces as any[] ?? []).forEach((r: any) => {
        if (r.stateCode) {
          data[r.stateCode] = {
            rating: r.rating,
            candidate1: r.candidate1Name ? `${r.candidate1Name} (${r.candidate1Party ?? "?"})` : "Pending",
            candidate2: r.candidate2Name ? `${r.candidate2Name} (${r.candidate2Party ?? "?"})` : "Pending",
            calledWinner: r.calledWinner,
          };
        }
      });
    } else if (mapView === "governor") {
      (governors as any[] ?? []).forEach((r: any) => {
        if (r.stateCode) {
          data[r.stateCode] = {
            rating: r.rating,
            candidate1: r.demCandidate ? `${r.demCandidate} (D)` : "Dem: Pending",
            candidate2: r.repCandidate ? `${r.repCandidate} (R)` : "Rep: Pending",
            calledWinner: r.calledWinner,
          };
        }
      });
    } else if (mapView === "house") {
      // For house view, aggregate by state - show the most competitive rating
      const stateRatings: Record<string, string[]> = {};
      (houseRaces as any[] ?? []).forEach((r: any) => {
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
    } else {
      const memberCountByState: Record<string, number> = {};
      (cbcMembers as any[] ?? []).forEach((member: any) => {
        if (member.stateCode) memberCountByState[member.stateCode] = (memberCountByState[member.stateCode] ?? 0) + 1;
      });
      Object.entries(memberCountByState).forEach(([code, count]) => {
        data[code] = {
          rating: "Toss-up",
          candidate1: `${count} Black member${count === 1 ? "" : "s"}`,
          candidate2: "Black Representation",
          calledWinner: null,
        };
      });
    }
    return data;
  }, [senateRaces, houseRaces, governors, cbcMembers, mapView]);

  const blackRepresentationSummary = useMemo(() => {
    const members = cbcMembers as any[] ?? [];
    const electionRecords = blackRepresentationElections as any[] ?? [];
    return { members: members.length, states: new Set(members.map(member => member.stateCode).filter(Boolean)).size, records: electionRecords.length };
  }, [cbcMembers, blackRepresentationElections]);

  // Calculate rating counts for the scoreboard
  const ratingCounts = useMemo(() => {
    const counts = { solidD: 0, likelyD: 0, leanD: 0, tossup: 0, leanR: 0, likelyR: 0, solidR: 0, noData: 0 };
    const races = mapView === "senate" ? (senateRaces as any[] ?? []) : mapView === "governor" ? (governors as any[] ?? []) : mapView === "house" ? (houseRaces as any[] ?? []) : [];
    races.forEach((r: any) => {
      switch (r.rating) {
        case "Solid D": counts.solidD++; break;
        case "Likely D": counts.likelyD++; break;
        case "Lean D": counts.leanD++; break;
        case "Toss-up": counts.tossup++; break;
        case "Lean R": counts.leanR++; break;
        case "Likely R": counts.likelyR++; break;
        case "Solid R": counts.solidR++; break;
        default: counts.noData++;
      }
    });
    return counts;
  }, [senateRaces, houseRaces, governors, mapView]);

  return (
    <div className="homepage-atlas-shell min-h-screen">
      {previewMode && (
        <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          Homepage enhancement example · current dashboard retained above
        </div>
      )}
      <div className="border-b border-border/30 px-3 py-2"><ResultsTicker senateRaces={senateRaces as any[] ?? []} houseRaces={houseRaces as any[] ?? []} /></div>

      {/* Three-column dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_300px] lg:grid-cols-[320px_1fr_340px] gap-0 min-h-[calc(100vh-120px)]">

        {/* Column 1: Latest News */}
        <section className="homepage-atlas-panel border-r border-border/30 p-5 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider">Latest News</h2>
            <a href="https://blkpoliticsnow.com" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></a>
          </div>
          {newsLoading ? (
            <div className="space-y-3">{[...Array(7)].map((_, i) => <div key={i} className="h-14 bg-muted rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {newsData?.posts?.slice(0, 8).map((post: any) => {
                const thumbnail = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url
                  || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name;
                return (
                  <a
                    key={post.id}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-colors no-underline group"
                  >
                    {thumbnail && (
                      <img src={thumbnail} alt="" className="w-14 h-11 object-cover rounded flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {category && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary">{category}</span>
                      )}
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight"
                        dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }}
                      />
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* Column 2: Interactive Election Map */}
        <section className="homepage-atlas-panel p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider">Interactive Election Map</h2>
            <Link href="/elections" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Maximize2 size={14} /> Full Screen
            </Link>
          </div>

          {/* Map view tabs */}
          <div className="flex justify-center gap-2 mb-4">
            {(["blackrep", "governor", "house", "senate"] as const).map(v => (
              <button
                key={v}
                onClick={() => setMapView(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                  mapView === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "blackrep" ? "Black Rep" : v}
              </button>
            ))}
          </div>

          {/* The Map */}
          <div className="flex-1 flex items-center justify-center">
            <USMapFull
              raceData={mapData}
              onStateClick={handleStateClick}
              selectedState={selectedState}
            />
          </div>

          {/* Rating Scoreboard */}
          {mapView === "blackrep" ? <div className="grid grid-cols-3 gap-1 mt-4"><ScoreBox label="PROFILES" count={blackRepresentationSummary.members} color="var(--color-tossup)" /><ScoreBox label="STATES" count={blackRepresentationSummary.states} color="var(--color-tossup)" /><ScoreBox label="RECORDS" count={blackRepresentationSummary.records} color="var(--color-tossup)" /></div> : <div className="grid grid-cols-7 gap-1 mt-4">
            <ScoreBox label="SOLID D" count={ratingCounts.solidD} color="var(--color-solid-d)" />
            <ScoreBox label="LIKELY D" count={ratingCounts.likelyD} color="var(--color-likely-d)" />
            <ScoreBox label="LEAN D" count={ratingCounts.leanD} color="var(--color-lean-d)" />
            <ScoreBox label="TOSS UP" count={ratingCounts.tossup} color="var(--color-tossup)" />
            <ScoreBox label="LEAN R" count={ratingCounts.leanR} color="var(--color-lean-r)" />
            <ScoreBox label="LIKELY R" count={ratingCounts.likelyR} color="var(--color-likely-r)" />
            <ScoreBox label="SOLID R" count={ratingCounts.solidR} color="var(--color-solid-r)" />
          </div>}

          {/* Bottom actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <button
              onClick={() => alert("This interactive map shows 2026 U.S. election race ratings from Cook Political Report and Sabato's Crystal Ball. Colors indicate competitiveness: Solid (safe seat), Likely (strong lean), Lean (slight advantage), and Toss-up (either party could win). The Black Representation view uses purple only as a neutral presence indicator, not a party rating, and combines profile records with article-backed election records. Data updates in real-time on election night via DDHQ.")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info size={14} /> About the Map
            </button>
            <Link href="/elections" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              View State Breakdown <ArrowRight size={14} />
            </Link>
          </div>

          {/* State Popup Dialog */}
          <Dialog open={statePopupOpen} onOpenChange={setStatePopupOpen}>
            <DialogContent className="max-h-[80dvh] w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200 sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedState ? `${STATE_NAMES[selectedState] || selectedState} — ${mapView === "senate" ? "Senate Race" : mapView === "governor" ? "Governor Race" : mapView === "house" ? "House Races" : "Black Representation"}` : ""}</DialogTitle>
              </DialogHeader>
              {popupData.length > 0 ? (
                <div className="space-y-3">
                  {popupData.map((item: any, idx: number) => (
                    <div key={item.id || idx} className="border border-border rounded-lg p-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                      {mapView === "house" && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">District {item.district}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.rating === "Toss-up" ? "bg-purple-500/20 text-purple-400" : item.rating?.includes("D") ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-2">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${item.candidate1Party === "D" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : item.candidate1Party === "R" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-gray-500/15 text-gray-400 border border-gray-500/30"}`}>
                              {item.candidate1Photo && <img src={item.candidate1Photo} alt="" className="w-5 h-5 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span>{item.candidate1Name} ({item.candidate1Party})</span>
                            </div>
                            <span className="text-muted-foreground self-center text-[10px]">vs</span>
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${item.candidate2Party === "D" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : item.candidate2Party === "R" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-gray-500/15 text-gray-400 border border-gray-500/30"}`}>
                              {item.candidate2Photo && <img src={item.candidate2Photo} alt="" className="w-5 h-5 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span>{item.candidate2Name} ({item.candidate2Party})</span>
                            </div>
                          </div>
                          {item.pctReporting > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${item.pctReporting}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">{item.pctReporting}%</span>
                              </div>
                            </div>
                          )}
                          {item.calledWinner && (
                            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs text-green-400 font-medium">Winner: {item.calledWinner} ({item.calledParty})</span>
                            </div>
                          )}
                        </>
                      )}
                      {mapView === "senate" && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">{item.stateName} Senate</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.rating === "Toss-up" ? "bg-purple-500/20 text-purple-400" : item.rating?.includes("D") ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-2">
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${item.candidate1Party === "D" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : item.candidate1Party === "R" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-gray-500/15 text-gray-400 border border-gray-500/30"}`}>
                              {item.candidate1Photo && <img src={item.candidate1Photo} alt="" className="w-6 h-6 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span>{item.candidate1Name} ({item.candidate1Party})</span>
                            </div>
                            <span className="text-muted-foreground self-center text-[10px]">vs</span>
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${item.candidate2Party === "D" ? "bg-blue-500/15 text-blue-400 border border-blue-500/30" : item.candidate2Party === "R" ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-gray-500/15 text-gray-400 border border-gray-500/30"}`}>
                              {item.candidate2Photo && <img src={item.candidate2Photo} alt="" className="w-6 h-6 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span>{item.candidate2Name} ({item.candidate2Party})</span>
                            </div>
                          </div>
                          {item.pctReporting > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary/60 rounded-full transition-all duration-500" style={{ width: `${item.pctReporting}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">{item.pctReporting}%</span>
                              </div>
                            </div>
                          )}
                          {item.incumbent && <p className="text-xs text-muted-foreground mt-1">Incumbent: {item.incumbent} ({item.incumbentParty})</p>}
                          {item.calledWinner && (
                            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs text-green-400 font-medium">Winner: {item.calledWinner} ({item.calledParty})</span>
                            </div>
                          )}
                        </>
                      )}
                      {mapView === "governor" && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">{item.stateName} Governor</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.rating === "Toss-up" ? "bg-purple-500/20 text-purple-400" : item.rating?.includes("D") ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"}`}>
                              {item.rating}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {item.demPhoto && <img src={item.demPhoto} alt="" className="w-6 h-6 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span>{item.demCandidate || "TBD"} (D)</span>
                            </div>
                            <span className="text-muted-foreground self-center text-[10px]">vs</span>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                              {item.repPhoto && <img src={item.repPhoto} alt="" className="w-6 h-6 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                              <span>{item.repCandidate || "TBD"} (R)</span>
                            </div>
                          </div>
                          {item.incumbentName && <p className="text-xs text-muted-foreground mt-1">Incumbent: {item.incumbentName} ({item.incumbentParty})</p>}
                          {item.calledWinner && (
                            <div className="mt-2 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs text-green-400 font-medium">Winner: {item.calledWinner} ({item.calledParty})</span>
                            </div>
                          )}
                        </>
                      )}
                      {mapView === "blackrep" && item.popupType === "member" && (
                        <>
                          <div className="flex items-start gap-3"><>{item.photo ? <img src={item.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-primary/30" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /> : <div className="grid w-10 h-10 place-items-center rounded-full border border-primary/30 bg-primary/10 text-[9px] font-bold text-primary">BR</div>}</><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><span className="font-bold text-sm block">{item.member}</span><span className="text-xs text-muted-foreground">District {item.district} · {item.party}</span></div><span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 uppercase">{String(item.status ?? "tracked").replaceAll("_", " ")}</span></div><p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.raceSummary || item.notes || "Representation profile tracked by Black Politics Now."}</p>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-xs font-medium text-primary hover:underline">{item.sourceLabel || "Source"} ↗</a>}</div></div>
                        </>
                      )}
                      {mapView === "blackrep" && item.popupType === "election" && (
                        <>
                          <div className="flex items-center justify-between gap-2"><div><span className="font-bold text-sm block">District {item.district}</span><span className="text-xs text-muted-foreground">{item.chamber} {item.electionType}{item.partyContest ? ` · ${item.partyContest}` : ""}</span></div><span className="text-[9px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/30 uppercase">{String(item.resultStatus ?? "tracked").replaceAll("_", " ")}</span></div>
                          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs mt-2"><div className="rounded border border-purple-500/30 bg-purple-500/10 px-2 py-1.5 text-purple-800 dark:text-purple-200"><span className="font-semibold block truncate">{item.winnerName || "Result pending"}</span><span className="text-[10px] opacity-75">{item.winnerParty || "—"}{item.winnerVotePct != null ? ` · ${item.winnerVotePct}%` : ""}</span></div><span className="text-muted-foreground text-[10px]">vs</span><div className="rounded border border-border bg-muted/30 px-2 py-1.5 text-right"><span className="font-semibold block truncate">{item.runnerUpName || item.generalOpponent || "Opponent pending"}</span><span className="text-[10px] text-muted-foreground">{item.runnerUpParty || "—"}{item.runnerUpVotePct != null ? ` · ${item.runnerUpVotePct}%` : ""}</span></div></div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.notes || item.redistrictingContext || "Article-backed election record tracked by Black Politics Now."}</p><div className="mt-2 flex flex-wrap gap-2 text-xs">{item.electionDate && <span className="text-muted-foreground">Election: {item.electionDate}</span>}{item.articleUrl && <a href={item.articleUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Article ↗</a>}{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">{item.sourceLabel || "Source"} ↗</a>}</div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No {mapView === "senate" ? "Senate race" : mapView === "governor" ? "Governor race" : mapView === "house" ? "House races" : "Black Representation profiles or article-backed election records"} found for this state.</p>
              )}
            </DialogContent>
          </Dialog>
        </section>

        {/* Column 3: Daily Intelligence Brief */}
        <section className="border-l border-border/30 p-5 overflow-y-auto">
          <h2 className="text-sm font-bold uppercase tracking-wider mb-1">Daily Intelligence Brief</h2>
          <p className="text-xs text-muted-foreground mb-4">A Daily Podcast with <span className="text-primary font-bold">ANDREW</span> & <span className="text-primary font-bold">JENNY</span></p>

          {podLoading ? (
            <div className="h-40 bg-muted rounded animate-pulse" />
          ) : latestEpisode ? (
            <div>
              {/* Play button + episode info */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => latestEpisodeHasAudio && play({
                    url: selectedFullEpisodeUrl,
                    alternateUrl: voicePreference === "andrew" ? latestEpisode.jennyFullEpisodeCdnUrl : latestEpisode.fullEpisodeCdnUrl,
                    voice: voicePreference,
                    title: `Daily Brief - ${latestEpisode.date} · ${voicePreference === "andrew" ? "Andrew" : "Jenny"}`,
                    episodeDate: latestEpisode.date,
                  })}
                  disabled={!latestEpisodeHasAudio}
                  title={latestEpisodeHasAudio ? `Play full Daily Intelligence Brief · ${voicePreference === "andrew" ? "Andrew" : "Jenny"}` : `${voicePreference === "jenny" ? "Jenny’s" : "The"} full episode mix is being prepared`}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 flex-shrink-0 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Play size={20} fill="currentColor" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{latestEpisode.date}</p>
                  <p className="text-sm font-medium truncate">{latestEpisode.day}'s Brief</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {latestEpisode.fullEpisodeCdnUrl && <a href={latestEpisode.fullEpisodeCdnUrl} download={`daily-intelligence-brief-${latestEpisode.date}-andrew.mp3`} title="Download Andrew full episode" className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10"><Download size={13} /> Andrew</a>}
                  {latestEpisode.jennyFullEpisodeCdnUrl && <a href={latestEpisode.jennyFullEpisodeCdnUrl} download={`daily-intelligence-brief-${latestEpisode.date}-jenny.mp3`} title="Download Jenny full episode" className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10"><Download size={13} /> Jenny</a>}
                </div>
              </div>

              <div className="mb-3 rounded-lg border border-primary/25 bg-primary/[0.045] px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-[10px]"><span className="font-bold text-primary">{activeBriefTrack?.segmentKey ? `Now playing · ${activeBriefTrack.segmentRole === "greeting" ? "Opening" : activeBriefTrack.segmentRole === "closing" ? "Closing" : "Editorial"}${activeBriefTrack.segmentOrdinal && activeBriefTrack.segmentTotal ? ` · ${activeBriefTrack.segmentOrdinal}/${activeBriefTrack.segmentTotal}` : ""}` : "Choose a segment to begin"}</span><span className="truncate text-muted-foreground">{activeBriefTrack?.title ?? "Greeting → analysis → closing"}</span></div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${activeBriefProgress}%` }} /></div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-muted-foreground">{activeBriefTrack ? `${Math.floor(progress / 60)}:${String(Math.floor(progress % 60)).padStart(2, "0")}` : "0:00"}</span>
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${activeBriefProgress}%` }} />
                </div>
                {!latestEpisodeHasAudio && <p className="text-[11px] text-muted-foreground mb-3">{voicePreference === "jenny" ? "Jenny’s full episode mix is being prepared. Individual Jenny segments remain available below." : "Full episode audio is being prepared. Scripts remain available below."}</p>}
                <span className="text-[10px] text-muted-foreground">{latestEpisode.totalDurationLabel}</span>
              </div>

              {/* Segment count tagline */}
              <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold text-primary uppercase tracking-wider">{latestEpisode.totalDurationLabel}. Everything You Need.</p><div className="inline-flex rounded-md border border-border bg-background p-0.5 text-[10px] font-semibold"><button onClick={() => setVoicePreference("andrew")} className={`rounded px-2 py-1 ${voicePreference === "andrew" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Andrew</button><button onClick={() => setVoicePreference("jenny")} className={`rounded px-2 py-1 ${voicePreference === "jenny" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Jenny</button></div></div>

              {/* Ordered segment list, including the opening and closing. */}
              <div className="space-y-0.5">
                {latestEpisode.segments.map((seg: any, i: number) => {
                  const segmentUrl = voicePreference === "andrew" ? seg.audioPath : seg.jennyAudioPath;
                  const segmentHasAudio = Boolean(segmentUrl);
                  const segmentRole = getDailyBriefSegmentRole(seg.key);
                  const isActiveSegment = activeBriefTrack?.segmentKey === seg.key;
                  return (
                  <button
                    key={seg.key}
                    onClick={() => segmentHasAudio && play({
                      url: segmentUrl,
                      alternateUrl: voicePreference === "andrew" ? seg.jennyAudioPath : seg.audioPath,
                      voice: voicePreference,
                      title: seg.label,
                      episodeDate: latestEpisode.date,
                      segmentKey: seg.key,
                      segmentOrdinal: i + 1,
                      segmentTotal: latestEpisode.segments.length,
                      segmentRole,
                    })}
                    disabled={!segmentHasAudio}
                    title={segmentHasAudio ? `Play ${seg.label}` : "Segment audio is being prepared"}
                    className={`w-full flex items-center gap-3 py-2 px-2 rounded-lg transition-colors text-left group disabled:cursor-not-allowed disabled:opacity-55 ${isActiveSegment ? "bg-primary/10 ring-1 ring-primary/35" : "hover:bg-muted/30"}`}
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                    <span className="flex-1 min-w-0"><span className="block text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">{seg.label}</span><span className="block text-[9px] uppercase tracking-[.11em] text-muted-foreground">{segmentRole === "greeting" ? "Opening greeting" : segmentRole === "closing" ? "Closing" : "Editorial segment"}</span></span>
                    <span className="text-[10px] text-muted-foreground">{seg.durationLabel}</span>
                    <Play size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No episodes available</p>
          )}
        </section>
      </div>
      {showDiscoveryRail && <HomepageDiscoveryRail />}
    </div>
  );
}

function HomepageDiscoveryRail() {
  const { data: worldElections = [] } = trpc.world.elections.useQuery();
  const mobileWorldBrief = useMemo(() => {
    const featured = rankedWorldSignals(worldElections as any[])[0];
    return featured ? { featured, label: worldSignalLabel(featured) } : null;
  }, [worldElections]);

  return (
    <section className="border-t border-border/50 bg-gradient-to-b from-background via-background to-muted/20 px-5 py-8 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-primary/30 pb-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">The Full Platform</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight">News, elections, history, and the daily record.</h2>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">Compact editorial windows keep the dashboard primary while making every part of Black Politics Now easy to discover.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href="https://blkpoliticsnow.com" target="_blank" rel="noopener noreferrer" className="group min-h-[245px] overflow-hidden rounded-lg border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">News / Article Page</p>
            <div className="mt-4 border-b border-border/50 pb-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">Voting Rights</p>
              <h3 className="mt-2 text-lg font-bold leading-tight">The stories that shape political power.</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Reporting, analysis, and context from Black Politics Now.</p>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-md border border-border/60 bg-muted/25 p-2.5">
              <div className="h-12 w-9 shrink-0 rounded-sm bg-[linear-gradient(135deg,#c7a25b_0%,#6e5529_42%,#111827_43%)]" />
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-primary">John Lewis Legacy</p>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">A continuing record of courage, representation, and the vote.</p>
              </div>
            </div>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Read the newsroom <ArrowUpRight size={13} /></span>
          </a>

          <Link href="/world" className="group relative min-h-[245px] overflow-hidden rounded-lg border border-border/60 bg-[#0c111c] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55">
            <div className="relative z-10 max-w-[62%]">
              <div className="mb-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.17em] text-primary">
                <Globe2 size={12} /> World Elections
              </div>
              <h3 className="text-lg font-bold leading-tight">Democracy, Black voices, and the wider world.</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Country briefings and election context from across the globe.</p>
              {mobileWorldBrief && <p className="mt-2 text-[10px] font-semibold text-primary">{mobileWorldBrief.label}: {mobileWorldBrief.featured.country}</p>}
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary">Explore the globe <ArrowUpRight size={13} /></span>
            </div>
            <div aria-hidden="true" className="absolute right-[-28px] top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-cyan-200/45 bg-[radial-gradient(circle_at_35%_30%,rgba(148,226,255,0.46),rgba(37,94,158,0.28)_36%,rgba(5,19,43,0.96)_69%)] shadow-[inset_-34px_-20px_55px_rgba(0,0,0,0.68),0_0_45px_rgba(63,166,255,0.18)] animate-[spin_36s_linear_infinite]">
              <div className="absolute inset-x-5 top-1/2 h-10 -translate-y-1/2 rounded-[50%] border-y border-cyan-100/40" />
              <div className="absolute inset-y-4 left-1/2 w-12 -translate-x-1/2 rounded-[50%] border-x border-cyan-100/40" />
              <div className="absolute inset-y-8 left-1/2 w-28 -translate-x-1/2 rounded-[50%] border-x border-cyan-100/20" />
              <div className="absolute left-12 top-16 h-10 w-16 rotate-[-20deg] rounded-[46%_54%_34%_66%] bg-cyan-100/25 blur-[1px]" />
              <div className="absolute bottom-16 right-12 h-14 w-9 rotate-[20deg] rounded-[60%_40%_55%_45%] bg-cyan-100/20 blur-[1px]" />
            </div>
          </Link>

          <Link href="/atlas" className="group relative min-h-[245px] overflow-hidden rounded-lg border border-border/60 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55">
            <img src="/manus-storage/selma-marchers-homepage_4dbcaa12.jpg" alt="Civil rights marchers crossing the Edmund Pettus Bridge in Selma" className="absolute inset-0 h-full w-full object-cover object-center opacity-80 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />
            <div className="relative z-10 flex h-full max-w-[80%] flex-col justify-between p-4">
              <div>
                <div className="mb-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.17em] text-primary"><Landmark size={12} /> Historical Atlas</div>
                <h3 className="text-lg font-bold leading-tight text-white">Selma: the history behind representation.</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/75">Places, maps, and political struggles that continue to shape the vote.</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Enter the Atlas <ArrowUpRight size={13} /></span>
            </div>
          </Link>

          <Link href="/podcast" className="group min-h-[245px] overflow-hidden rounded-lg border border-border/60 bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/55">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Podcast / Archive</p>
            <h3 className="mt-4 text-lg font-bold leading-tight">The Daily Intelligence Brief.</h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">A concise record of the developments readers need to carry forward.</p>
            <div aria-hidden="true" className="mt-6 flex h-11 items-center gap-1.5">
              {[18, 30, 42, 25, 48, 34, 20, 39, 50, 31, 44, 24].map((height, index) => <span key={index} className="w-1.5 rounded-full bg-primary/70" style={{ height }} />)}
            </div>
            <div className="mt-5 border-t border-border/50 pt-3">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Open the archive <ArrowUpRight size={13} /></span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ScoreBox({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center py-2 rounded-lg" style={{ borderTop: `3px solid ${color}` }}>
      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{label}</p>
      <p className="text-xl font-extrabold text-foreground">{count}</p>
    </div>
  );
}

import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { ArrowRight, Play, Maximize2, Download, RotateCcw, Info } from "lucide-react";
import { USMapFull } from "@/components/USMapFull";

type MapView = "house" | "senate" | "governor";

export default function Home() {
  const { data: newsData, isLoading: newsLoading } = trpc.news.list.useQuery({ page: 1, perPage: 6 });
  const { data: episodes, isLoading: podLoading } = trpc.podcast.getEpisodes.useQuery();
  const { data: scoreboard } = trpc.election.scoreboard.useQuery();
  const { data: senateRaces } = trpc.election.senate.useQuery();
  const { data: houseRaces } = trpc.election.house.useQuery();
  const { data: governors } = trpc.election.governors.useQuery();
  const { play, voicePreference } = useAudio();
  const [mapView, setMapView] = useState<MapView>("house");
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const latestEpisode = episodes?.[0];

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
    } else {
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
    }
    return data;
  }, [senateRaces, houseRaces, governors, mapView]);

  // Calculate rating counts for the scoreboard
  const ratingCounts = useMemo(() => {
    const counts = { solidD: 0, likelyD: 0, leanD: 0, tossup: 0, leanR: 0, likelyR: 0, solidR: 0, noData: 0 };
    const races = mapView === "senate" ? (senateRaces as any[] ?? []) : mapView === "governor" ? (governors as any[] ?? []) : (houseRaces as any[] ?? []);
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
    <div className="min-h-screen">
      {/* Tagline */}
      <div className="text-center py-4 border-b border-border/30">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-medium">
          Political Intelligence. Black Perspective. Every Day.
        </p>
      </div>

      {/* Three-column dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr_300px] lg:grid-cols-[320px_1fr_340px] gap-0 min-h-[calc(100vh-120px)]">

        {/* Column 1: Latest News */}
        <section className="border-r border-border/30 p-5 overflow-y-auto">
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
        <section className="p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider">Interactive Election Map</h2>
            <Link href="/elections" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Maximize2 size={14} /> Full Screen
            </Link>
          </div>

          {/* Map view tabs */}
          <div className="flex justify-center gap-2 mb-4">
            {(["governor", "house", "senate"] as const).map(v => (
              <button
                key={v}
                onClick={() => setMapView(v)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                  mapView === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* The Map */}
          <div className="flex-1 flex items-center justify-center">
            <USMapFull
              raceData={mapData}
              onStateClick={(id) => setSelectedState(prev => prev === id ? null : id)}
              selectedState={selectedState}
            />
          </div>

          {/* Rating Scoreboard */}
          <div className="grid grid-cols-7 gap-1 mt-4">
            <ScoreBox label="SOLID D" count={ratingCounts.solidD} color="var(--color-solid-d)" />
            <ScoreBox label="LIKELY D" count={ratingCounts.likelyD} color="var(--color-likely-d)" />
            <ScoreBox label="LEAN D" count={ratingCounts.leanD} color="var(--color-lean-d)" />
            <ScoreBox label="TOSS UP" count={ratingCounts.tossup} color="var(--color-tossup)" />
            <ScoreBox label="LEAN R" count={ratingCounts.leanR} color="var(--color-lean-r)" />
            <ScoreBox label="LIKELY R" count={ratingCounts.likelyR} color="var(--color-likely-r)" />
            <ScoreBox label="SOLID R" count={ratingCounts.solidR} color="var(--color-solid-r)" />
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
            <button
              onClick={() => alert("This interactive map shows 2026 U.S. election race ratings from Cook Political Report and Sabato's Crystal Ball. Colors indicate competitiveness: Solid (safe seat), Likely (strong lean), Lean (slight advantage), and Toss-up (either party could win). Data updates in real-time on election night via DDHQ. Switch between House, Senate, and Governor views using the tabs above.")}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info size={14} /> About the Map
            </button>
            <Link href="/elections" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              View State Breakdown <ArrowRight size={14} />
            </Link>
          </div>
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
                  onClick={() => play({
                    url: latestEpisode.fullEpisodeCdnUrl,
                    title: `Daily Brief - ${latestEpisode.date}`,
                    episodeDate: latestEpisode.date,
                  })}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-transform active:scale-95 flex-shrink-0"
                >
                  <Play size={20} fill="currentColor" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{latestEpisode.date}</p>
                  <p className="text-sm font-medium truncate">{latestEpisode.day}'s Brief</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground"><Download size={14} /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground"><RotateCcw size={14} /></button>
                </div>
              </div>

              {/* Progress bar placeholder */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-muted-foreground">00:00</span>
                <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-primary rounded-full" />
                </div>
                <span className="text-[10px] text-muted-foreground">{latestEpisode.totalDurationLabel}</span>
              </div>

              {/* Segment count tagline */}
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                {latestEpisode.totalDurationLabel}. Everything You Need.
              </p>

              {/* Numbered segment list */}
              <div className="space-y-0.5">
                {latestEpisode.segments.filter((seg: any) => !seg.key.includes("greeting") && !seg.key.includes("closing")).map((seg: any, i: number) => (
                  <button
                    key={seg.key}
                    onClick={() => play({
                      url: voicePreference === "andrew" ? seg.audioPath : seg.jennyAudioPath,
                      title: seg.label,
                      episodeDate: latestEpisode.date,
                      segmentKey: seg.key,
                    })}
                    className="w-full flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors text-left group"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                    <span className="flex-1 text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">{seg.label}</span>
                    <span className="text-[10px] text-muted-foreground">{seg.durationLabel}</span>
                    <Play size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No episodes available</p>
          )}
        </section>
      </div>
    </div>
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

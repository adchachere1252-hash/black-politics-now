import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Play, Download, Globe2, Landmark, ArrowUpRight } from "lucide-react";
import { ResultsTicker } from "@/components/ResultsTicker";
import HomepageExample from "@/pages/HomepageExample";
import { rankedWorldSignals, worldSignalLabel } from "@/lib/worldElectionDisplay";
import { homepageContentQueryOptions, homepageElectionQueryOptions } from "@/lib/homepageRefresh";
import { resolveFullEpisodeVoiceUrl } from "@/lib/fullEpisodeVoice";
import { getDailyBriefSegmentRole } from "@/lib/dailyBriefStructure";

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
  const { data: senateRaces } = trpc.election.senate.useQuery(undefined, homepageElectionQueryOptions);
  const { data: houseRaces } = trpc.election.house.useQuery(undefined, homepageElectionQueryOptions);
  const { data: tickerEntries } = trpc.election.tickerEntries.useQuery(undefined, homepageElectionQueryOptions);
  const { play, voicePreference, setVoicePreference, currentTrack, progress, duration } = useAudio();

  const latestEpisode = episodes?.[0];
  const selectedFullEpisodeUrl = latestEpisode ? resolveFullEpisodeVoiceUrl(latestEpisode, voicePreference) : "";
  const latestEpisodeHasAudio = Boolean(selectedFullEpisodeUrl);
  const activeBriefTrack = currentTrack?.episodeDate === latestEpisode?.date ? currentTrack : null;
  const activeBriefProgress = activeBriefTrack && duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;
  return (
    <div className="homepage-atlas-shell min-h-screen">
      {previewMode && (
        <div className="border-b border-primary/30 bg-primary/10 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          Homepage enhancement example · current dashboard retained above
        </div>
      )}
      <div className="border-b border-border/30 px-3 py-2"><ResultsTicker senateRaces={senateRaces as any[] ?? []} houseRaces={houseRaces as any[] ?? []} tickerEntries={tickerEntries as any[] ?? []} /></div>

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

        {/* Column 2: Mobile Election Night status — the interactive U.S. map is desktop-only. */}
        <section className="homepage-atlas-panel p-5 flex flex-col">
          <div className="rounded-xl border border-primary/25 bg-primary/[0.045] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Election Night</p>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-foreground">Live race coverage, built for this screen.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Follow called Senate and House results in the live ticker above. The autonomous tracker continues to update the public record without requiring a map interaction on your phone.</p>
            <div className="mt-4 rounded-lg border border-border bg-background/70 p-3">
              <p className="text-xs font-bold text-foreground">Interactive U.S. Map</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">The full state-by-state map is intentionally reserved for the desktop website, where its geography, search, and race detail controls can be used reliably.</p>
            </div>
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

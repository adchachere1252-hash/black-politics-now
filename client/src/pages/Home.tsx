import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import { Link } from "wouter";
import { ArrowRight, Play, MapPin, Headphones, TrendingUp } from "lucide-react";

export default function Home() {
  const { data: newsData, isLoading: newsLoading } = trpc.news.list.useQuery({ page: 1, perPage: 5 });
  const { data: episodes, isLoading: podLoading } = trpc.podcast.getEpisodes.useQuery();
  const { data: scoreboard } = trpc.election.scoreboard.useQuery();
  const { data: senateRaces } = trpc.election.senate.useQuery();
  const { play, voicePreference } = useAudio();

  const latestEpisode = episodes?.[0];
  const keyRaces = senateRaces?.filter((r: any) => r.rating === "Toss-up" || r.rating === "Lean D" || r.rating === "Lean R").slice(0, 5) ?? [];

  return (
    <div className="container py-8">
      {/* Hero tagline */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
          Political Intelligence. <span className="text-primary">Black Perspective.</span> Every Day.
        </h1>
        <p className="text-muted-foreground text-sm">Your unified command center for news, elections, and the daily brief.</p>
      </div>

      {/* Three-column dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: News */}
        <section className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Latest News</h2>
            <Link href="/" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></Link>
          </div>
          {newsLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {newsData?.posts?.slice(0, 5).map((post: any) => (
                <a
                  key={post.id}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors no-underline group"
                >
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {post._embedded?.["wp:term"]?.[0]?.[0]?.name && (
                      <span className="ml-2 text-primary/70">{post._embedded["wp:term"][0][0].name}</span>
                    )}
                  </p>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Column 2: Election Highlights */}
        <section className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><MapPin size={18} className="text-primary" /> Key Races</h2>
            <Link href="/elections" className="text-xs text-primary hover:underline flex items-center gap-1">Full Map <ArrowRight size={12} /></Link>
          </div>
          {/* Scoreboard mini */}
          {scoreboard && (
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-[var(--color-solid-d)]/20 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Senate D</p>
                <p className="text-lg font-bold text-[color:var(--color-solid-d)]">{scoreboard.senate.dem}</p>
              </div>
              <div className="flex-1 bg-[var(--color-solid-r)]/20 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Senate R</p>
                <p className="text-lg font-bold text-[color:var(--color-solid-r)]">{scoreboard.senate.rep}</p>
              </div>
              <div className="flex-1 bg-[var(--color-solid-d)]/20 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">House D</p>
                <p className="text-lg font-bold text-[color:var(--color-solid-d)]">{scoreboard.house.dem}</p>
              </div>
              <div className="flex-1 bg-[var(--color-solid-r)]/20 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">House R</p>
                <p className="text-lg font-bold text-[color:var(--color-solid-r)]">{scoreboard.house.rep}</p>
              </div>
            </div>
          )}
          {/* Key races list */}
          <div className="space-y-2">
            {keyRaces.map((race: any) => (
              <div key={race.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{race.stateName}</p>
                  <p className="text-xs text-muted-foreground">{race.candidate1Name ?? "TBD"} vs {race.candidate2Name ?? "TBD"}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRatingClass(race.rating)}`}>
                  {race.rating ?? "N/A"}
                </span>
              </div>
            ))}
            {keyRaces.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No competitive races yet</p>}
          </div>
        </section>

        {/* Column 3: Podcast */}
        <section className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Headphones size={18} className="text-primary" /> Daily Brief</h2>
            <Link href="/podcast" className="text-xs text-primary hover:underline flex items-center gap-1">All Episodes <ArrowRight size={12} /></Link>
          </div>
          {podLoading ? (
            <div className="h-40 bg-muted rounded animate-pulse" />
          ) : latestEpisode ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium">{latestEpisode.day}</p>
                  <p className="text-xs text-muted-foreground">{latestEpisode.date} &middot; {latestEpisode.totalDurationLabel}</p>
                </div>
                <button
                  onClick={() => play({
                    url: latestEpisode.fullEpisodeCdnUrl,
                    title: `Daily Brief - ${latestEpisode.date}`,
                    episodeDate: latestEpisode.date,
                  })}
                  className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
                >
                  <Play size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{latestEpisode.segmentCount} topics &middot; Andrew & Jenny</p>
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                {latestEpisode.segments.slice(0, 8).map((seg: any, i: number) => (
                  <button
                    key={seg.key}
                    onClick={() => play({
                      url: voicePreference === "andrew" ? seg.audioPath : seg.jennyAudioPath,
                      title: seg.label,
                      episodeDate: latestEpisode.date,
                      segmentKey: seg.key,
                    })}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className="text-lg">{seg.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{seg.label}</p>
                      <p className="text-xs text-muted-foreground">{seg.durationLabel}</p>
                    </div>
                    <Play size={12} className="text-muted-foreground" />
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

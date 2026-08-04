import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import { useState } from "react";
import { Search as SearchIcon, MapPin, Newspaper, Headphones, Play } from "lucide-react";
import { Link } from "wouter";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const { data, isLoading } = trpc.search.all.useQuery(
    { query: submitted },
    { enabled: submitted.length > 0 }
  );
  const { play, voicePreference } = useAudio();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-6">Search</h1>
      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(query.trim()); }}
        className="flex gap-2 mb-8"
      >
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search news, races, podcast topics..."
            className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-transform active:scale-97">
          Search
        </button>
      </form>

      {isLoading && submitted && (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
      )}

      {data && submitted && (
        <div className="space-y-8">
          {/* News Results */}
          {data.news.length > 0 && (
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><Newspaper size={18} className="text-primary" /> News ({data.news.length})</h2>
              <div className="space-y-2">
                {data.news.map((post: any) => (
                  <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="block glass-card rounded-lg p-4 hover:bg-muted/50 transition-colors no-underline">
                    <p className="text-sm font-medium text-foreground" dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }} />
                    {post.excerpt?.rendered && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
                    )}
                    <p className="text-xs text-primary/70 mt-1">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Election Results */}
          {(data.elections.senate.length > 0 || data.elections.house.length > 0 || data.elections.governor.length > 0) && (
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><MapPin size={18} className="text-primary" /> Election Races</h2>
              <div className="space-y-2">
                {data.elections.senate.map((r: any) => (
                  <Link key={`s-${r.id}`} href="/elections" className="block glass-card rounded-lg p-3 hover:bg-muted/50 transition-colors no-underline">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.stateName} (Senate)</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRatingClass(r.rating)}`}>{r.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.candidate1Name} vs {r.candidate2Name}</p>
                  </Link>
                ))}
                {data.elections.house.map((r: any) => (
                  <Link key={`h-${r.id}`} href="/elections" className="block glass-card rounded-lg p-3 hover:bg-muted/50 transition-colors no-underline">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.stateName} {r.district ? `- District ${r.district}` : ""} (House)</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRatingClass(r.rating)}`}>{r.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.candidate1Name} vs {r.candidate2Name}</p>
                  </Link>
                ))}
                {data.elections.governor.map((r: any) => (
                  <Link key={`g-${r.id}`} href="/elections" className="block glass-card rounded-lg p-3 hover:bg-muted/50 transition-colors no-underline">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{r.stateName} (Governor)</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRatingClass(r.rating)}`}>{r.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Podcast Results */}
          {data.podcast.length > 0 && (
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-3"><Headphones size={18} className="text-primary" /> Podcast Segments</h2>
              <div className="space-y-2">
                {data.podcast.map((ep: any) => (
                  <div key={ep.date} className="glass-card rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">{ep.day} - {ep.date}</p>
                    <div className="space-y-1">
                      {ep.matchingSegments.map((seg: any) => (
                        <button
                          key={seg.key}
                          onClick={() => play({
                            url: voicePreference === "andrew" ? seg.audioPath : seg.jennyAudioPath,
                            title: seg.label,
                            episodeDate: ep.date,
                            segmentKey: seg.key,
                          })}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <span>{seg.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{seg.label}</p>
                            {seg.scriptSnippet && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{seg.scriptSnippet}</p>
                            )}
                          </div>
                          <Play size={12} className="text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {data.news.length === 0 && data.elections.senate.length === 0 && data.elections.house.length === 0 && data.elections.governor.length === 0 && data.podcast.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No results found for "{submitted}"</p>
          )}
        </div>
      )}

      {!submitted && (
        <p className="text-center text-muted-foreground py-8">Search across news articles, election races, and podcast topics.</p>
      )}
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

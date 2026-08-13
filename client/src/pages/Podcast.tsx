import { trpc } from "@/lib/trpc";
import { useAudio } from "@/contexts/AudioContext";
import { useState, useMemo } from "react";
import { Play, Pause, Search, ChevronDown, ChevronUp, FileText, X } from "lucide-react";

export default function Podcast() {
  const { data: episodes = [], isLoading } = trpc.podcast.getEpisodes.useQuery();
  const { play, pause, isPlaying, currentTrack, voicePreference, setVoicePreference } = useAudio();
  const [expandedEp, setExpandedEp] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [scriptDrawer, setScriptDrawer] = useState<{ label: string; script: string } | null>(null);

  const filteredEpisodes = useMemo(() => {
    if (!searchQuery) return episodes as any[];
    const q = searchQuery.toLowerCase();
    return (episodes as any[]).filter(ep =>
      ep.date.includes(q) || ep.day?.toLowerCase().includes(q) ||
      ep.segments.some((s: any) => s.label.toLowerCase().includes(q))
    );
  }, [episodes, searchQuery]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold mb-1">Daily Intelligence Brief</h1>
        <p className="text-muted-foreground text-sm">13 topics. ~40 minutes. Everything you need.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Voice switcher */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setVoicePreference("andrew")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${voicePreference === "andrew" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
          >
            Andrew
          </button>
          <button
            onClick={() => setVoicePreference("jenny")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${voicePreference === "jenny" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
          >
            Jenny
          </button>
        </div>
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search episodes or topics..."
            className="w-full pl-8 pr-3 py-2 bg-muted rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Episode list */}
      <div className="space-y-3">
        {filteredEpisodes.map((ep: any) => {
          const isExpanded = expandedEp === ep.date;
          const isCurrentEp = currentTrack?.episodeDate === ep.date;
          const hasFullAudio = Boolean(ep.fullEpisodeCdnUrl);
          return (
            <div key={ep.date} className="glass-card rounded-xl overflow-hidden">
              {/* Episode header */}
              <div className="flex items-center gap-4 p-4">
                <button
                  onClick={() => {
                    if (isCurrentEp && isPlaying) { pause(); }
                    else if (hasFullAudio) { play({ url: ep.fullEpisodeCdnUrl, title: `Daily Brief - ${ep.date}`, episodeDate: ep.date }); }
                  }}
                  disabled={!hasFullAudio}
                  title={hasFullAudio ? "Play full Daily Intelligence Brief" : "Full episode audio is being prepared"}
                  className="shrink-0 p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isCurrentEp && isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{ep.friendlyDate || `${ep.day || "Daily Brief"} · ${ep.date}`}</p>
                  <p className="text-xs text-muted-foreground">{ep.segmentCount} topics &middot; {ep.totalDurationLabel}</p>
                  {!hasFullAudio && <p className="mt-1 text-[11px] text-muted-foreground">Audio preparation in progress</p>}
                </div>
                <button
                  onClick={() => setExpandedEp(isExpanded ? null : ep.date)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Segments */}
              {isExpanded && (
                <div className="border-t border-border/50 px-4 pb-4 pt-2">
                  <div className="space-y-1">
                    {ep.segments.map((seg: any) => {
                      const segUrl = voicePreference === "andrew" ? seg.audioPath : seg.jennyAudioPath;
                      const hasSegmentAudio = Boolean(segUrl);
                      const isActive = currentTrack?.segmentKey === seg.key && currentTrack?.episodeDate === ep.date;
                      return (
                        <button
                          key={seg.key}
                          onClick={() => hasSegmentAudio && play({ url: segUrl, title: seg.label, episodeDate: ep.date, segmentKey: seg.key })}
                          disabled={!hasSegmentAudio}
                          title={hasSegmentAudio ? `Play ${seg.label}` : "Segment audio is being prepared"}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55 ${isActive ? "bg-primary/10" : "hover:bg-muted/50"}`}
                        >
                          <span className="text-lg">{seg.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? "text-primary" : ""}`}>{seg.label}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">{seg.durationLabel}</span>
                          {seg.isBreaking && <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">BREAKING</span>}
                          {seg.script && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setScriptDrawer({ label: seg.label, script: seg.script }); }}
                              className="p-1 rounded hover:bg-muted transition-colors"
                              title="Read script"
                            >
                              <FileText size={12} className="text-muted-foreground hover:text-primary" />
                            </button>
                          )}
                          <Play size={12} className="text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filteredEpisodes.length === 0 && <p className="text-center text-muted-foreground py-8">No episodes match your search.</p>}

      {/* Script Drawer */}
      {scriptDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setScriptDrawer(null)} />
          <div className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <h3 className="text-sm font-bold">{scriptDrawer.label}</h3>
              </div>
              <button onClick={() => setScriptDrawer(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-invert prose-sm max-w-none">
                {scriptDrawer.script.split("\n").map((line, i) => (
                  <p key={i} className="text-sm text-foreground/90 leading-relaxed mb-3">{line || "\u00A0"}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

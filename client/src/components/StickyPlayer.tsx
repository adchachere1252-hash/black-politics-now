import { useAudio } from "@/contexts/AudioContext";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function StickyPlayer() {
  const { currentTrack, isPlaying, progress, duration, volume, pause, resume, seek, setVolume, voicePreference, setVoicePreference } = useAudio();

  if (!currentTrack) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-md">
      <div className="container flex items-center gap-4 h-16">
        {/* Track info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-foreground">{currentTrack.title}</p>
          <p className="text-xs text-muted-foreground">{currentTrack.episodeDate}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => seek(Math.max(0, progress - 15))} className="p-1.5 text-muted-foreground hover:text-foreground">
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => isPlaying ? pause() : resume()}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={() => seek(Math.min(duration, progress + 30))} className="p-1.5 text-muted-foreground hover:text-foreground">
            <SkipForward size={16} />
          </button>
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-2 flex-1">
          <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(progress)}</span>
          <div
            className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              seek(x * duration);
            }}
          >
            <div className="absolute inset-y-0 left-0 bg-primary rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>

        {/* Voice toggle */}
        <div className="hidden lg:flex items-center gap-1 text-xs">
          <button
            onClick={() => setVoicePreference("andrew")}
            className={`px-2 py-1 rounded ${voicePreference === "andrew" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
          >
            Andrew
          </button>
          <button
            onClick={() => setVoicePreference("jenny")}
            className={`px-2 py-1 rounded ${voicePreference === "jenny" ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
          >
            Jenny
          </button>
        </div>

        {/* Volume */}
        <button
          className="hidden sm:block p-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
        >
          {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </div>
  );
}

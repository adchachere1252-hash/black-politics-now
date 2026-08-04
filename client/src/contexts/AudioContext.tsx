import { createContext, useContext, useState, useRef, useCallback, type ReactNode } from "react";

interface AudioTrack {
  url: string;
  title: string;
  episodeDate: string;
  segmentKey?: string;
}

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  voicePreference: "andrew" | "jenny";
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setVoicePreference: (voice: "andrew" | "jenny") => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [voicePreference, setVoicePreference] = useState<"andrew" | "jenny">(
    () => (localStorage.getItem("bpn-voice") as "andrew" | "jenny") || "andrew"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
    }
  }, [volume]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    setIsPlaying(true);
    audioRef.current?.play().catch(() => {});
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }, []);

  const setVoicePreferenceWrapped = useCallback((voice: "andrew" | "jenny") => {
    setVoicePreference(voice);
    localStorage.setItem("bpn-voice", voice);
  }, []);

  return (
    <AudioCtx.Provider value={{
      currentTrack, isPlaying, progress, duration, volume, voicePreference,
      play, pause, resume, seek, setVolume, setVoicePreference: setVoicePreferenceWrapped, audioRef,
    }}>
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={() => setProgress(audioRef.current?.currentTime ?? 0)}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setIsPlaying(false)}
      />
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

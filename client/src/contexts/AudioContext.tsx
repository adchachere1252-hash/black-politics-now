import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";
import { switchVoiceTrack, type BriefVoice } from "@/lib/audioVoice";

export interface AudioTrack {
  url: string;
  alternateUrl?: string;
  voice?: BriefVoice;
  title: string;
  episodeDate: string;
  segmentKey?: string;
  segmentOrdinal?: number;
  segmentTotal?: number;
  segmentRole?: "greeting" | "editorial" | "closing";
}

interface AudioContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  voicePreference: BriefVoice;
  play: (track: AudioTrack) => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setVoicePreference: (voice: BriefVoice) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [voicePreference, setVoicePreference] = useState<BriefVoice>(
    () => (localStorage.getItem("bpn-voice") as BriefVoice) || "andrew"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setDuration(0);
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

  const setVoicePreferenceWrapped = useCallback((voice: BriefVoice) => {
    setVoicePreference(voice);
    localStorage.setItem("bpn-voice", voice);
    if (!currentTrack || !audioRef.current) return;
    const nextTrack = switchVoiceTrack(currentTrack, voice);
    if (nextTrack === currentTrack) return;
    const audio = audioRef.current;
    const resumeAt = audio.currentTime || 0;
    const shouldResume = isPlaying && !audio.paused;
    setCurrentTrack(nextTrack);
    audio.src = nextTrack.url;
    audio.addEventListener("loadedmetadata", () => {
      audio.currentTime = Math.min(resumeAt, Number.isFinite(audio.duration) ? audio.duration : resumeAt);
      setProgress(audio.currentTime);
      if (shouldResume) audio.play().catch(() => setIsPlaying(false));
    }, { once: true });
  }, [currentTrack, isPlaying]);

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

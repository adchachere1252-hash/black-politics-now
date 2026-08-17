import { Play, Pause, Radio } from "lucide-react";
import { useMemo, useState } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { resolveFullEpisodeVoiceUrl } from "@/lib/fullEpisodeVoice";
import { trpc } from "@/lib/trpc";

export default function PodcastEmbed() {
  const { data: episodes = [], isLoading } = trpc.podcast.getEpisodes.useQuery();
  const { play, pause, isPlaying, currentTrack, voicePreference, setVoicePreference } = useAudio();
  const requestedDate = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("episode");
  const episode: any = useMemo(() => (episodes as any[]).find((item) => item.date === requestedDate) || (episodes as any[])[0], [episodes, requestedDate]);
  const url = episode ? resolveFullEpisodeVoiceUrl(episode, voicePreference) : null;
  const active = currentTrack?.episodeDate === episode?.date && !currentTrack?.segmentKey;
  if (isLoading) return <div className="grid min-h-[210px] place-items-center bg-background text-muted-foreground">Loading Daily Intelligence Brief…</div>;
  if (!episode) return <div className="grid min-h-[210px] place-items-center bg-background text-muted-foreground">No verified episode is available.</div>;
  return <div className="min-h-[210px] bg-background p-5 text-foreground"><div className="flex items-center gap-2 text-primary"><Radio size={16}/><span className="text-[10px] font-bold uppercase tracking-[0.18em]">Black Politics Now</span></div><h1 className="mt-2 text-lg font-bold">Daily Intelligence Brief</h1><p className="mt-1 text-xs text-muted-foreground">{episode.friendlyDate || episode.date} · {episode.segmentCount} segments · {episode.totalDurationLabel}</p><div className="mt-5 flex flex-wrap items-center gap-2"><button onClick={() => active && isPlaying ? pause() : url && play({ url, alternateUrl: voicePreference === "andrew" ? episode.jennyFullEpisodeCdnUrl : episode.fullEpisodeCdnUrl, voice: voicePreference, title: `Daily Brief - ${episode.date}`, episodeDate: episode.date })} disabled={!url} className="inline-flex items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{active && isPlaying ? <Pause size={15}/> : <Play size={15} fill="currentColor"/>}{active && isPlaying ? "Pause" : `Play ${voicePreference === "andrew" ? "Andrew" : "Jenny"}`}</button><div className="flex rounded-md border border-border p-0.5"><button onClick={() => setVoicePreference("andrew")} className={`rounded px-2 py-1 text-xs font-semibold ${voicePreference === "andrew" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Andrew</button><button onClick={() => setVoicePreference("jenny")} className={`rounded px-2 py-1 text-xs font-semibold ${voicePreference === "jenny" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Jenny</button></div><a href="/podcast" target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline">Open full briefing</a></div></div>;
}

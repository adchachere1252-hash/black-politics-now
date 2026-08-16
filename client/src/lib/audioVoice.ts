export type BriefVoice = "andrew" | "jenny";

export type VoiceSwitchableTrack = {
  url: string;
  alternateUrl?: string;
  voice?: BriefVoice;
};

export function switchVoiceTrack<T extends VoiceSwitchableTrack>(track: T, voice: BriefVoice): T {
  if (!track.alternateUrl || track.voice === voice) return track;
  return { ...track, url: track.alternateUrl, alternateUrl: track.url, voice };
}

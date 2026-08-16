export type FullEpisodeVoice = "andrew" | "jenny";

export function resolveFullEpisodeVoiceUrl(episode: { fullEpisodeCdnUrl?: string | null; jennyFullEpisodeCdnUrl?: string | null }, voice: FullEpisodeVoice) {
  return voice === "jenny" ? episode.jennyFullEpisodeCdnUrl ?? "" : episode.fullEpisodeCdnUrl ?? "";
}

export function hasVerifiedDualFullEpisodes(episode: { fullEpisodeCdnUrl?: string | null; jennyFullEpisodeCdnUrl?: string | null; verificationStatus?: string | null }) {
  return episode.verificationStatus === "passed" && Boolean(episode.fullEpisodeCdnUrl) && Boolean(episode.jennyFullEpisodeCdnUrl);
}

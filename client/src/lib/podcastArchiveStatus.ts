export type PodcastArchiveStatusInput = {
  verificationStatus?: string | null;
  fullEpisodeCdnUrl?: string | null;
  jennyFullEpisodeCdnUrl?: string | null;
};

export type PodcastArchiveStatus = {
  label: string;
  tone: "verified" | "held" | "legacy" | "review";
};

export function getPodcastArchiveStatus(input: PodcastArchiveStatusInput): PodcastArchiveStatus {
  const hasAndrewFull = Boolean(input.fullEpisodeCdnUrl);
  const hasJennyFull = Boolean(input.jennyFullEpisodeCdnUrl);
  const isPassed = input.verificationStatus === "passed";

  if (isPassed && hasAndrewFull && hasJennyFull) {
    return { label: "Verified Andrew + Jenny brief", tone: "verified" };
  }
  if (isPassed && hasAndrewFull) {
    return { label: "Verified Andrew brief · Jenny mix held", tone: "held" };
  }
  if (input.verificationStatus === "warnings" && hasAndrewFull) {
    return { label: "Legacy Andrew archive · verification held", tone: "legacy" };
  }
  if (input.verificationStatus === "warnings") {
    return { label: "Archive integrity hold · source/audio incomplete", tone: "held" };
  }
  return { label: "Review needed", tone: "review" };
}

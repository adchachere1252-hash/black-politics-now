import { describe, expect, it } from "vitest";
import { hasVerifiedDualFullEpisodes, resolveFullEpisodeVoiceUrl } from "./fullEpisodeVoice";

describe("full episode voice selection", () => {
  const episode = { fullEpisodeCdnUrl: "andrew.mp3", jennyFullEpisodeCdnUrl: "jenny.mp3", verificationStatus: "passed" };
  it("resolves the selected continuous voice file", () => {
    expect(resolveFullEpisodeVoiceUrl(episode, "andrew")).toBe("andrew.mp3");
    expect(resolveFullEpisodeVoiceUrl(episode, "jenny")).toBe("jenny.mp3");
  });
  it("requires both full assets before reporting dual-full readiness", () => {
    expect(hasVerifiedDualFullEpisodes(episode)).toBe(true);
    expect(hasVerifiedDualFullEpisodes({ fullEpisodeCdnUrl: "andrew.mp3", verificationStatus: "passed" })).toBe(false);
  });
});

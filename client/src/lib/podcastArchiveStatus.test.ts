import { describe, expect, it } from "vitest";
import { getPodcastArchiveStatus } from "./podcastArchiveStatus";

describe("getPodcastArchiveStatus", () => {
  it("calls fully paired passed releases verified", () => {
    expect(getPodcastArchiveStatus({ verificationStatus: "passed", fullEpisodeCdnUrl: "https://audio/andrew.mp3", jennyFullEpisodeCdnUrl: "https://audio/jenny.mp3" })).toEqual({ label: "Verified Andrew + Jenny brief", tone: "verified" });
  });

  it("discloses a passed Andrew mix when its Jenny full mix is unavailable", () => {
    expect(getPodcastArchiveStatus({ verificationStatus: "passed", fullEpisodeCdnUrl: "https://audio/andrew.mp3" })).toEqual({ label: "Verified Andrew brief · Jenny mix held", tone: "held" });
  });

  it("does not call an unsourced warning draft audio preparation", () => {
    expect(getPodcastArchiveStatus({ verificationStatus: "warnings" })).toEqual({ label: "Archive integrity hold · source/audio incomplete", tone: "held" });
  });

  it("preserves the legacy Andrew archive distinction", () => {
    expect(getPodcastArchiveStatus({ verificationStatus: "warnings", fullEpisodeCdnUrl: "https://audio/legacy-andrew.mp3" })).toEqual({ label: "Legacy Andrew archive · verification held", tone: "legacy" });
  });
});

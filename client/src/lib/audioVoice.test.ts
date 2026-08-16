import { describe, expect, it } from "vitest";
import { switchVoiceTrack } from "./audioVoice";

describe("switchVoiceTrack", () => {
  it("swaps the selected segment URL while retaining the return URL", () => {
    expect(switchVoiceTrack({ url: "andrew.mp3", alternateUrl: "jenny.mp3", voice: "andrew" }, "jenny")).toEqual({ url: "jenny.mp3", alternateUrl: "andrew.mp3", voice: "jenny" });
  });

  it("does not change a track without a paired voice asset", () => {
    expect(switchVoiceTrack({ url: "andrew-full.mp3", voice: "andrew" }, "jenny")).toEqual({ url: "andrew-full.mp3", voice: "andrew" });
  });
});

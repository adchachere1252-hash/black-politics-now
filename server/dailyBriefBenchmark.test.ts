import { describe, expect, it } from "vitest";
import { scoreDailyBriefAgainstBenchmark } from "./dailyBriefBenchmark";

const verifiedSegments = [
  { key: "00_greeting", script: "Good morning and welcome to the Daily Intelligence Brief. I am glad you are here for a source-checked update spanning technology, policy, politics, the economy, public health, climate, and space. Each section begins with a clear topic introduction before we move to the reporting.", durationSec: 10, hasAndrewAudio: true, hasJennyAudio: true },
  ...Array.from({ length: 13 }, (_, index) => ({ key: `${String(index + 1).padStart(2, "0")}_topic_${index + 1}`, script: `Next, Topic ${index + 1}. Here is the verified reporting and what it means. ${"Source-backed editorial reporting ".repeat(20)}[REF: Source | https://example.com/${index + 1}]`, durationSec: 60, hasAndrewAudio: true, hasJennyAudio: true })),
  { key: "14_closing", script: "Thank you for listening.", durationSec: 10, hasAndrewAudio: true, hasJennyAudio: true },
];

describe("scoreDailyBriefAgainstBenchmark", () => {
  it("awards a full score only to a fully sourced paired-voice release", () => {
    const score = scoreDailyBriefAgainstBenchmark({ date: "2026-08-17", day: "Monday", verificationStatus: "passed", totalDurationSec: 800, hasAndrewFull: true, hasJennyFull: true, segments: [{ ...verifiedSegments[0] }, { ...verifiedSegments[1], key: "00_weekend_brief" }, ...verifiedSegments.slice(2)] });
    expect(score.status).toBe("verified");
    expect(score.score).toBe(100);
    expect(score.holdReasons).toEqual([]);
  });

  it("holds an unsourced draft without treating it as a publishable episode", () => {
    const score = scoreDailyBriefAgainstBenchmark({ date: "2026-08-01", day: "Saturday", verificationStatus: "warnings", totalDurationSec: 800, segments: verifiedSegments.map((segment) => ({ ...segment, script: segment.script?.replace(/\[REF:[^\]]+\]/g, ""), hasAndrewAudio: false, hasJennyAudio: false })) });
    expect(score.status).toBe("held");
    expect(score.checks.sources).toBe(false);
    expect(score.holdReasons.join(" ")).toContain("source evidence");
  });

  it("holds an otherwise complete release when topic introductions are missing from the full-episode structure", () => {
    const score = scoreDailyBriefAgainstBenchmark({ date: "2026-08-19", day: "Wednesday", verificationStatus: "passed", totalDurationSec: 800, hasAndrewFull: true, hasJennyFull: true, segments: verifiedSegments.map((segment, index) => index === 1 ? { ...segment, script: segment.script?.replace(/^Next,[^]+?means\. /, "") } : segment) });
    expect(score.status).toBe("held");
    expect(score.checks.spokenStructure).toBe(false);
    expect(score.holdReasons.join(" ")).toContain("audible topic introduction");
  });

  it("holds an editorial segment that ends with an unfulfillable listener request", () => {
    const score = scoreDailyBriefAgainstBenchmark({ date: "2026-08-19", day: "Wednesday", verificationStatus: "passed", totalDurationSec: 800, hasAndrewFull: true, hasJennyFull: true, segments: verifiedSegments.map((segment, index) => index === 1 ? { ...segment, script: `${segment.script} Please share this with a friend.` } : segment) });
    expect(score.status).toBe("held");
    expect(score.checks.editorialBoundaries).toBe(false);
  });

  it("holds a Global Political Brief that is American-only", () => {
    const segments = verifiedSegments.map((segment) => ({ ...segment }));
    segments[7] = { ...segments[7], key: "07_global_political_briefs", script: `Next, Global Political Briefs. Florida primary results and U.S. Congress developments are the only focus today. ${"Source-backed editorial reporting ".repeat(20)}[REF: Source | https://example.com/global]` };
    const score = scoreDailyBriefAgainstBenchmark({ date: "2026-08-19", day: "Wednesday", verificationStatus: "passed", totalDurationSec: 800, hasAndrewFull: true, hasJennyFull: true, segments });
    expect(score.status).toBe("held");
    expect(score.checks.globalPoliticalScope).toBe(false);
  });

  it("identifies original pre-July records as preserved baselines rather than scoring them under later voice requirements", () => {
    const score = scoreDailyBriefAgainstBenchmark({ date: "2026-07-27", day: "Monday", verificationStatus: "warnings", totalDurationSec: 800, hasAndrewFull: true, segments: verifiedSegments });
    expect(score.baseline).toBe(true);
    expect(score.status).toBe("baseline");
    expect(score.score).toBeNull();
  });
});

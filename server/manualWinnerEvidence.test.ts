import { describe, expect, it } from "vitest";
import { requireManualCallEvidence } from "./routers";

describe("manual winner confirmation evidence", () => {
  it("rejects a winner confirmation without a source URL", () => {
    expect(() => requireManualCallEvidence({ calledWinner: "Jordan Example", status: "Called" })).toThrow(/source URL/i);
  });

  it("rejects unsupported source URL protocols", () => {
    expect(() => requireManualCallEvidence({ calledWinner: "Jordan Example", status: "Called", calledSourceUrl: "file:///tmp/result" })).toThrow(/source URL/i);
  });

  it("accepts a valid HTTPS source URL and leaves ordinary edits unaffected", () => {
    expect(() => requireManualCallEvidence({ calledWinner: "Jordan Example", status: "Called", calledSourceUrl: "https://results.example.gov/race/1" })).not.toThrow();
    expect(() => requireManualCallEvidence({ rating: "Lean D", notes: "Editorial update" })).not.toThrow();
  });
});

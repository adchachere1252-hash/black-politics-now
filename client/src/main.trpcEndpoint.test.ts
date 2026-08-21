import { describe, expect, it } from "vitest";
import { resolveTrpcEndpoint } from "./lib/trpcEndpoint";

describe("resolveTrpcEndpoint", () => {
  it("uses a valid same-origin absolute API URL for an embedded preview host", () => {
    expect(resolveTrpcEndpoint("https://3000-preview.manus.computer")).toBe("https://3000-preview.manus.computer/api/trpc");
  });

  it("preserves the relative fallback outside a browser runtime", () => {
    expect(resolveTrpcEndpoint("")).toBe("/api/trpc");
  });
});

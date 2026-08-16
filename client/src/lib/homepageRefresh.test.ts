import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_CONTENT_REFRESH_MS,
  HOMEPAGE_ELECTION_REFRESH_MS,
  homepageContentQueryOptions,
  homepageElectionQueryOptions,
} from "./homepageRefresh";

describe("homepage refresh policy", () => {
  it("keeps election and Black Representation views live without aggressive polling", () => {
    expect(HOMEPAGE_ELECTION_REFRESH_MS).toBe(60_000);
    expect(homepageElectionQueryOptions.refetchInterval).toBe(HOMEPAGE_ELECTION_REFRESH_MS);
    expect(homepageElectionQueryOptions.refetchIntervalInBackground).toBe(true);
  });

  it("refreshes editorial content at a lower bounded cadence", () => {
    expect(HOMEPAGE_CONTENT_REFRESH_MS).toBe(300_000);
    expect(homepageContentQueryOptions.refetchInterval).toBe(HOMEPAGE_CONTENT_REFRESH_MS);
    expect(homepageContentQueryOptions.refetchIntervalInBackground).toBe(true);
  });
});

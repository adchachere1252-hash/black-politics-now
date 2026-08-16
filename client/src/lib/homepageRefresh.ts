export const HOMEPAGE_ELECTION_REFRESH_MS = 60_000;
export const HOMEPAGE_CONTENT_REFRESH_MS = 300_000;

export const homepageElectionQueryOptions = {
  staleTime: 15_000,
  refetchInterval: HOMEPAGE_ELECTION_REFRESH_MS,
  refetchIntervalInBackground: true,
} as const;

export const homepageContentQueryOptions = {
  staleTime: 60_000,
  refetchInterval: HOMEPAGE_CONTENT_REFRESH_MS,
  refetchIntervalInBackground: true,
} as const;

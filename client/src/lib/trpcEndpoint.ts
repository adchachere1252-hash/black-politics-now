export function resolveTrpcEndpoint(origin?: string) {
  const safeOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
  return safeOrigin ? new URL("/api/trpc", safeOrigin).toString() : "/api/trpc";
}

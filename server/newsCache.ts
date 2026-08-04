// Server-side caching for WordPress API responses
const cache = new Map<string, { data: any; headers: Record<string, string>; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function fetchWithCache(url: string): Promise<{ data: any; headers: { get(key: string): string | null } }> {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return {
      data: cached.data,
      headers: { get: (key: string) => cached.headers[key.toLowerCase()] ?? null },
    };
  }

  const res = await fetch(url, { headers: { "User-Agent": "BlackPoliticsNow/1.0" } });
  if (!res.ok) throw new Error(`WP API error: ${res.status}`);
  const data = await res.json();

  // Preserve important headers
  const storedHeaders: Record<string, string> = {};
  const total = res.headers.get("X-WP-Total");
  const totalPages = res.headers.get("X-WP-TotalPages");
  if (total) storedHeaders["x-wp-total"] = total;
  if (totalPages) storedHeaders["x-wp-totalpages"] = totalPages;

  cache.set(url, { data, headers: storedHeaders, fetchedAt: now });

  return {
    data,
    headers: { get: (key: string) => storedHeaders[key.toLowerCase()] ?? null },
  };
}

export function clearCache() {
  cache.clear();
}

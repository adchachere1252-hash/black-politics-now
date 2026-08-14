// Server-side caching for WordPress API responses
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { newsCache } from "../drizzle/schema";

const cache = new Map<string, { data: any; headers: Record<string, string>; fetchedAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Returns the latest snapshot written by the WordPress refresh job only when the
 * live WordPress request fails. This is intentionally a read-only stale fallback:
 * it never fabricates stories or substitutes a different source.
 */
export async function getPersistedWordPressNews() {
  const db = await getDb();
  if (!db) return null;
  try {
    const [record] = await db.select().from(newsCache).where(eq(newsCache.cacheKey, "wp_posts_latest")).limit(1);
    if (!record?.payload) return null;
    const parsed = JSON.parse(record.payload);
    if (!Array.isArray(parsed?.posts) || parsed.posts.length === 0) return null;
    return { posts: parsed.posts, total: Number(parsed.total) || parsed.posts.length, totalPages: Number(parsed.totalPages) || 1, fetchedAt: record.fetchedAt };
  } catch (error) {
    console.warn("[News] Unable to read persisted WordPress fallback", error);
    return null;
  }
}

export async function fetchWithCache(url: string): Promise<{ data: any; headers: { get(key: string): string | null } }> {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return {
      data: cached.data,
      headers: { get: (key: string) => cached.headers[key.toLowerCase()] ?? null },
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);
  let data: any;
  let res: Response;
  try {
    res = await fetch(url, { headers: { "User-Agent": "BlackPoliticsNow/1.0" }, signal: controller.signal });
    if (!res.ok) throw new Error(`WP API error: ${res.status}`);
    data = await res.json();
  } finally {
    clearTimeout(timeout);
  }

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

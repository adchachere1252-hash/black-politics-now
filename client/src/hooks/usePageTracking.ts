import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const SESSION_STORAGE_KEY = "bpn_anonymous_visit_session";
const EXCLUDED_PATHS = new Set(["/admin", "/colors", "/homepage-example", "/news-mockup", "/news-concept", "/intelligence-example"]);

function anonymousSessionToken() {
  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const token = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${crypto.getRandomValues(new Uint32Array(2)).join("")}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  return token;
}

function deviceType(): "desktop" | "tablet" | "mobile" {
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1023px)").matches) return "tablet";
  return "desktop";
}

function externalReferrerHost() {
  if (!document.referrer) return null;
  try {
    const referrer = new URL(document.referrer);
    return referrer.host === window.location.host ? null : referrer.host.slice(0, 255);
  } catch {
    return null;
  }
}

/** Records a single anonymous page view per browser session and public route. */
export function usePageTracking() {
  const [location] = useLocation();
  const { mutate } = trpc.siteAnalytics.trackPageView.useMutation();

  useEffect(() => {
    if (EXCLUDED_PATHS.has(location)) return;
    mutate({
      pagePath: location,
      sessionToken: anonymousSessionToken(),
      deviceType: deviceType(),
      referrerHost: externalReferrerHost(),
    });
  }, [location, mutate]);
}

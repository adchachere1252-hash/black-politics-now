import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getAnonymousSessionToken } from "@/lib/anonymousSession";

const EXCLUDED_PATHS = new Set(["/admin", "/colors", "/homepage-example", "/news-mockup", "/news-concept", "/intelligence-example"]);

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
      sessionToken: getAnonymousSessionToken(),
      deviceType: deviceType(),
      referrerHost: externalReferrerHost(),
    });
  }, [location, mutate]);
}

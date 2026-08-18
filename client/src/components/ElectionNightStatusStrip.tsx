import { Activity, CircleAlert, Radio, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatElectionNightTime, summarizePublicElectionNightStatus } from "@/lib/electionNightStatus";
import { HOMEPAGE_ELECTION_REFRESH_MS } from "@/lib/homepageRefresh";

export function ElectionNightStatusStrip({ compact = false }: { compact?: boolean }) {
  const { data: status } = trpc.election.freshness.useQuery(undefined, { refetchInterval: HOMEPAGE_ELECTION_REFRESH_MS, refetchIntervalInBackground: true });
  if (!status) return null;
  const summary = summarizePublicElectionNightStatus(status as any);
  const Icon = summary.live ? Radio : summary.review ? CircleAlert : Activity;
  const tone = summary.live ? "border-emerald-500/30 bg-emerald-500/[0.055] text-emerald-800 dark:text-emerald-200" : summary.review ? "border-amber-500/35 bg-amber-500/[0.06] text-amber-800 dark:text-amber-100" : "border-border bg-muted/25 text-foreground";
  const lastUpdated = formatElectionNightTime((status as any).lastPollAt ?? (status as any).heartbeatAt);

  return <section className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-3 ${compact ? "min-h-8 py-1.5" : "py-2"} ${tone}`} role="status" aria-live="polite" aria-label="Election Night operations status">
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em]"><Icon size={compact ? 12 : 14} className={summary.live ? "animate-pulse" : ""} />{summary.label}</span>
    <span className="text-[10px] font-semibold">{summary.detail}</span>
    <span className="hidden text-[10px] text-muted-foreground sm:inline">{(status as any).newCalls || 0} new call{(status as any).newCalls === 1 ? "" : "s"} this cycle</span>
    <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-muted-foreground"><RefreshCw size={10} />Updated {lastUpdated}</span>
  </section>;
}

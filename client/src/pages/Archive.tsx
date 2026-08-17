import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import { ArrowUpRight, Clock3, Headphones, MapPin, Newspaper, Search } from "lucide-react";
import { getPodcastArchiveStatus } from "@/lib/podcastArchiveStatus";

type ArchiveTab = "news" | "podcast" | "elections";

export default function ArchivePage() {
  const [tab, setTab] = useState<ArchiveTab>(() => {
    const requested = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("tab");
    return requested === "podcast" || requested === "elections" ? requested : "news";
  });
  const [newsPage, setNewsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: newsData, isLoading: newsLoading } = trpc.news.list.useQuery({ page: newsPage, perPage: 15 });
  const { data: episodes = [] } = trpc.podcast.getArchiveEpisodes.useQuery();
  const featuredNews: any = newsData?.posts?.[0];
  const latestEpisode: any = (episodes as any[])[0];
  const newsCategories = useMemo<string[]>(() => Array.from(new Set<string>((newsData?.posts ?? []).map((post: any) => String(post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Reporting")).filter(Boolean))).slice(0, 8), [newsData]);
  const visibleNews = useMemo(() => (newsData?.posts ?? []).filter((post: any) => {
    const category = String(post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Reporting");
    return (!searchQuery || `${post.title?.rendered ?? ""} ${post.date ?? ""}`.toLowerCase().includes(searchQuery.toLowerCase())) && (categoryFilter === "all" || category === categoryFilter);
  }), [newsData, searchQuery, categoryFilter]);

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Search the record</p><h1 className="mt-1 text-3xl font-extrabold">Archive</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Trace what was reported, what was heard in the Daily Brief, and what changed across the political record.</p></div><div className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><Clock3 className="mr-1 inline text-primary" size={13}/> {latestEpisode?.friendlyDate || "Latest briefing"} · {latestEpisode?.totalDurationLabel || "Archive status"}</div></div>

      {(featuredNews || latestEpisode) && <section className="mb-6 grid gap-3 lg:grid-cols-2"><a href={featuredNews?.link || "https://blkpoliticsnow.com"} target="_blank" rel="noreferrer" className="rounded-xl border border-primary/25 bg-primary/[0.045] p-5 transition-colors hover:bg-primary/[0.08]"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Latest reporting</p><h2 className="mt-2 text-lg font-bold leading-tight" dangerouslySetInnerHTML={{ __html: featuredNews?.title?.rendered ?? "Open the Black Politics Now newsroom" }} /><p className="mt-3 text-xs text-muted-foreground">Open the original report <ArrowUpRight className="inline" size={13}/></p></a><a href="/podcast" className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/45"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">Daily Brief record</p><h2 className="mt-2 text-lg font-bold leading-tight">{latestEpisode?.friendlyDate || "Explore verified briefings"}</h2><p className="mt-2 text-sm text-muted-foreground">{latestEpisode ? `${latestEpisode.segmentCount} topics · ${latestEpisode.totalDurationLabel}` : "Browse the complete audio and script archive."}</p><p className="mt-3 text-xs text-primary">Open the Daily Brief <ArrowUpRight className="inline" size={13}/></p></a></section>}

      <div className="flex gap-1 bg-muted rounded-lg p-1 mb-6 w-fit">
        {([
          { key: "news", label: "News", icon: Newspaper },
          { key: "podcast", label: "Podcast", icon: Headphones },
          { key: "elections", label: "Elections", icon: MapPin },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === "news" && <><div className="relative mb-3 max-w-xl"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search this page of reporting…" className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm" /></div><div className="mb-5 flex flex-wrap gap-2"><button onClick={() => setCategoryFilter("all")} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>All reporting</button>{newsCategories.map((category) => <button key={category} onClick={() => setCategoryFilter(category)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryFilter === category ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{category}</button>)}</div></>}

      {tab === "news" && (
        <div>
          {newsLoading ? (
            <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
          ) : (
            <>
              <div className="space-y-2">
                {visibleNews.map((post: any) => (
                  <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="block glass-card rounded-lg p-4 hover:bg-muted/50 transition-colors no-underline">
                    <p className="text-sm font-medium text-foreground" dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }} />
                    <p className="text-xs text-muted-foreground mt-1">{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </a>
                ))}
              </div>
              {newsData && newsData.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button disabled={newsPage <= 1} onClick={() => setNewsPage(p => p - 1)} className="px-3 py-1.5 bg-muted rounded text-sm disabled:opacity-50">Previous</button>
                  <span className="px-3 py-1.5 text-sm text-muted-foreground">Page {newsPage} of {newsData.totalPages}</span>
                  <button disabled={newsPage >= newsData.totalPages} onClick={() => setNewsPage(p => p + 1)} className="px-3 py-1.5 bg-muted rounded text-sm disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "podcast" && (
        <div className="space-y-2">
          {(episodes as any[]).map((ep: any) => (
            <div key={ep.date} className="glass-card rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{ep.friendlyDate || `${ep.day || "Daily Brief"} · ${ep.date}`}</p>
                <p className="text-xs text-muted-foreground">{ep.segmentCount} topics &middot; {ep.totalDurationLabel}</p>
              </div>
              {(() => {
                const status = getPodcastArchiveStatus(ep);
                const statusClass = status.tone === "verified"
                  ? "bg-green-500/15 text-green-600 dark:text-green-400"
                  : status.tone === "held"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    : status.tone === "legacy"
                      ? "bg-sky-500/15 text-sky-700 dark:text-sky-300"
                      : "bg-muted text-muted-foreground";
                return <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass}`}>{status.label}</span>;
              })()}
            </div>
          ))}
        </div>
      )}

      {tab === "elections" && (
        <p className="text-muted-foreground text-sm text-center py-8">Election archive will be available after results are certified.</p>
      )}
    </div>
  );
}

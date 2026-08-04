import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Newspaper, Headphones, MapPin } from "lucide-react";

type ArchiveTab = "news" | "podcast" | "elections";

export default function ArchivePage() {
  const [tab, setTab] = useState<ArchiveTab>("news");
  const [newsPage, setNewsPage] = useState(1);
  const { data: newsData, isLoading: newsLoading } = trpc.news.list.useQuery({ page: newsPage, perPage: 15 });
  const { data: episodes = [] } = trpc.podcast.getEpisodes.useQuery();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-6">Archive</h1>

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

      {tab === "news" && (
        <div>
          {newsLoading ? (
            <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
          ) : (
            <>
              <div className="space-y-2">
                {newsData?.posts?.map((post: any) => (
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
                <p className="text-sm font-medium">{ep.day || ep.date}</p>
                <p className="text-xs text-muted-foreground">{ep.segmentCount} topics &middot; {ep.totalDurationLabel}</p>
              </div>
              <span className="text-xs text-muted-foreground">{ep.date}</span>
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

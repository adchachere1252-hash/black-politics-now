import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useMemo } from "react";
import { ArrowUpRight, Globe2, Landmark, Mic2, Play } from "lucide-react";
import { USMapFull } from "@/components/USMapFull";
import MiniRepositoryGlobe from "@/components/MiniRepositoryGlobe";

const LEGEND = [
  ["Solid D", "bg-[#215da8]"], ["Likely D", "bg-[#3679cf]"], ["Lean D", "bg-[#77a6e8]"], ["Toss-up", "bg-[#7b3ff2]"],
  ["Lean R", "bg-[#de765d]"], ["Likely R", "bg-[#c84343]"], ["Solid R", "bg-[#961d21]"],
] as const;

export default function HomepageExample() {
  const { data: news } = trpc.news.list.useQuery({ page: 1, perPage: 4 });
  const { data: senateRaces } = trpc.election.senate.useQuery();
  const { data: episodes } = trpc.podcast.getEpisodes.useQuery();
  const latestEpisode: any = episodes?.[0];
  const posts: any[] = ((news as any)?.posts ?? []).slice(0, 4);
  const segments: any[] = (latestEpisode?.segments ?? []).slice(0, 5);
  const mapData = useMemo(() => {
    const entries: Record<string, { rating: string | null; candidate1: string; candidate2: string }> = {};
    (senateRaces as any[] ?? []).forEach((race) => {
      if (race.stateCode) entries[race.stateCode] = { rating: race.rating, candidate1: race.demCandidate ?? "Democratic candidate", candidate2: race.repCandidate ?? "Republican candidate" };
    });
    return entries;
  }, [senateRaces]);

  return (
    <div className="min-h-screen bg-[#05080d] px-3 py-3 sm:px-5 sm:py-5">
      <main className="mx-auto max-w-[1600px] rounded-[18px] border border-[#c69d58]/35 bg-[#080c13] p-3 shadow-2xl shadow-black/40 sm:p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[#c69d58]/30 pb-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#c69d58]">Black Politics Now · Homepage direction</span>
          <span className="text-[9px] uppercase tracking-[0.14em] text-white/35">Reference-aligned visual example</span>
        </div>

        <section className="grid gap-3 lg:grid-cols-[0.9fr_1.65fr_0.95fr]">
          <aside className="rounded-md border border-white/10 bg-[#0b1019] p-3">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#c69d58]">Latest News</h2><a href="https://blkpoliticsnow.com" className="text-[10px] text-[#c69d58]" target="_blank" rel="noopener noreferrer">View all</a></div>
            <div className="divide-y divide-white/10">
              {posts.map((post, index) => {
                const image = post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.thumbnail?.source_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
                const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name ?? "Politics";
                return <a key={post.id ?? index} href={post.link} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 py-2.5 first:pt-0">
                  {image ? <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-sm object-cover" /> : <div className="h-12 w-12 shrink-0 rounded-sm bg-[#1e2734]" />}
                  <div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#c69d58]">{category}</p><p className="mt-1 line-clamp-2 text-[12px] font-semibold leading-[1.25] text-white/90" dangerouslySetInnerHTML={{ __html: post.title?.rendered ?? "" }} /><p className="mt-1 text-[9px] text-white/45">{post.date ? new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Latest report"}</p></div>
                </a>;
              })}
            </div>
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-3"><div className="grid h-14 w-11 shrink-0 place-items-center rounded-sm border border-[#c69d58]/40 bg-gradient-to-br from-[#382b16] to-[#111827] text-[#c69d58]"><Landmark size={20} /></div><div><p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#c69d58]">John Lewis Legacy</p><p className="mt-1 text-[11px] leading-snug text-white/65">The history of courage and the unfinished work of representation.</p><Link href="/atlas" className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#c69d58]">Explore the legacy <ArrowUpRight size={11} /></Link></div></div>
          </aside>

          <section className="rounded-md border border-white/10 bg-[#0b1019] p-3">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#c69d58]">Interactive Election Map</p><h1 className="mt-1 text-xl font-bold tracking-tight text-white">2026 U.S. Senate Outlook</h1><p className="mt-1 text-xs text-white/50">Tap a state for race details and analysis.</p></div><span className="rounded border border-white/15 bg-black/20 px-3 py-2 text-[10px] font-semibold text-white/70">U.S. Senate</span></div>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">{LEGEND.map(([label, color]) => <span key={label} className="inline-flex items-center gap-1.5 text-[9px] text-white/60"><i className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>)}</div>
            <div className="mt-2 min-h-[320px] overflow-hidden"><USMapFull raceData={mapData} selectedState={null} onStateClick={() => undefined} /></div>
            <div className="flex items-center gap-3 border-t border-white/10 pt-2 text-[10px]"><span className="font-bold uppercase tracking-[0.1em] text-[#c69d58]">Live Results & Updates</span><span className="text-white/35">•</span><span className="text-white/60">Race calls, reporting, and new polling</span><Link href="/elections" className="ml-auto inline-flex items-center gap-1 font-semibold text-[#c69d58]">More updates <ArrowUpRight size={11} /></Link></div>
          </section>

          <aside className="rounded-md border border-white/10 bg-[#0b1019] p-3"><h2 className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#c69d58]">Daily Intelligence Brief</h2>
            <div className="mt-3 grid grid-cols-[88px_1fr] gap-3 border-b border-white/10 pb-4"><div className="flex aspect-[0.8] items-end rounded-sm border border-[#c69d58]/45 bg-[linear-gradient(145deg,#172232,#070a0f)] p-2"><div><p className="text-base font-black leading-[0.8] text-white">BLACK<br />POLITICS<br />NOW</p><p className="mt-2 border-t border-[#c69d58]/70 pt-1 text-[8px] font-bold tracking-[0.1em] text-[#c69d58]">DAILY BRIEF</p></div></div><div><p className="text-xs text-white/55">{latestEpisode?.episodeDate ?? "Today"}</p><h3 className="mt-2 text-lg font-bold leading-tight text-white">{latestEpisode?.title ?? "The Daily Intelligence Brief"}</h3><p className="mt-2 text-xs text-white/50">Current analysis and context</p></div></div>
            <div className="flex items-center gap-3 border-b border-white/10 py-4"><button type="button" disabled className="grid h-9 w-9 place-items-center rounded-full bg-[#d5a34e] text-[#0b1019]"><Play size={16} fill="currentColor" /></button><span className="text-xs font-semibold text-white/80">Audio preparation in progress</span><div className="ml-auto flex h-7 items-center gap-0.5">{[10,22,14,29,18,26,12,21,16].map((h, index) => <i key={index} className="w-1 rounded-full bg-white/35" style={{ height: h }} />)}</div></div>
            <div className="pt-3"><p className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-[#c69d58]">Episode Segments</p>{(segments.length ? segments : [{ title: "Opening Take" }, { title: "Congressional Roundup" }, { title: "State Watch" }, { title: "Global Black Politics" }, { title: "Final Word" }]).map((segment, index) => <div key={index} className="flex gap-2 py-1.5 text-[11px]"><span className="text-white/45">▶</span><span className="min-w-0 flex-1 truncate text-white/75">{segment.title}</span><span className="text-white/40">{segment.duration ?? "—"}</span></div>)}<Link href="/podcast" className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#c69d58]">View podcast archive <ArrowUpRight size={11} /></Link></div>
          </aside>
        </section>

        <section className="mt-3 rounded-md border border-[#c69d58]/35 bg-[#0a0e15] p-3"><div className="grid gap-3 lg:grid-cols-4">
          <a href="https://blkpoliticsnow.com" target="_blank" rel="noopener noreferrer" className="min-h-[185px] rounded-sm border border-white/10 bg-[#0b1019] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#c69d58]">News / Article Page</p><p className="mt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-[#c69d58]">Politics</p><h3 className="mt-1 text-base font-bold leading-tight">Reporting built for the moment—and the record.</h3><div className="mt-4 flex gap-2"><div className="h-10 w-14 rounded-sm bg-[linear-gradient(135deg,#c69d58,#1d2531_58%)]" /><p className="text-[10px] leading-snug text-white/55">Analysis, source context, and the stories behind the vote.</p></div><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[#c69d58]">Read all stories <ArrowUpRight size={11} /></span></a>
          <Link href="/world" className="relative min-h-[185px] overflow-hidden rounded-sm border border-white/10 bg-[#091422] p-3"><p className="relative z-10 text-[9px] font-bold uppercase tracking-[0.15em] text-[#c69d58]"><Globe2 className="mr-1 inline" size={11} />World Elections Page</p><h3 className="relative z-10 mt-4 max-w-[58%] text-base font-bold leading-tight">Global democracy. Black voices. Local impact.</h3><div aria-hidden className="absolute bottom-[-20px] right-[-16px] h-52 w-52"><MiniRepositoryGlobe /></div><span className="relative z-10 mt-14 inline-flex items-center gap-1 text-[10px] font-semibold text-[#c69d58]">Explore the globe <ArrowUpRight size={11} /></span></Link>
          <Link href="/atlas" className="relative min-h-[185px] overflow-hidden rounded-sm border border-white/10 bg-[#121212] p-3"><img src="/manus-storage/selma-marchers-homepage_4dbcaa12.jpg" alt="Civil rights marchers crossing the Edmund Pettus Bridge in Selma" className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale" /><div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" /><p className="relative z-10 text-[9px] font-bold uppercase tracking-[0.15em] text-[#c69d58]">Historical Atlas Page</p><h3 className="relative z-10 mt-4 max-w-[66%] text-base font-bold leading-tight text-white">Selma, the vote, and the places that changed the nation.</h3><span className="relative z-10 mt-11 inline-flex items-center gap-1 text-[10px] font-semibold text-[#c69d58]">Enter the atlas <ArrowUpRight size={11} /></span></Link>
          <Link href="/podcast" className="min-h-[185px] rounded-sm border border-white/10 bg-[#0b1019] p-3"><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#c69d58]">Podcast / Archive Page</p><div className="mt-4 flex items-center gap-2"><Mic2 size={16} className="text-[#c69d58]" /><h3 className="text-base font-bold leading-tight">Daily analysis. Deep context. Real conversation.</h3></div><div className="mt-4 space-y-2">{["Politics of power and participation", "State battles and voting rights", "Black leadership in local government"].map((title, index) => <div key={title} className="flex gap-2 text-[10px] text-white/65"><span className="text-[#c69d58]">▶</span><span className="truncate">{title}</span><span className="ml-auto text-white/35">{20 + index}:1{index}</span></div>)}</div><span className="mt-5 inline-flex items-center gap-1 text-[10px] font-semibold text-[#c69d58]">View full archive <ArrowUpRight size={11} /></span></Link>
        </div></section>
      </main>
    </div>
  );
}

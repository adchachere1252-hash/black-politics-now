import { trpc } from "@/lib/trpc";
import WorldGlobe from "@/components/WorldGlobe";
import { ArrowRight, CalendarDays, Globe2, Landmark, Newspaper } from "lucide-react";
import { Link } from "wouter";

const selmaImage = "/manus-storage/selma-edmund-pettus-bridge-nps_8b1fca34.jpg";
const leadArticleImage = "/manus-storage/bpn-louisiana-supreme-court-lead_83c54c85.png";

function articleCategory(post: any) {
  return post?._embedded?.["wp:term"]?.[0]?.[0]?.name || "Black Politics Now";
}

function plainText(value: string | undefined) {
  return (value || "").replace(/<[^>]+>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function articleDate(value: string | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function NewsConceptPreview() {
  const { data: newsData, isLoading: newsLoading } = trpc.news.list.useQuery({ page: 1, perPage: 12 });
  const { data: worldElections = [] } = trpc.world.elections.useQuery();
  const posts = newsData?.posts || [];
  const lead = posts[0];
  const related = posts.slice(1, 5);
  const latest = posts.slice(5, 11);
  const upcomingWorld = worldElections.filter((e: any) => e.status !== "Completed").slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-gold/20 bg-[radial-gradient(circle_at_50%_-34%,rgba(207,161,74,.12),transparent_42%)]">
        <div className="container py-8 md:py-10">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.26em]">Black Politics Now newsroom</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">News, with more context.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">A focused refinement of the current Black Politics Now newsroom: the familiar lead report, related coverage, latest stories, and editorial categories—now with clear paths into World Elections and the Historical Atlas.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {["Business", "Civil Rights", "Criminal Justice", "Elections", "Policy", "Voting Rights"].map((item) => (
                <span key={item} className="rounded-full border border-border bg-card px-3 py-1.5">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container py-7 md:py-10">
        {newsLoading || !lead ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_360px]"><div className="h-[560px] animate-pulse rounded-2xl bg-muted" /><div className="h-[560px] animate-pulse rounded-2xl bg-muted" /></div>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_360px]">
              <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/10">
                <img src={leadArticleImage} alt="U.S. Supreme Court building in Washington" className="h-64 w-full object-cover sm:h-80" />
                <div className="p-6 md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{articleCategory(lead)}</p>
                  <a href={lead.link} target="_blank" rel="noopener noreferrer" className="mt-3 block font-display text-3xl font-semibold leading-tight text-foreground transition-colors hover:text-primary md:text-5xl" dangerouslySetInnerHTML={{ __html: lead.title?.rendered || "" }} />
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>By Black Politics Now</span><span className="h-1 w-1 rounded-full bg-primary/70" /><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {articleDate(lead.date)}</span></div>
                  <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{plainText(lead.excerpt?.rendered).slice(0, 260)}{plainText(lead.excerpt?.rendered).length > 260 ? "…" : ""}</p>
                  <a href={lead.link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 border-b border-primary pb-1 text-sm font-semibold text-primary transition-colors hover:text-foreground">Read the full report <ArrowRight className="h-4 w-4" /></a>
                </div>
              </article>

              <aside className="rounded-2xl border border-border bg-card/80 p-5 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between border-b border-border pb-4"><h2 className="font-display text-xl font-semibold">Latest News</h2><a href="https://blkpoliticsnow.com" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:text-foreground">View all</a></div>
                <div className="divide-y divide-border">
                  {posts.slice(1, 6).map((post: any) => (
                    <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="group py-4 no-underline">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{articleCategory(post)}</p><p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }} /><p className="mt-1 text-[11px] text-muted-foreground">{articleDate(post.date)}</p>
                    </a>
                  ))}
                </div>
              </aside>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <Link href="/world" className="group relative min-h-[365px] overflow-hidden rounded-2xl border border-border bg-card no-underline shadow-xl shadow-black/10">
                <div className="absolute inset-0 opacity-65 transition-opacity duration-300 group-hover:opacity-90"><WorldGlobe elections={worldElections} /></div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/90 to-transparent p-6 pt-24">
                  <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Globe2 className="h-3.5 w-3.5" /> World Elections map</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">The world is in motion.</h2>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">Follow upcoming contests, live voting, and completed elections across the global democratic calendar.</p>
                  <div className="mt-4 flex flex-wrap gap-2">{upcomingWorld.map((e: any) => <span key={e.id} className="rounded-full border border-primary/30 bg-background/80 px-2.5 py-1 text-[11px] text-foreground">{e.country} · {e.status}</span>)}</div>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">Explore World Elections <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>

              <Link href="/atlas" className="group overflow-hidden rounded-2xl border border-border bg-card no-underline shadow-xl shadow-black/10">
                <div className="grid h-full sm:grid-cols-[1.05fr_.95fr]">
                  <img src={selmaImage} alt="Edmund Pettus Bridge in Selma, Alabama" className="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-full" />
                  <div className="flex flex-col p-6"><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"><Landmark className="h-3.5 w-3.5" /> Historical Atlas</p><h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground">Selma: a place where history keeps moving.</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Trace the civic history of Selma, Alabama—from the Edmund Pettus Bridge to the continuing work of representation, voting rights, and democracy.</p><div className="mt-auto pt-5"><p className="border-l-2 border-primary pl-3 text-xs leading-relaxed text-muted-foreground">A quiet legacy note: public courage turns memory into action.</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Enter the Historical Atlas <ArrowRight className="h-4 w-4" /></span><p className="mt-3 text-[10px] text-muted-foreground">Bridge image: National Park Service</p></div></div>
                </div>
              </Link>
            </section>

            <section className="mt-10 border-t border-border pt-7"><div className="flex items-end justify-between gap-4"><div><p className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">The newsroom</p><h2 className="mt-2 font-display text-3xl font-semibold">More from Black Politics Now</h2></div><Newspaper className="h-6 w-6 text-primary" /></div><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{latest.map((post: any, index: number) => <a key={post.id} href={post.link} target="_blank" rel="noopener noreferrer" className="group relative min-h-52 overflow-hidden rounded-xl border border-border bg-card p-5 no-underline transition-transform duration-200 hover:-translate-y-0.5"><span className="absolute right-4 top-3 font-display text-5xl font-semibold text-primary/10">0{index + 1}</span><p className="relative text-[10px] font-bold uppercase tracking-[0.16em] text-primary">{articleCategory(post)}</p><p className="relative mt-3 line-clamp-3 font-display text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }} /><p className="relative mt-5 text-[11px] text-muted-foreground">Black Politics Now · {articleDate(post.date)}</p></a>)}</div></section>
          </>
        )}
      </main>
    </div>
  );
}

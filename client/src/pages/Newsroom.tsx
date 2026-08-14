import { ArrowRight, ArrowUpRight, BookOpen, Globe2, Headphones, Landmark, Map, Newspaper, Search, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

const EDITORIAL_CATEGORIES = ["Business", "Civil Rights", "Criminal Justice", "Education", "Elections", "Health", "Policy", "Reparations", "Voting Rights"];
const fallbackImage = "/manus-storage/bpn-louisiana-supreme-court-lead_83c54c85.png";

function plainText(value?: string) { return (value || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim(); }
function articleDate(value?: string) { return value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""; }
function articleCategory(post: any) { return post?._embedded?.["wp:term"]?.[0]?.[0]?.name || "Black Politics Now"; }
function articleImage(post: any) { return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || post?.jetpack_featured_media_url || fallbackImage; }

function wordPressCdnUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("blkpoliticsnow.com") && parsed.pathname.startsWith("/wp-content/")) return `https://i0.wp.com/${parsed.hostname}${parsed.pathname}`;
  } catch { /* Falls through to the original source URL. */ }
  return url;
}

function NewsImage({ post, className, priority = false }: { post: any; className: string; priority?: boolean }) {
  const original = articleImage(post);
  const cdn = wordPressCdnUrl(original);
  const [source, setSource] = useState(original);
  const retrySource = source === original && cdn !== original ? cdn : fallbackImage;
  return <img src={source} alt={plainText(post?.title?.rendered) || "Black Politics Now reporting"} loading={priority ? "eager" : "lazy"} onError={() => setSource(retrySource)} className={className} />;
}

export default function Newsroom() {
  const [category, setCategory] = useState<string | null>(null);
  const { data: categories = [] } = trpc.news.categories.useQuery();
  const categoryId = useMemo(() => category ? categories.find((item: any) => item.name?.toLowerCase() === category.toLowerCase())?.id : undefined, [categories, category]);
  const newsInput = useMemo(() => ({ page: 1, perPage: 20, ...(categoryId ? { category: String(categoryId) } : {}) }), [categoryId]);
  const { data, isLoading } = trpc.news.list.useQuery(newsInput);
  const posts = data?.posts || [];
  const lead = posts[0];
  const spotlight = posts.slice(1, 4);
  const stream = posts.slice(4, 16);

  return <div className="min-h-screen bg-background text-foreground">
    <section className="border-b border-border bg-card/55">
      <div className="container py-7 md:py-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Black Politics Now · Independent newsroom</p><h1 className="mt-3 font-display text-4xl font-black leading-[.95] tracking-tight sm:text-5xl md:text-6xl">The stories shaping Black political life.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">Independent reporting on Black political power, democracy, law, and the decisions shaping public life. Follow the story, then inspect the record.</p></div>
          <a href="https://blkpoliticsnow.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 self-start rounded-sm border border-primary/40 bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/85 lg:self-auto">Visit the original newsroom <ArrowUpRight size={16}/></a>
        </div>
      </div>
      <div className="border-t border-border"><div className="container flex gap-5 overflow-x-auto py-3"><button onClick={() => setCategory(null)} className={`shrink-0 border-b-2 pb-1 text-xs font-bold uppercase tracking-wide transition-colors ${!category ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Home</button>{EDITORIAL_CATEGORIES.map((label) => <button key={label} onClick={() => setCategory(label)} className={`shrink-0 border-b-2 pb-1 text-xs font-bold uppercase tracking-wide transition-colors ${category === label ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}</button>)}<Link href="/search" className="ml-auto inline-flex shrink-0 items-center text-muted-foreground hover:text-primary" aria-label="Search Black Politics Now"><Search size={17}/></Link></div></div>
    </section>

    <main className="container py-7 md:py-10">
      {isLoading || !lead ? <NewsroomSkeleton /> : <>
        <section className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.8fr)]">
          <article className="border-b border-border pb-7 xl:border-b-0 xl:pb-0"><a href={lead.link} target="_blank" rel="noreferrer" className="group block"><div className="relative overflow-hidden bg-muted"><NewsImage post={lead} priority className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015] sm:h-[420px]"/><span className="absolute bottom-4 left-4 bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-primary-foreground">{articleCategory(lead)}</span></div><h2 className="mt-5 max-w-4xl font-display text-3xl font-black leading-[1.01] tracking-tight text-foreground transition-colors group-hover:text-primary md:text-5xl" dangerouslySetInnerHTML={{ __html: lead.title?.rendered || "" }}/><div className="mt-3 flex flex-wrap items-center gap-x-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"><span>By Black Politics Now</span><span className="text-primary">•</span><span>{articleDate(lead.date)}</span></div><p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{plainText(lead.excerpt?.rendered).slice(0, 260)}{plainText(lead.excerpt?.rendered).length > 260 ? "…" : ""}</p></a></article>
          <aside className="border-l-0 border-border xl:border-l xl:pl-7"><div className="flex items-center justify-between border-b-2 border-foreground pb-3"><h2 className="font-display text-2xl font-black">Trending now</h2><span className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">Latest reporting</span></div><div className="divide-y divide-border">{spotlight.map((post: any, index: number) => <a key={post.id} href={post.link} target="_blank" rel="noreferrer" className="group grid grid-cols-[94px_1fr] gap-4 py-5"><NewsImage post={post} className="h-20 w-full object-cover"/><div><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">0{index + 1} · {articleCategory(post)}</p><h3 className="mt-1 font-display text-xl font-black leading-[1.04] text-foreground transition-colors group-hover:text-primary" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}/><p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{articleDate(post.date)}</p></div></a>)}</div></aside>
        </section>

        <section className="mt-11 border-y border-border py-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary">The intelligence desk</p><h2 className="mt-2 font-display text-3xl font-black">News, context, and the record.</h2></div><p className="max-w-lg text-sm leading-relaxed text-muted-foreground">Use the newsroom to follow the story, then move directly to the maps, calendars, and historical records behind it.</p></div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><DeskEntry href="/elections" icon={Map} eyebrow="Election Center" title="Follow the race" detail="Live U.S. contest intelligence, maps, and notes."/><DeskEntry href="/world" icon={Globe2} eyebrow="World Elections" title="Track democracy globally" detail="A visual calendar of elections beyond U.S. borders."/><DeskEntry href="/atlas" icon={Landmark} eyebrow="Historical Atlas" title="See the record" detail="Representation, boundaries, and redistricting context."/><DeskEntry href="/podcast" icon={Headphones} eyebrow="Daily Brief" title="Hear the analysis" detail="Verified daily reporting in a long-form audio brief."/></div></section>

        <section className="mt-11"><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary">{category || "Latest news"}</p><h2 className="mt-2 font-display text-4xl font-black">Reporting from Black Politics Now</h2></div><a href="https://blkpoliticsnow.com" target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-sm font-bold text-primary hover:text-foreground sm:inline-flex">Open all reporting <ArrowRight size={16}/></a></div><div className="mt-6 grid gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">{stream.map((post: any) => <a key={post.id} href={post.link} target="_blank" rel="noreferrer" className="group"><div className="overflow-hidden bg-muted"><NewsImage post={post} className="aspect-[1.35/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"/></div><p className="mt-3 text-[10px] font-bold uppercase tracking-[.16em] text-primary">{articleCategory(post)}</p><h3 className="mt-2 font-display text-2xl font-black leading-[1.02] text-foreground transition-colors group-hover:text-primary" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}/><p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Black Politics Now · {articleDate(post.date)}</p></a>)}</div></section>

        <section className="mt-12 border-t border-border py-8"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary">Reporting standard</p><h2 className="mt-2 font-display text-3xl font-black">Built for readers who want the full record.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">The newsroom retains the original site’s direct reporting voice while the broader platform adds structured election data, historical context, and verified daily audio. Public reporting remains linked to the original Black Politics Now publication.</p></div><div className="flex flex-wrap gap-3"><Link href="/intelligence-example" className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:text-primary"><BookOpen size={16}/> View link + AI example</Link><Link href="/research" className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-4 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"><Sparkles size={16}/> Explore Research Desk</Link></div></div></section>
      </>}
    </main>
  </div>;
}

function DeskEntry({ href, icon: Icon, eyebrow, title, detail }: { href: string; icon: any; eyebrow: string; title: string; detail: string }) { return <Link href={href} className="group border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-primary/5"><Icon size={18} className="text-primary"/><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-primary">{eyebrow}</p><h3 className="mt-2 font-display text-2xl font-black leading-none text-foreground">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-primary">Open <ArrowRight size={14}/></span></Link>; }
function NewsroomSkeleton() { return <div className="space-y-10"><div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,.8fr)]"><div className="h-[540px] animate-pulse bg-muted"/><div className="h-[540px] animate-pulse bg-muted"/></div><div className="grid gap-4 md:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse bg-muted"/>)}</div></div>; }

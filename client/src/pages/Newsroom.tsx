import { ArrowRight, ExternalLink, Map, Search } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";

const EDITORIAL_CATEGORIES = ["Business", "Civil Rights", "Criminal Justice", "Education", "Elections", "Health", "Policy", "Reparations", "Voting Rights"];
const fallbackImage = "/manus-storage/bpn-louisiana-supreme-court-lead_83c54c85.png";

function plainText(value?: string) { return (value || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;/g, "’").trim(); }
function articleDate(value?: string) { return value ? new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""; }
function articleCategory(post: any) { return post?._embedded?.["wp:term"]?.[0]?.[0]?.name || "Black Politics Now"; }
function articleImage(post: any) { return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || post?.jetpack_featured_media_url || fallbackImage; }

function wordPressCdnUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith("blkpoliticsnow.com") && parsed.pathname.startsWith("/wp-content/")) return `https://i0.wp.com/${parsed.hostname}${parsed.pathname}`;
  } catch { /* use original */ }
  return url;
}

function NewsImage({ post, className, priority = false }: { post: any; className: string; priority?: boolean }) {
  const original = articleImage(post);
  const cdn = wordPressCdnUrl(original);
  const [source, setSource] = useState(original);
  const retrySource = source === original && cdn !== original ? cdn : fallbackImage;
  return <img src={source} alt={plainText(post?.title?.rendered) || "Black Politics Now reporting"} loading={priority ? "eager" : "lazy"} onError={() => setSource(retrySource)} className={className} />;
}

function Meta({ post }: { post: any }) { return <p className="mt-3 text-[10px] font-bold uppercase tracking-[.08em] text-[#686868]">By Black Politics Now <span className="mx-1.5 text-[#a7a7a7]">◷</span>{articleDate(post.date)}</p>; }

export default function Newsroom() {
  const [category, setCategory] = useState<string | null>(null);
  const { data: categories = [] } = trpc.news.categories.useQuery();
  const categoryId = useMemo(() => category ? categories.find((item: any) => item.name?.toLowerCase() === category.toLowerCase())?.id : undefined, [categories, category]);
  const newsInput = useMemo(() => ({ page: 1, perPage: 20, ...(categoryId ? { category: String(categoryId) } : {}) }), [categoryId]);
  const { data, isLoading } = trpc.news.list.useQuery(newsInput);
  const posts = data?.posts || [];
  const lead = posts[0];
  const sideStories = posts.slice(1, 5);
  const topNews = posts.slice(5, 13);
  const moreNews = posts.slice(13, 20);

  return <div className="min-h-screen bg-[#fcfcfb] font-sans text-[#171717] selection:bg-[#1c5d98] selection:text-white">
    <header className="border-b border-[#e6e6e6] bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-5 sm:px-8 lg:py-7">
        <a href="https://blkpoliticsnow.com" target="_blank" rel="noreferrer" className="leading-[.76] tracking-[-.07em] text-[#080808]"><span className="block text-[30px] font-black sm:text-[40px]">Black</span><span className="block pl-[2px] text-[17px] font-light tracking-[-.05em] sm:text-[21px]">Politics Now</span></a>
        <div className="hidden text-right lg:block"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#666]">Independent Black political reporting</p><a href="https://blkpoliticsnow.com" target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#1c5d98] hover:text-[#0f3f6a]">Original newsroom <ExternalLink size={12}/></a></div>
        <Link href="/elections" className="inline-flex items-center gap-2 border border-[#1c5d98] bg-[#1c5d98] px-3 py-2 text-xs font-black uppercase tracking-[.08em] text-white transition-colors hover:bg-[#123e67]"><Map size={14}/> Election Map</Link>
      </div>
      <nav className="border-t border-[#e5e5e5] bg-white"><div className="mx-auto flex max-w-[1280px] items-stretch gap-6 overflow-x-auto px-5 sm:px-8"><button onClick={() => setCategory(null)} className={`shrink-0 border-b-[3px] py-4 text-[13px] font-black uppercase tracking-[-.02em] ${!category ? "border-[#1c5d98] text-[#171717]" : "border-transparent text-[#171717] hover:border-[#d5d5d5]"}`}>Home</button>{EDITORIAL_CATEGORIES.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 border-b-[3px] py-4 text-[13px] font-black uppercase tracking-[-.02em] ${category === item ? "border-[#1c5d98] text-[#171717]" : "border-transparent text-[#171717] hover:border-[#d5d5d5]"}`}>{item}</button>)}<Link href="/elections" className="ml-auto inline-flex shrink-0 items-center gap-1 border-b-[3px] border-transparent py-4 text-[13px] font-black uppercase tracking-[-.02em] text-[#1c5d98] hover:border-[#1c5d98]">Live Map <ArrowRight size={14}/></Link><Link href="/search" aria-label="Search" className="inline-flex shrink-0 items-center px-1 text-[#222] hover:text-[#1c5d98]"><Search size={19}/></Link></div></nav>
    </header>

    <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 sm:px-8 lg:pt-11">
      {isLoading || !lead ? <NewsroomSkeleton /> : <>
        <section className="grid gap-9 border-b border-[#e6e6e6] pb-10 lg:grid-cols-[minmax(0,1.65fr)_360px]">
          <article><a href={lead.link} target="_blank" rel="noreferrer" className="group block"><div className="relative overflow-hidden bg-[#ececec]"><NewsImage post={lead} priority className="h-[245px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.015] sm:h-[390px]"/><span className="absolute bottom-0 left-0 bg-[#1c5d98] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-white">{articleCategory(lead)}</span></div><h1 className="mt-5 max-w-5xl font-display text-[36px] font-black leading-[.98] tracking-[-.045em] text-[#161616] transition-colors group-hover:text-[#1c5d98] sm:text-[49px]" dangerouslySetInnerHTML={{ __html: lead.title?.rendered || "" }}/><Meta post={lead}/><p className="mt-5 max-w-4xl text-[15px] leading-7 text-[#595959]">{plainText(lead.excerpt?.rendered).slice(0, 310)}{plainText(lead.excerpt?.rendered).length > 310 ? "…" : ""}</p></a></article>
          <aside className="lg:border-l lg:border-[#e5e5e5] lg:pl-7"><div className="grid grid-cols-3 border-b-2 border-[#1c5d98] text-center text-[12px] font-black uppercase"><span className="border-b-2 border-[#1c5d98] py-3">Trending</span><span className="border-x border-[#e5e5e5] py-3 text-[#777]">Comments</span><span className="py-3 text-[#777]">Latest</span></div><div className="divide-y divide-[#e7e7e7]">{sideStories.map((post: any) => <a key={post.id} href={post.link} target="_blank" rel="noreferrer" className="group grid grid-cols-[112px_1fr] gap-4 py-5"><NewsImage post={post} className="h-[82px] w-full object-cover"/><div><h2 className="font-display text-[21px] font-black leading-[1.02] tracking-[-.03em] group-hover:text-[#1c5d98]" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}/><p className="mt-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#777]">◷ {articleDate(post.date)}</p></div></a>)}</div></aside>
        </section>

        <section className="my-9 border-y-4 border-[#171717] bg-[#f1f4f7] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7"><div className="flex items-start gap-4"><span className="mt-0.5 rounded-full bg-[#1c5d98] p-2 text-white"><Map size={18}/></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#1c5d98]">Live intelligence</p><h2 className="mt-1 font-display text-3xl font-black leading-none tracking-[-.04em]">Return to the 2026 Election Map</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#555]">Follow the reporting here, then inspect live U.S. race notes, state context, and Black representation records.</p></div></div><Link href="/elections" className="mt-5 inline-flex shrink-0 items-center gap-2 bg-[#1c5d98] px-5 py-3 text-sm font-black uppercase tracking-[.06em] text-white hover:bg-[#123e67] sm:mt-0">Open live map <ArrowRight size={16}/></Link></section>

        <section><div className="flex items-end justify-between border-b border-[#e5e5e5] pb-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#1c5d98]">{category || "Latest News"}</p><h2 className="mt-1 font-display text-4xl font-black tracking-[-.04em]">Top News</h2></div><a href="https://blkpoliticsnow.com" target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-sm font-bold text-[#1c5d98] hover:text-[#171717] sm:inline-flex">View all <ArrowRight size={16}/></a></div><div className="grid gap-x-7 gap-y-9 pt-6 sm:grid-cols-2 lg:grid-cols-4">{topNews.map((post: any) => <a key={post.id} href={post.link} target="_blank" rel="noreferrer" className="group"><div className="relative overflow-hidden bg-[#ededed]"><NewsImage post={post} className="aspect-[1.34/1] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"/><span className="absolute bottom-0 left-0 bg-[#1c5d98] px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em] text-white">{articleCategory(post)}</span></div><h3 className="mt-4 font-display text-[25px] font-black leading-[1.02] tracking-[-.035em] group-hover:text-[#1c5d98]" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}/><Meta post={post}/></a>)}</div></section>

        {moreNews.length > 0 && <section className="mt-12 grid gap-7 border-t border-[#e6e6e6] pt-8 sm:grid-cols-2 lg:grid-cols-3">{moreNews.map((post: any) => <a key={post.id} href={post.link} target="_blank" rel="noreferrer" className="group grid grid-cols-[120px_1fr] gap-4 border-b border-[#e6e6e6] pb-6"><NewsImage post={post} className="h-[92px] w-full object-cover"/><div><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#1c5d98]">{articleCategory(post)}</p><h3 className="mt-2 font-display text-[23px] font-black leading-[1.03] tracking-[-.03em] group-hover:text-[#1c5d98]" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }}/><p className="mt-2 text-[10px] font-bold uppercase tracking-[.08em] text-[#777]">{articleDate(post.date)}</p></div></a>)}</section>}
      </>}
    </main>

    <footer className="bg-[#090909] text-white"><div className="mx-auto grid max-w-[1280px] gap-9 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr] lg:py-16"><div><p className="leading-[.76] tracking-[-.07em]"><span className="block text-[37px] font-black">Black</span><span className="block pl-[2px] text-[20px] font-light tracking-[-.05em]">Politics Now</span></p><p className="mt-7 max-w-xs text-sm leading-6 text-[#b5b5b5]">Independent reporting on Black political life, voting rights, democracy, and the record behind the story.</p></div><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#cfcfcf]">Categories</p><div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-[#b5b5b5]">{EDITORIAL_CATEGORIES.map((item) => <button key={item} onClick={() => { setCategory(item); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-white">{item}</button>)}</div></div><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#cfcfcf]">Platform</p><div className="mt-4 space-y-2 text-sm text-[#b5b5b5]"><Link href="/elections" className="block hover:text-white">Election Map</Link><Link href="/world" className="block hover:text-white">World Elections</Link><Link href="/atlas" className="block hover:text-white">Historical Atlas</Link><Link href="/podcast" className="block hover:text-white">Daily Intelligence Brief</Link></div></div></div><div className="mx-auto max-w-[1280px] border-t border-white/15 px-5 py-5 text-xs text-[#8c8c8c] sm:px-8">© 2026 Black Politics Now. All rights reserved.</div></footer>
  </div>;
}

function NewsroomSkeleton() { return <div className="space-y-9"><div className="grid gap-8 lg:grid-cols-[1.65fr_360px]"><div className="h-[570px] animate-pulse bg-[#e9e9e9]"/><div className="h-[570px] animate-pulse bg-[#efefef]"/></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse bg-[#efefef]"/>)}</div></div>; }

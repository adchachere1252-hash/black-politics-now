import { ArrowLeft, Compass, LayoutTemplate, Sparkles } from "lucide-react";
import { Link } from "wouter";

const conceptUrl = "/manus-storage/bpn-full-site-concept_86484d5e.png";

export default function FullSiteConceptPreview() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-gold/20 bg-[radial-gradient(circle_at_50%_-28%,rgba(207,161,74,0.13),transparent_43%)]">
        <div className="container py-10 md:py-14">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-gold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Black Politics Now
          </Link>
          <div className="mt-7 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <Sparkles className="h-3.5 w-3.5" /> Full-platform concept
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">One platform. One clear point of view.</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                A cohesive view of Black Politics Now after a restrained News refinement—while keeping the Election Center, World Elections, Historical Atlas, and Daily Intelligence Brief as distinct, recognizable destinations.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gold/20 bg-card/65 px-4 py-3 text-sm text-muted-foreground backdrop-blur">
              <LayoutTemplate className="h-4 w-4 text-gold" /> Concept preview only
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8 md:py-12">
        <div className="overflow-hidden rounded-2xl border border-gold/20 bg-card shadow-2xl shadow-black/30">
          <img
            src={conceptUrl}
            alt="Full Black Politics Now platform concept with News, Election Center, World Elections, Historical Atlas, and Podcast destinations"
            className="block h-auto w-full bg-black"
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Preserves the platform you built", "The homepage remains the familiar three-column intelligence dashboard: reporting at left, the interactive map at center, and the Daily Intelligence Brief at right."],
            ["Lets each destination do its job", "News, Election Map, World Elections, Historical Atlas, and Podcast retain their own purpose while sharing a consistent dark-and-gold editorial language."],
            ["Keeps John Lewis in the right proportion", "The John Lewis legacy element becomes a small, dignified News touchpoint—present in the mission, but never stronger than the reporting itself."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground"><Compass className="h-4 w-4 text-gold" /> {title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-gold/20 bg-card/70 p-5 text-sm leading-relaxed text-muted-foreground">
          <strong className="font-display text-base text-foreground">What changes in this direction:</strong> the News area receives subtle editorial polish. <strong className="font-display text-base text-foreground">What stays the same:</strong> the platform’s core dashboard, map-first website experience, standalone World and Atlas pages, podcast workflow, and mobile-friendly stacked layout.
        </div>
      </section>
    </div>
  );
}

import { ArrowLeft, LayoutTemplate, Sparkles } from "lucide-react";
import { Link } from "wouter";

const mockupUrl = "/manus-storage/bpn-news-mockup-original-elevated_59837162.png";

export default function NewsMockupPreview() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-gold/20 bg-[radial-gradient(circle_at_50%_-30%,rgba(207,161,74,0.12),transparent_45%)]">
        <div className="container py-10 md:py-14">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-gold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Black Politics Now
          </Link>
          <div className="mt-7 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                <Sparkles className="h-3.5 w-3.5" /> News-section concept
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">Original Style, Elevated</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                A refined News hub that preserves Black Politics Now&apos;s familiar dark newsroom rhythm, warm-gold accents, compact story cards, and political-intelligence character.
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
            src={mockupUrl}
            alt="Original Style, Elevated concept for the Black Politics Now News section"
            className="block h-auto w-full bg-black"
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["Preserves the identity", "Dark navy newsroom surfaces, warm-gold hierarchy, compact cards, and editorial density."],
            ["Raises the story priority", "A clear lead investigation and sharper grouping of the latest reporting."],
            ["Improves discovery", "Topic-led reading paths and a more intentional flow into your existing WordPress articles."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useState } from "react";

const COLOR_OPTIONS = [
  { name: "Gold (Current)", hue: 75, chroma: 0.12, lightness: 0.78, desc: "Prestige, authority, classic" },
  { name: "Electric Blue", hue: 240, chroma: 0.15, lightness: 0.70, desc: "Modern, tech-forward, CNN-like" },
  { name: "Emerald Green", hue: 155, chroma: 0.18, lightness: 0.70, desc: "Growth, prosperity, fresh" },
  { name: "Royal Purple", hue: 300, chroma: 0.18, lightness: 0.65, desc: "Power, distinction, unique" },
  { name: "Crimson Red", hue: 25, chroma: 0.22, lightness: 0.60, desc: "Urgency, breaking news, bold" },
  { name: "Teal", hue: 190, chroma: 0.14, lightness: 0.68, desc: "Calm authority, trustworthy" },
];

export default function ColorPreview() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-extrabold mb-2">Color Theme Preview</h1>
      <p className="text-muted-foreground text-sm mb-8">Click a color to see how it looks across the site elements.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {COLOR_OPTIONS.map((opt, i) => (
          <button
            key={opt.name}
            onClick={() => setSelected(i)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${selected === i ? "border-white scale-105 shadow-lg" : "border-border/50 hover:border-border"}`}
          >
            <div
              className="w-full h-12 rounded-lg mb-3"
              style={{ backgroundColor: `oklch(${opt.lightness} ${opt.chroma} ${opt.hue})` }}
            />
            <p className="text-sm font-bold">{opt.name}</p>
            <p className="text-xs text-muted-foreground">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Preview with selected color */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div
          className="p-6"
          style={{ "--preview-color": `oklch(${COLOR_OPTIONS[selected].lightness} ${COLOR_OPTIONS[selected].chroma} ${COLOR_OPTIONS[selected].hue})` } as any}
        >
          {/* Header preview */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <span className="font-display text-xl font-extrabold tracking-tight" style={{ color: "var(--preview-color)" }}>
              BLACK POLITICS NOW
            </span>
            <div className="flex gap-4 text-sm">
              <span style={{ color: "var(--preview-color)" }} className="font-medium">News</span>
              <span className="text-muted-foreground">Election Map</span>
              <span className="text-muted-foreground">Podcast</span>
            </div>
          </div>

          {/* Content preview */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--preview-color)" }}>Latest News</h3>
              <div className="space-y-2">
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-[9px] font-bold uppercase" style={{ color: "var(--preview-color)" }}>CIVIL RIGHTS</span>
                  <p className="text-xs">Supreme Court Hears Case That Could Reshape Voting Rights Act</p>
                </div>
                <div className="p-2 rounded bg-muted/30">
                  <span className="text-[9px] font-bold uppercase" style={{ color: "var(--preview-color)" }}>POLICY</span>
                  <p className="text-xs">House Democrats Unveil Bold Plan to Expand Affordable Housing</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider">Interactive Election Map</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: "var(--preview-color)", color: "#000" }}>HOUSE</button>
                <button className="px-3 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">SENATE</button>
              </div>
              <div className="h-32 bg-muted/30 rounded flex items-center justify-center text-xs text-muted-foreground">
                [Map Preview]
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--preview-color)" }}>Daily Intelligence Brief</h3>
              <p className="text-xs text-muted-foreground">A Daily Podcast with <span style={{ color: "var(--preview-color)" }} className="font-bold">ANDREW</span> & <span style={{ color: "var(--preview-color)" }} className="font-bold">JENNY</span></p>
              <div className="space-y-1">
                {["AI Trends", "American Political Briefs", "Tech News", "Global Economy"].map((t, i) => (
                  <div key={t} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-muted/30">
                    <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <span className="text-xs">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Button previews */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-border/50">
            <button className="px-4 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "var(--preview-color)", color: "#000" }}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: "var(--preview-color)", color: "var(--preview-color)" }}>
              Outline Button
            </button>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: "color-mix(in oklch, var(--preview-color) 20%, transparent)", color: "var(--preview-color)" }}>
              ● LIVE
            </span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        This is a preview only. Tell me which color you prefer and I'll apply it site-wide.
      </p>
    </div>
  );
}

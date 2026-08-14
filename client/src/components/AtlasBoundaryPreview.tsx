import { useEffect, useMemo, useState } from "react";
import { geoIdentity, geoPath } from "d3-geo";
import { ExternalLink, Map as MapIcon } from "lucide-react";

type GeoJsonCollection = { type: "FeatureCollection"; features: Array<{ type: "Feature"; properties?: Record<string, unknown>; geometry: unknown }> };

const SOURCE_BASE = "https://github.com/JeffreyBLewis/congressional-district-boundaries/tree/master/GeoJson";

export function AtlasBoundaryPreview({ stateName, congress, filename, seats }: { stateName: string; congress: number; filename?: string; seats: number }) {
  const [collection, setCollection] = useState<GeoJsonCollection | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!filename) { setCollection(null); setStatus("error"); return; }
    const controller = new AbortController();
    setStatus("loading");
    fetch(`/api/atlas/boundary/${encodeURIComponent(filename)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unavailable")))
      .then((data) => { if (!controller.signal.aborted) { setCollection(data as GeoJsonCollection); setStatus("ready"); } })
      .catch(() => { if (!controller.signal.aborted) { setCollection(null); setStatus("error"); } });
    return () => controller.abort();
  }, [filename]);

  const paths = useMemo(() => {
    if (!collection?.features?.length) return [];
    const projection = geoIdentity().reflectY(true).fitSize([760, 420], collection as any);
    const draw = geoPath(projection);
    return collection.features.map((feature, index) => ({ key: String(feature.properties?.district ?? feature.properties?.CD116FP ?? index), path: draw(feature as any) || "" }));
  }, [collection]);

  return <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><MapIcon size={18} className="text-primary" /><h3 className="font-display text-xl font-bold">Historical boundary viewer</h3></div><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{stateName} district boundaries for the {congress}th Congress. This repository-backed reference is historical geography, not a certification of the current legal map.</p></div>{filename && <a href={`${SOURCE_BASE}/${encodeURIComponent(filename)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15">Open source file <ExternalLink size={12} /></a>}</div><div className="mt-5 overflow-hidden rounded-xl border border-primary/30 bg-[linear-gradient(150deg,rgba(35,29,18,.98),rgba(10,13,20,.98))]"><div className="relative aspect-[1.8/1] min-h-[250px]">{status === "loading" && <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">Loading repository boundary reference…</div>}{status === "error" && <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-muted-foreground">The boundary file could not be loaded right now. The archived source file remains linked above.</div>}{status === "ready" && <svg viewBox="0 0 760 420" className="h-full w-full" role="img" aria-label={`${stateName} congressional district boundaries for the ${congress}th Congress`}>{paths.map((shape, index) => <path key={`${shape.key}-${index}`} d={shape.path} fill={index % 2 ? "rgba(111,83,34,.72)" : "rgba(55,43,22,.92)"} stroke="#f1c66c" strokeWidth="1.35" vectorEffect="non-scaling-stroke" />)}</svg>}<span className="absolute bottom-3 left-3 rounded border border-primary/30 bg-background/85 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">{paths.length || seats} districts indexed</span></div></div></div>;
}

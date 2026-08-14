import { useEffect, useMemo, useRef, useState } from "react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { LEWIS_MANIFEST } from "@/data/atlasBoundaryManifest";
import { STATE_CODES } from "@/data/atlasHistory";

type GeoFeature = { type: "Feature"; properties?: Record<string, unknown>; geometry: unknown };
type GeoCollection = { type: "FeatureCollection"; features: GeoFeature[] };
type DrawnFeature = GeoFeature & { properties: Record<string, unknown> };

const FILE_TO_STATE = new Map<string, string>();
Object.entries(LEWIS_MANIFEST).forEach(([state, eras]) => eras.forEach((era) => FILE_TO_STATE.set(era.name, state)));

function boundaryFor(state: string, congress: number) {
  return LEWIS_MANIFEST[state]?.find((era) => congress >= era.start && congress <= era.end)?.name;
}

function districtLabel(properties: Record<string, unknown>) {
  const district = Number(properties.district ?? properties.DISTRICT ?? 0);
  return district === 0 ? "At-large" : `District ${district}`;
}

function removeProjectionClipRects(path: string) {
  const subPaths = path.match(/M[^M]*/g) ?? [];
  return subPaths.filter((subPath) => {
    const lineCount = (subPath.match(/L/g) ?? []).length;
    if (lineCount !== 3 || !subPath.endsWith("Z")) return true;
    const values = (subPath.match(/-?\d+\.?\d*/g) ?? []).map(Number);
    if (values.length < 8) return true;
    const [x1, y1, x2, y2, x3, y3, x4, y4] = values;
    const epsilon = 0.1;
    const isRectangle = Math.abs(x1 - x4) < epsilon && Math.abs(y1 - y2) < epsilon && Math.abs(x2 - x3) < epsilon && Math.abs(y3 - y4) < epsilon;
    return !isRectangle || Math.abs(x2 - x1) * Math.abs(y3 - y2) < 1000;
  }).join("");
}

export function HistoricalUSMap({ congress, selectedState, onStateSelect }: { congress: number; selectedState?: string | null; onStateSelect: (stateCode: string) => void }) {
  const [bundle, setBundle] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<{ x: number; y: number; state: string; district: string; changed: boolean } | null>(null);
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setBundle(null);
    setError(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    fetch(`/api/atlas/bundle/${congress}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unavailable")))
      .then((data) => { if (!controller.signal.aborted) setBundle(data as Record<string, string>); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [congress]);

  const map = useMemo(() => {
    if (!bundle) return { paths: [] as Array<{ key: string; path: string; state: string; stateCode: string; district: string; changed: boolean }>, districtCount: 0, changedStates: new Set<string>() };
    const features: DrawnFeature[] = [];
    Object.entries(bundle).forEach(([filename, raw]) => {
      const state = FILE_TO_STATE.get(filename);
      if (!state) return;
      try {
        const collection = JSON.parse(raw) as GeoCollection;
        collection.features.forEach((feature) => features.push({ ...feature, properties: { ...(feature.properties ?? {}), __atlasState: state } }));
      } catch { /* malformed source files are omitted instead of blocking the Atlas */ }
    });
    const projection = geoAlbersUsa().fitSize([1000, 620], { type: "FeatureCollection", features } as any);
    const draw = geoPath(projection);
    const changedStates = new Set(Object.keys(LEWIS_MANIFEST).filter((state) => congress > 89 && boundaryFor(state, congress) !== boundaryFor(state, congress - 1)));
    return {
      paths: features.map((feature, index) => {
        const state = String(feature.properties.__atlasState);
        return { path: removeProjectionClipRects(draw(feature as any) || ""), state, stateCode: STATE_CODES[state] || "", district: districtLabel(feature.properties), changed: changedStates.has(state), key: `${state}-${index}` };
      }),
      districtCount: features.length,
      changedStates,
    };
  }, [bundle, congress]);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    dragOrigin.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    moved.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragOrigin.current) return;
    const dx = event.clientX - dragOrigin.current.x;
    const dy = event.clientY - dragOrigin.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    setPan({ x: dragOrigin.current.panX + dx, y: dragOrigin.current.panY + dy });
  };
  const handlePointerUp = () => { dragOrigin.current = null; };

  return <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[radial-gradient(circle_at_53%_30%,rgba(53,91,120,.28),transparent_36%),linear-gradient(150deg,#090f19,#101820_58%,#080b12)] shadow-[inset_0_0_54px_rgba(88,160,204,.1)]">
    <div className="absolute left-4 top-4 z-10 rounded border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[10px] text-slate-200 backdrop-blur-sm"><strong className="text-primary">{map.districtCount || "…"}</strong> archived districts · <strong className="text-cyan-200">{map.changedStates.size}</strong> states revised</div>
    <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded border border-white/10 bg-slate-950/70 backdrop-blur-sm"><button aria-label="Zoom out" type="button" onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(1))))} className="grid h-8 w-8 place-items-center text-slate-200 hover:bg-white/10"><Minus size={14} /></button><button aria-label="Reset map view" type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="grid h-8 w-8 place-items-center border-x border-white/10 text-slate-200 hover:bg-white/10"><RotateCcw size={13} /></button><button aria-label="Zoom in" type="button" onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))} className="grid h-8 w-8 place-items-center text-slate-200 hover:bg-white/10"><Plus size={14} /></button></div>
    <svg viewBox="0 0 1000 620" className="block aspect-[1.62/1] w-full touch-none select-none" role="img" aria-label={`United States congressional district boundaries for the ${congress}th Congress`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={() => { handlePointerUp(); setHover(null); }} onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(0.8, Math.min(2.4, Number((value + (event.deltaY < 0 ? 0.15 : -0.15)).toFixed(2))))); }}>
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`} style={{ transformOrigin: "center" }}>
        {map.paths.map((feature) => {
          const isSelected = feature.stateCode === selectedState;
          return <path key={feature.key} d={feature.path} tabIndex={0} role="button" aria-label={`${feature.state}, ${feature.district}${feature.changed ? ", boundary changed in this Congress" : ""}`} onClick={() => { if (!moved.current && feature.stateCode) onStateSelect(feature.stateCode); }} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && feature.stateCode) { event.preventDefault(); onStateSelect(feature.stateCode); } }} onMouseMove={(event) => { const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect(); setHover({ x: event.clientX - rect.left, y: event.clientY - rect.top, state: feature.state, district: feature.district, changed: feature.changed }); }} onMouseEnter={() => {}} fill={isSelected ? "#e1ad53" : feature.changed ? "#3d9ebf" : "#243449"} fillOpacity={isSelected ? 0.96 : feature.changed ? 0.82 : 0.76} stroke={isSelected ? "#fff0c8" : feature.changed ? "#b6efff" : "#71829a"} strokeWidth={isSelected ? 1.15 : 0.48} vectorEffect="non-scaling-stroke" className="cursor-pointer outline-none transition-[fill,stroke] duration-150 hover:fill-primary focus-visible:fill-primary" />;
        })}
      </g>
    </svg>
    {!bundle && !error && <div className="absolute inset-0 grid place-items-center bg-slate-950/45 text-sm text-slate-200 backdrop-blur-[1px]"><span className="rounded-full border border-primary/30 bg-slate-950/80 px-4 py-2">Loading archived national boundaries…</span></div>}
    {error && <div className="absolute inset-0 grid place-items-center bg-slate-950/70 px-8 text-center text-sm text-slate-200">The historical boundary source is temporarily unavailable. Use the state archive below or try another Congress.</div>}
    {hover && <div className="pointer-events-none absolute z-20 max-w-52 rounded border border-primary/30 bg-slate-950/95 px-2.5 py-2 text-[10px] text-slate-200 shadow-xl" style={{ left: Math.min(hover.x + 12, 760), top: Math.max(40, hover.y - 48) }}><strong className="block text-primary">{hover.state} · {hover.district}</strong><span>{hover.changed ? "Boundary revised for this Congress" : "Boundary carried from prior Congress"}</span></div>}
    <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-x-3 gap-y-1 rounded border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[9px] text-slate-200 backdrop-blur-sm"><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#243449]" />Archived boundary</span><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#3d9ebf]" />Changed since prior Congress</span><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-primary" />Selected state</span></div>
  </div>;
}

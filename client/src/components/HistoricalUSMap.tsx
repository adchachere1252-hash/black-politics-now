import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { STATE_CODES } from "@/data/atlasHistory";
import { loadTrueDistrictFrame, type TrueDistrictFeature, type TrueDistrictFrame } from "@/lib/atlasTrueDistrictLoader";

export type AtlasOverlayMode = "boundary" | "party" | "member";
export type AtlasFrameStatus = { congress: number; expectedStates: number; renderedStates: number; sourceGeometryCount: number; officialSeatCount: number; geometryExceptionStateCount: number; changedStateCount: number; overlayMode: AtlasOverlayMode; overlayCount: number; overlayState: "not-applicable" | "loading" | "ready" | "unavailable"; ready: boolean };

type OverlayMember = { name: string; party: "D" | "R" | "O"; partyCode: number; stateCode: string; district: number; bioguideId: string | null };
type OverlayResponse = { source: { name: string; url: string; memberDataUrl: string; citation: string }; members: Record<string, OverlayMember> };
type MapPath = { key: string; path: string; state: string; stateCode: string; district: string; districtNumber: number; member: OverlayMember | null };

function districtNumber(properties: Record<string, unknown>) {
  const value = Number(properties.district ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function districtLabel(properties: Record<string, unknown>) {
  const district = districtNumber(properties);
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

function memberFor(members: Record<string, OverlayMember>, stateCode: string, district: number) {
  return members[`${stateCode}-${district}`]
    ?? (district === 0 ? members[`${stateCode}-1`] ?? members[`${stateCode}-98`] ?? members[`${stateCode}-99`] : null)
    ?? null;
}

function colorFor(path: MapPath, mode: AtlasOverlayMode, selected: boolean) {
  if (selected) return "#e1ad53";
  if (mode === "party") return path.member?.party === "D" ? "#306bc7" : path.member?.party === "R" ? "#c4434b" : path.member?.party === "O" ? "#8157c6" : "#243449";
  if (mode === "member") return path.member ? "#4b7892" : "#243449";
  return "#243449";
}

function describeMode(mode: AtlasOverlayMode) {
  if (mode === "party") return "Verified House party";
  if (mode === "member") return "Verified House member";
  return "Validated historical districts";
}

export function HistoricalUSMap({ congress, selectedState, onStateSelect, overlayMode = "boundary", label, onFrameStatus }: { congress: number; selectedState?: string | null; onStateSelect: (stateCode: string) => void; overlayMode?: AtlasOverlayMode; label?: string; onFrameStatus?: (status: AtlasFrameStatus) => void }) {
  const [frame, setFrame] = useState<TrueDistrictFrame | null>(null);
  const [overlay, setOverlay] = useState<OverlayResponse | null>(null);
  const [displayedCongress, setDisplayedCongress] = useState<number | null>(null);
  const [loadingFrame, setLoadingFrame] = useState(true);
  const [error, setError] = useState(false);
  const [overlayError, setOverlayError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<{ x: number; y: number; path: MapPath } | null>(null);
  const dragOrigin = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingFrame(true);
    setError(false);
    const frameRequest = loadTrueDistrictFrame(congress, (input, init) => fetch(input, { ...init, signal: controller.signal }));
    const overlayRequest: Promise<OverlayResponse | null> = overlayMode === "boundary"
      ? Promise.resolve(null)
      : fetch(`/api/atlas/overlay/${congress}`, { signal: controller.signal })
          .then((response) => response.ok ? response.json() : Promise.reject(new Error("Unavailable")))
          .then((data) => data as OverlayResponse)
          .catch(() => null);

    Promise.all([frameRequest, overlayRequest])
      .then(([nextFrame, nextOverlay]) => {
        if (controller.signal.aborted) return;
        setFrame(nextFrame);
        setOverlay(nextOverlay);
        setDisplayedCongress(congress);
        setOverlayError(overlayMode !== "boundary" && !nextOverlay);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoadingFrame(false); });
    return () => controller.abort();
  }, [congress, overlayMode]);

  const map = useMemo(() => {
    if (!frame) return { paths: [] as MapPath[], sourceGeometryCount: 0, overlayCount: 0, renderedStates: 0 };
    const features = frame.features as Array<TrueDistrictFeature & { properties: Record<string, unknown> }>;
    const projection = geoAlbersUsa().fitSize([1000, 620], { type: "FeatureCollection", features } as any);
    const draw = geoPath(projection);
    const members = overlay?.members ?? {};
    const paths = features.map((feature, index) => {
      const state = String(feature.properties.state);
      const stateCode = STATE_CODES[state] || "";
      const district = districtNumber(feature.properties);
      return { path: removeProjectionClipRects(draw(feature as any) || ""), state, stateCode, district: districtLabel(feature.properties), districtNumber: district, key: `${state}-${district}-${index}`, member: memberFor(members, stateCode, district) };
    });
    return { paths, sourceGeometryCount: features.length, overlayCount: paths.filter((path) => Boolean(path.member)).length, renderedStates: new Set(paths.map((path) => path.state)).size };
  }, [frame, overlay]);

  useEffect(() => {
    const overlayState = overlayMode === "boundary" ? "not-applicable" : overlay ? "ready" : overlayError ? "unavailable" : "loading";
    onFrameStatus?.({ congress: displayedCongress ?? congress, expectedStates: 50, renderedStates: map.renderedStates, sourceGeometryCount: map.sourceGeometryCount, officialSeatCount: 435, geometryExceptionStateCount: 0, changedStateCount: 0, overlayMode, overlayCount: map.overlayCount, overlayState, ready: displayedCongress === congress && Boolean(frame) && !error && map.renderedStates === 50 && overlayState !== "loading" && overlayState !== "unavailable" });
  }, [congress, displayedCongress, error, frame, map.overlayCount, map.renderedStates, map.sourceGeometryCount, onFrameStatus, overlay, overlayError, overlayMode]);

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => { dragOrigin.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }; moved.current = false; event.currentTarget.setPointerCapture(event.pointerId); };
  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => { if (!dragOrigin.current) return; const dx = event.clientX - dragOrigin.current.x; const dy = event.clientY - dragOrigin.current.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true; setPan({ x: dragOrigin.current.panX + dx, y: dragOrigin.current.panY + dy }); };
  const handlePointerUp = () => { dragOrigin.current = null; };
  const visibleCongress = displayedCongress ?? congress;
  const mapAriaLabel = `${label ? `${label}: ` : ""}validated UCLA United States congressional district map for the ${visibleCongress}th Congress, ${describeMode(overlayMode)} overlay`;

  return <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[radial-gradient(circle_at_53%_30%,rgba(53,91,120,.28),transparent_36%),linear-gradient(150deg,#090f19,#101820_58%,#080b12)] shadow-[inset_0_0_54px_rgba(88,160,204,.1)]">
    <div className="absolute left-4 top-4 z-10 max-w-[72%] rounded border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[10px] text-slate-200 backdrop-blur-sm"><strong className="text-primary">{map.renderedStates}/50</strong> states loaded · <strong className="text-primary">435</strong> apportioned House seats · <span>{map.sourceGeometryCount || "—"} mapped district regions</span>{loadingFrame && frame && <span className="ml-2 text-primary">· Loading {congress}th frame</span>}</div>
    {label && <div className="absolute left-4 top-12 z-10 rounded border border-primary/25 bg-slate-950/70 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-primary backdrop-blur-sm">{label}</div>}
    <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded border border-white/10 bg-slate-950/70 backdrop-blur-sm"><button aria-label="Zoom out" type="button" onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(1))))} className="grid h-8 w-8 place-items-center text-slate-200 hover:bg-white/10"><Minus size={14} /></button><button aria-label="Reset map view" type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="grid h-8 w-8 place-items-center border-x border-white/10 text-slate-200 hover:bg-white/10"><RotateCcw size={13} /></button><button aria-label="Zoom in" type="button" onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))} className="grid h-8 w-8 place-items-center text-slate-200 hover:bg-white/10"><Plus size={14} /></button></div>
    <svg viewBox="0 0 1000 620" className="block aspect-[1.62/1] w-full touch-none select-none" role="img" aria-label={mapAriaLabel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={() => { handlePointerUp(); setHover(null); }} onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(0.8, Math.min(2.4, Number((value + (event.deltaY < 0 ? 0.15 : -0.15)).toFixed(2))))); }}>
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`} style={{ transformOrigin: "center" }}>{map.paths.map((path) => { const selected = path.stateCode === selectedState; const fill = colorFor(path, overlayMode, selected); const stroke = selected ? "#fff0c8" : overlayMode === "party" && path.member?.party === "D" ? "#8cc5ff" : overlayMode === "party" && path.member?.party === "R" ? "#ff9b9e" : "#71829a"; return <path key={path.key} d={path.path} tabIndex={0} role="button" aria-label={`${path.state}, ${path.district}${path.member ? `, ${path.member.name}, ${path.member.party === "D" ? "Democratic" : path.member.party === "R" ? "Republican" : "other party"}` : ""}`} onClick={() => { if (!moved.current && path.stateCode) onStateSelect(path.stateCode); }} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && path.stateCode) { event.preventDefault(); onStateSelect(path.stateCode); } }} onMouseMove={(event) => { const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect(); setHover({ x: event.clientX - rect.left, y: event.clientY - rect.top, path }); }} fill={fill} fillOpacity={selected ? 0.96 : path.member || overlayMode === "boundary" ? 0.84 : 0.76} stroke={stroke} strokeWidth={selected ? 1.15 : 0.48} vectorEffect="non-scaling-stroke" className="cursor-pointer outline-none transition-[fill,stroke] duration-150 hover:brightness-125 focus-visible:fill-primary" />; })}</g>
    </svg>
    {!frame && !error && <div className="absolute inset-0 grid place-items-center bg-slate-950/45 text-sm text-slate-200 backdrop-blur-[1px]"><span className="rounded-full border border-primary/30 bg-slate-950/80 px-4 py-2">Loading validated national district map…</span></div>}
    {error && <div className="absolute inset-0 grid place-items-center bg-slate-950/70 px-8 text-center text-sm text-slate-200"><div><p>The validated historical district frame is temporarily unavailable.</p><p className="mt-2 text-xs text-slate-300">Try another Congress or use the source-checked state archive below while this frame reloads.</p></div></div>}
    {hover && <div className="pointer-events-none absolute z-20 max-w-64 rounded border border-primary/30 bg-slate-950/95 px-2.5 py-2 text-[10px] text-slate-200 shadow-xl" style={{ left: Math.min(hover.x + 12, 760), top: Math.max(40, hover.y - 62) }}><strong className="block text-primary">{hover.path.state} · {hover.path.district}</strong>{hover.path.member ? <><span className="block font-semibold text-white">{hover.path.member.name}</span><span>{hover.path.member.party === "D" ? "Democratic Party" : hover.path.member.party === "R" ? "Republican Party" : `Other party · ICPSR ${hover.path.member.partyCode}`}</span></> : <span>{overlayMode === "boundary" ? "Validated UCLA congressional boundary geometry" : "No verified House member match in the source export"}</span>}</div>}
    <div className="absolute bottom-4 left-4 z-10 flex max-w-[92%] flex-wrap gap-x-3 gap-y-1 rounded border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[9px] text-slate-200 backdrop-blur-sm">{overlayMode === "boundary" ? <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#243449]" />Validated UCLA district geometry</span> : overlayMode === "party" ? <><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#306bc7]" />Democratic</span><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#c4434b]" />Republican</span><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#8157c6]" />Other</span></> : <><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm bg-[#4b7892]" />Named House member</span><span>Hover a district for verified roster context</span></>}<span className="basis-full text-slate-300/75">District geometry: UCLA Congressional District Maps. Seat total: Census apportionment. A single at-large region may represent more than one House seat.</span></div>
    {overlayMode !== "boundary" && overlayError && <div className="absolute bottom-10 right-4 z-10 rounded border border-amber-300/35 bg-slate-950/85 px-2 py-1 text-[9px] text-amber-100">Voteview overlay unavailable; validated district map remains visible.</div>}
  </div>;
}

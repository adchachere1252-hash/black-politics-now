import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { STATE_CODES } from "@/data/atlasHistory";
import { loadTrueDistrictFrame, type TrueDistrictFeature, type TrueDistrictFrame } from "@/lib/atlasTrueDistrictLoader";
import { getAtlasDistrictFill, getAtlasDistrictStroke, getAtlasMapLegend } from "@/lib/atlasMapPalette";
import { atlasDistrictLabel, atlasDistrictSelection, atlasPartyLabel, type AtlasDistrictMemberDetail, type AtlasDistrictSelection } from "@/lib/atlasDistrictDetail";

export type AtlasOverlayMode = "boundary" | "party" | "member";
export type AtlasFrameStatus = { congress: number; expectedStates: number; renderedStates: number; sourceGeometryCount: number; officialSeatCount: number; geometryExceptionStateCount: number; changedStateCount: number; overlayMode: AtlasOverlayMode; overlayCount: number; overlayState: "not-applicable" | "loading" | "ready" | "unavailable"; ready: boolean };

type OverlayMember = AtlasDistrictMemberDetail & { stateCode: string; district: number };
type OverlayResponse = { source: { name: string; url: string; memberDataUrl: string; citation: string }; members: Record<string, OverlayMember> };
type MapPath = { key: string; path: string; state: string; stateCode: string; district: string; districtNumber: number; sourceFeatureId: string; member: OverlayMember | null };

function districtNumber(properties: Record<string, unknown>) {
  const value = Number(properties.district ?? 0);
  return Number.isFinite(value) ? value : 0;
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

function describeMode(mode: AtlasOverlayMode) {
  if (mode === "party") return "Verified House party";
  if (mode === "member") return "Verified House member";
  return "Validated historical districts";
}

export function HistoricalUSMap({ congress, selectedState, onStateSelect, onDistrictSelect, overlayMode = "party", label, compact = false, onFrameStatus }: { congress: number; selectedState?: string | null; onStateSelect: (stateCode: string) => void; onDistrictSelect?: (selection: AtlasDistrictSelection) => void; overlayMode?: AtlasOverlayMode; label?: string; compact?: boolean; onFrameStatus?: (status: AtlasFrameStatus) => void }) {
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
      return { path: removeProjectionClipRects(draw(feature as any) || ""), state, stateCode, district: atlasDistrictLabel(district), districtNumber: district, sourceFeatureId: String(feature.properties.id ?? ""), key: `${state}-${district}-${index}`, member: memberFor(members, stateCode, district) };
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
  const legend = getAtlasMapLegend(overlayMode);
  const selectDistrict = (path: MapPath) => {
    if (!path.stateCode) return;
    onStateSelect(path.stateCode);
    onDistrictSelect?.(atlasDistrictSelection({
      congress: visibleCongress,
      state: path.state,
      stateCode: path.stateCode,
      districtNumber: path.districtNumber,
      sourceFeatureId: path.sourceFeatureId,
      member: path.member,
    }));
  };

  return <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-[radial-gradient(circle_at_53%_30%,rgba(225,173,83,.13),transparent_42%),var(--background)] shadow-[inset_0_0_54px_rgba(225,173,83,.08)]">
    <div className="absolute left-4 top-4 z-10 max-w-[74%] rounded-lg border border-border bg-card/95 px-3 py-2 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm"><span className="font-semibold text-primary">{map.renderedStates}/50 states</span><span className="px-1.5 text-border">•</span><span><strong className="text-foreground">435</strong> apportioned House seats</span><span className="px-1.5 text-border">•</span><span>{map.sourceGeometryCount || "—"} UCLA regions</span>{loadingFrame && frame && <span className="ml-1.5 font-semibold text-primary">· preparing {congress}th</span>}</div>
    {label && <div className="absolute left-4 top-12 z-10 rounded border border-primary/25 bg-card/95 px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-primary backdrop-blur-sm">{label}</div>}
    <div className="absolute right-4 top-4 z-10 flex overflow-hidden rounded border border-border bg-card/95 backdrop-blur-sm"><button aria-label="Zoom out" type="button" onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.2).toFixed(1))))} className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"><Minus size={14} /></button><button aria-label="Reset map view" type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="grid h-8 w-8 place-items-center border-x border-border text-muted-foreground hover:bg-muted hover:text-foreground"><RotateCcw size={13} /></button><button aria-label="Zoom in" type="button" onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.2).toFixed(1))))} className="grid h-8 w-8 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"><Plus size={14} /></button></div>
    <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet" className={`block w-full touch-none select-none ${compact ? "h-[clamp(250px,32vw,420px)]" : "h-[clamp(300px,55vw,620px)]"}`} role="img" aria-label={mapAriaLabel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={() => { handlePointerUp(); setHover(null); }} onWheel={(event) => { event.preventDefault(); setZoom((value) => Math.max(0.8, Math.min(2.4, Number((value + (event.deltaY < 0 ? 0.15 : -0.15)).toFixed(2))))); }}>
      <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>{map.paths.map((path) => { const selected = path.stateCode === selectedState; const fill = getAtlasDistrictFill({ mode: overlayMode, party: path.member?.party, hasMember: Boolean(path.member), selected: selected && overlayMode !== "party" }); const stroke = getAtlasDistrictStroke({ mode: overlayMode, party: path.member?.party, selected }); return <path key={path.key} d={path.path} tabIndex={0} role="button" aria-label={`${path.state}, ${path.district}${path.member ? `, ${path.member.name}, ${path.member.party === "D" ? "Democratic" : path.member.party === "R" ? "Republican" : "other party"}` : ""}. Select for verified district detail.`} onClick={() => { if (!moved.current) selectDistrict(path); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectDistrict(path); } }} onMouseMove={(event) => { const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect(); setHover({ x: event.clientX - rect.left, y: event.clientY - rect.top, path }); }} fill={fill} fillOpacity={selected ? 0.96 : path.member || overlayMode === "boundary" ? 0.9 : 0.8} stroke={stroke} strokeWidth={selected ? 1.9 : 0.6} vectorEffect="non-scaling-stroke" className="cursor-pointer outline-none transition-[fill,stroke] duration-150 hover:brightness-110 focus-visible:fill-primary" />; })}</g>
    </svg>
    {!frame && !error && <div className="absolute inset-0 grid place-items-center bg-background/60 text-sm text-foreground backdrop-blur-[1px]"><span className="rounded-full border border-primary/30 bg-card px-4 py-2">Loading validated national district map…</span></div>}
    {error && <div className="absolute inset-0 grid place-items-center bg-background/85 px-8 text-center text-sm text-foreground"><div><p>The validated historical district frame is temporarily unavailable.</p><p className="mt-2 text-xs text-muted-foreground">Try another Congress or use the source-checked state archive below while this frame reloads.</p></div></div>}
    {hover && <div className="pointer-events-none absolute z-20 max-w-72 rounded-xl border border-primary/30 bg-popover px-3.5 py-3 text-xs text-popover-foreground shadow-2xl" style={{ left: Math.min(hover.x + 14, 700), top: Math.max(46, hover.y - 88) }}><p className="text-[10px] font-bold uppercase tracking-[.13em] text-primary">{hover.path.state} · {hover.path.district}</p>{hover.path.member ? <><p className="mt-1 text-sm font-bold text-foreground">{hover.path.member.name}</p><p className="mt-1 text-muted-foreground">{atlasPartyLabel(hover.path.member.party, hover.path.member.partyCode)}</p><p className="mt-2 text-[10px] text-muted-foreground">Verified roster overlay · click for source-linked district detail</p></> : <><p className="mt-1.5 font-medium text-foreground">{overlayMode === "boundary" ? "Validated UCLA congressional boundary" : "No verified House member match"}</p><p className="mt-2 text-[10px] text-muted-foreground">Click for the district identifier and source context</p></>}</div>}
    <div className="absolute bottom-4 left-4 z-10 flex max-w-[92%] flex-wrap gap-x-4 gap-y-1.5 rounded-lg border border-border bg-card/95 px-3 py-2 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm">{legend.map((item) => <span key={item.label} className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm ring-1 ring-black/10" style={{ backgroundColor: item.color }} />{item.label}</span>)}<span className="basis-full text-muted-foreground/85">Click a district for UCLA geometry and verified roster detail. A single at-large region may represent more than one House seat.</span></div>
    {overlayMode !== "boundary" && overlayError && <div className="absolute bottom-10 right-4 z-10 rounded border border-amber-300/35 bg-card/95 px-2 py-1 text-[9px] text-amber-800 dark:text-amber-100">Voteview overlay unavailable; validated district map remains visible.</div>}
  </div>;
}

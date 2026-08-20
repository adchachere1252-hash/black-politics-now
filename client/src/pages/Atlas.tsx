import {
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns3,
  ExternalLink,
  Gavel,
  Layers3,
  Link2,
  MapPinned,
  Pause,
  Play,
  Scale,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { APPORTIONMENT_HISTORY, APPORTIONMENT_YEARS, STATE_CODES } from "@/data/atlasHistory";
import { LEWIS_MANIFEST } from "@/data/atlasBoundaryManifest";
import { ATLAS_VRA_TIMELINE, sourceCheckedBoundaryNote } from "@/data/atlasVraTimeline";
import { AtlasBoundaryPreview } from "@/components/AtlasBoundaryPreview";
import { HistoricalUSMap, type AtlasFrameStatus, type AtlasOverlayMode } from "@/components/HistoricalUSMap";
import { nextPlaybackCongress } from "@/lib/atlasPlayback";
import { buildAtlasComparisonUrl } from "@/lib/atlasComparisonShare";
import { atlasPartyLabel, type AtlasDistrictSelection } from "@/lib/atlasDistrictDetail";

const CENSUS_APPORTIONMENT_URL = "https://www.census.gov/data/tables/time-series/dec/apportionment-data-text.html";
const LEWIS_REPOSITORY_URL = "https://github.com/JeffreyBLewis/congressional-district-boundaries";
const UCLA_CDMAPS_URL = "https://cdmaps.polisci.ucla.edu";
const VOTEVIEW_DATA_URL = "https://voteview.com/data";
const CONGRESSES = Array.from({ length: 31 }, (_, index) => 89 + index);
const DECADE_JUMPS = [
  { congress: 89, label: "1965 · 89th Congress" },
  { congress: 94, label: "1975 · 94th Congress" },
  { congress: 99, label: "1985 · 99th Congress" },
  { congress: 104, label: "1995 · 104th Congress" },
  { congress: 109, label: "2005 · 109th Congress" },
  { congress: 114, label: "2015 · 114th Congress" },
  { congress: 119, label: "2025 · 119th Congress" },
];
const PLAYBACK_SPEEDS = {
  slow: { label: "Slow", duration: 6500 },
  standard: { label: "Standard", duration: 4500 },
  fast: { label: "Fast", duration: 2750 },
} as const;

function congressYears(congress: number) {
  return [1963 + (congress - 88) * 2, 1964 + (congress - 88) * 2] as const;
}

function historyIndexForCongress(congress: number) {
  if (congress <= 92) return 0;
  if (congress <= 97) return 1;
  if (congress <= 102) return 2;
  if (congress <= 107) return 3;
  if (congress <= 112) return 4;
  if (congress <= 117) return 5;
  return 6;
}

export default function Atlas() {
  const [selectedCode, setSelectedCode] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const code = new URLSearchParams(window.location.search).get("state")?.toUpperCase();
    return code && /^[A-Z]{2}$/.test(code) ? code : null;
  });
  const [selectedCongress, setSelectedCongress] = useState(() => {
    if (typeof window === "undefined") return 119;
    const value = Number(new URLSearchParams(window.location.search).get("congress"));
    return Number.isInteger(value) && value >= 89 && value <= 119 ? value : 119;
  });
  const [stateQuery, setStateQuery] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<keyof typeof PLAYBACK_SPEEDS>("standard");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "unavailable">("idle");
  const [frameStatus, setFrameStatus] = useState<AtlasFrameStatus | null>(null);
  const [compareMode, setCompareMode] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("compare") === "1");
  const [comparisonCongress, setComparisonCongress] = useState(() => {
    if (typeof window === "undefined") return 89;
    const value = Number(new URLSearchParams(window.location.search).get("compareCongress"));
    return Number.isInteger(value) && value >= 89 && value <= 119 ? value : 89;
  });
  const [overlayMode, setOverlayMode] = useState<AtlasOverlayMode>(() => {
    if (typeof window === "undefined") return "party";
    const value = new URLSearchParams(window.location.search).get("overlay");
    return value === "boundary" || value === "member" ? value : "party";
  });
  const [selectedDistrict, setSelectedDistrict] = useState<AtlasDistrictSelection | null>(null);
  const [mobileStateDetailOpen, setMobileStateDetailOpen] = useState(false);

  const historicalStates = useMemo(
    () => Object.keys(APPORTIONMENT_HISTORY).sort().map((stateName) => ({ stateCode: STATE_CODES[stateName], stateName })),
    [],
  );
  const selected = useMemo(
    () => historicalStates.find((state) => state.stateCode === selectedCode) ?? historicalStates[0],
    [historicalStates, selectedCode],
  );
  const history = selected ? APPORTIONMENT_HISTORY[selected.stateName] ?? [1, 1, 1, 1, 1, 1, 1] : [];
  const boundaryEras = selected ? LEWIS_MANIFEST[selected.stateName] ?? [] : [];
  const selectedBoundaryEra = boundaryEras.find((era) => selectedCongress >= era.start && selectedCongress <= era.end);
  const selectedSeatCount = history[historyIndexForCongress(selectedCongress)] ?? 1;
  const priorSeatCount = history[historyIndexForCongress(Math.max(89, selectedCongress - 1))] ?? selectedSeatCount;
  const displayedCongress = frameStatus?.congress ?? selectedCongress;
  const isFrameTransitioning = displayedCongress !== selectedCongress;
  const visibleFrameNumber = CONGRESSES.indexOf(displayedCongress) + 1;
  const queuedFrameNumber = CONGRESSES.indexOf(selectedCongress) + 1;
  const visibleFrameProgress = Math.max(0, (visibleFrameNumber / CONGRESSES.length) * 100);
  const legalMarkers = ATLAS_VRA_TIMELINE.map((milestone) => ({
    ...milestone,
    progress: ((milestone.congress - CONGRESSES[0]) / (CONGRESSES.at(-1)! - CONGRESSES[0])) * 100,
  }));
  const seatChange = selectedSeatCount - priorSeatCount;
  const archiveNote = selected ? sourceCheckedBoundaryNote(selected.stateName, selectedCongress, selectedBoundaryEra?.name) : null;
  const boundaryStates = Object.keys(LEWIS_MANIFEST).length;
  const visibleStates = historicalStates.filter((state) => (
    state.stateName.toLowerCase().includes(stateQuery.trim().toLowerCase())
    || state.stateCode.toLowerCase().includes(stateQuery.trim().toLowerCase())
  ));

  const selectAtlasState = (stateCode: string) => {
    setSelectedCode(stateCode);
    setSelectedDistrict(null);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) setMobileStateDetailOpen(true);
  };

  const selectAtlasDistrict = (district: AtlasDistrictSelection) => {
    setSelectedCode(district.stateCode);
    setSelectedCongress(district.congress);
    setSelectedDistrict(district);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) setMobileStateDetailOpen(true);
  };

  useEffect(() => {
    if (selectedDistrict && selectedDistrict.congress !== selectedCongress) setSelectedDistrict(null);
  }, [selectedCongress, selectedDistrict]);

  useEffect(() => {
    if (!selected?.stateCode || typeof window === "undefined") return;
    const parameters = new URLSearchParams(window.location.search);
    parameters.set("state", selected.stateCode);
    parameters.set("congress", String(selectedCongress));
    if (compareMode) {
      parameters.set("compare", "1");
      parameters.set("compareCongress", String(comparisonCongress));
    } else {
      parameters.delete("compare");
      parameters.delete("compareCongress");
    }
    if (overlayMode !== "boundary") parameters.set("overlay", overlayMode);
    else parameters.delete("overlay");
    window.history.replaceState(null, "", `${window.location.pathname}?${parameters.toString()}`);
  }, [selected?.stateCode, selectedCongress, compareMode, comparisonCongress, overlayMode]);

  useEffect(() => {
    if (!isPlaying || !frameStatus?.ready || frameStatus.congress !== selectedCongress) return;
    if (selectedCongress >= 119) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setSelectedCongress((congress) => nextPlaybackCongress(congress)),
      PLAYBACK_SPEEDS[playbackSpeed].duration,
    );
    return () => window.clearTimeout(timer);
  }, [frameStatus, isPlaying, playbackSpeed, selectedCongress]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, a")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIsPlaying(false);
        setSelectedCongress((value) => Math.max(89, value - 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIsPlaying(false);
        setSelectedCongress((value) => Math.min(119, value + 1));
      }
      if (event.key.toLowerCase() === "s" && selected?.stateCode) {
        event.preventDefault();
        setMobileStateDetailOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected?.stateCode]);

  const copyComparisonLink = async () => {
    if (typeof window === "undefined") return;
    const shareUrl = buildAtlasComparisonUrl(window.location.origin, window.location.pathname, {
      stateCode: selected?.stateCode || "AL",
      congress: selectedCongress,
      comparisonCongress,
      overlayMode,
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 2400);
    } catch {
      setShareStatus("unavailable");
    }
  };

  const compareSelectedState = () => {
    const comparison = selectedCongress > 89 ? Math.max(89, selectedCongress - 5) : Math.min(119, selectedCongress + 5);
    setComparisonCongress(comparison);
    setCompareMode(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-[radial-gradient(circle_at_85%_0%,rgba(212,165,82,.14),transparent_33%)]">
        <div className="container py-6 sm:py-8">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.28em]">50-state archived congressional geography · Voting Rights Act era forward</p>
          <h1 className="font-display mt-2 text-4xl font-bold sm:text-5xl">Historical Atlas</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">Track every state in a single national frame from the 89th Congress (1965) through the 119th Congress. The default party layer makes verified Democratic blue, Republican red, and other/independent purple changes visible across time.</p>
          <div className="mt-5 grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-5">
            <Metric value={historicalStates.length} label="State histories" icon={MapPinned} />
            <Metric value={boundaryStates} label="Boundary archives" icon={Layers3} />
            <Metric value="31" label="Congress frames" icon={Scale} />
            <Metric value="89th" label="VRA-era start" icon={Gavel} />
            <Metric value="1965–2025" label="Seat history" icon={CalendarDays} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <a href={CENSUS_APPORTIONMENT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">Census apportionment tables <ExternalLink size={12} /></a>
            <a href={UCLA_CDMAPS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">UCLA Congressional District Maps <ExternalLink size={12} /></a>
            <a href={LEWIS_REPOSITORY_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline underline-offset-4">UCLA geometry repository <ExternalLink size={12} /></a>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-[.18em]">VRA-era national time travel · all 50 states</p>
              <h2 className="font-display mt-2 text-2xl font-bold">Compare House party transitions across time</h2>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Every frame is a validated 50-state UCLA district map. The default party view uses verified House records: blue for Democratic, red for Republican, and purple for other or independent representation.</p>
            </div>
            <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-primary">{isFrameTransitioning ? "Visible map" : "Party transition view"}</p>
              <p className="font-display mt-1 text-2xl font-bold">{displayedCongress}th Congress · {congressYears(displayedCongress)[0]}–{congressYears(displayedCongress)[1]}</p>
              {isFrameTransitioning && <p className="mt-1 text-[10px] text-muted-foreground">Preparing {selectedCongress}th Congress</p>}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-2">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setCompareMode((value) => {
                const next = !value;
                if (next && comparisonCongress === selectedCongress) setComparisonCongress(Math.max(89, selectedCongress - 30));
                return next;
              })} className={`h-9 rounded-md border px-3 text-xs font-semibold transition-colors ${compareMode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>{compareMode ? "Exit comparison" : "Compare two Congresses"}</button>
              {!compareMode && <button type="button" onClick={compareSelectedState} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/35 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"><Columns3 size={14} /> Compare {selected?.stateName ?? "selected state"}</button>}
              {compareMode && <button type="button" onClick={copyComparisonLink} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/35 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">{shareStatus === "copied" ? <Check size={14} /> : <Link2 size={14} />} {shareStatus === "copied" ? "Link copied" : "Share comparison"}</button>}
              <div className="flex rounded-md border border-border p-0.5">
                {(["boundary", "party", "member"] as AtlasOverlayMode[]).map((mode) => <button type="button" key={mode} onClick={() => setOverlayMode(mode)} className={`h-7 rounded px-2 text-[10px] font-semibold transition-colors ${overlayMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{mode === "boundary" ? "Boundaries" : mode === "party" ? "Party" : "Members"}</button>)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {shareStatus === "unavailable" && <span className="text-[10px] text-muted-foreground">Copy is unavailable in this browser.</span>}
              <a href={overlayMode === "boundary" ? LEWIS_REPOSITORY_URL : VOTEVIEW_DATA_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary underline underline-offset-4">{overlayMode === "boundary" ? "UCLA boundary archive" : "Voteview House data"} <ExternalLink size={12} /></a>
            </div>
          </div>

          {!compareMode && <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background p-2">
              <div className="flex flex-wrap items-center gap-1">
                <button type="button" aria-label="Previous Congress" onClick={() => { setIsPlaying(false); setSelectedCongress((congress) => Math.max(89, congress - 1)); }} disabled={selectedCongress === 89} className="grid h-9 w-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => { if (!isPlaying && selectedCongress >= 119) setSelectedCongress(89); setIsPlaying((value) => !value); }} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">{isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}{isPlaying ? "Pause" : "Play all-state history"}</button>
                <button type="button" aria-label="Next Congress" onClick={() => { setIsPlaying(false); setSelectedCongress((congress) => Math.min(119, congress + 1)); }} disabled={selectedCongress === 119} className="grid h-9 w-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight size={18} /></button>
                <label className="ml-1 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">Speed<select aria-label="Atlas playback speed" value={playbackSpeed} onChange={(event) => setPlaybackSpeed(event.target.value as keyof typeof PLAYBACK_SPEEDS)} className="h-8 rounded border border-border bg-card px-1.5 text-[10px] text-foreground"><option value="slow">Slow · 6.5s</option><option value="standard">Standard · 4.5s</option><option value="fast">Fast · 2.75s</option></select></label>
                <label className="ml-1 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">Jump<select aria-label="Jump to an Atlas decade" defaultValue="" onChange={(event) => { const congress = Number(event.target.value); if (congress) { setIsPlaying(false); setSelectedCongress(congress); event.currentTarget.value = ""; } }} className="h-8 rounded border border-border bg-card px-1.5 text-[10px] text-foreground"><option value="" disabled>Choose decade</option>{DECADE_JUMPS.map((jump) => <option value={jump.congress} key={jump.congress}>{jump.label}</option>)}</select></label>
              </div>
              <span className="text-xs text-muted-foreground">{isFrameTransitioning ? `Keeping the ${displayedCongress}th Congress visible while ${selectedCongress}th loads.` : `Playback advances after the next validated 50-state map and overlay are ready · ${PLAYBACK_SPEEDS[playbackSpeed].label} pace.`}</span>
            </div>
            <input aria-label="Historical map Congress" type="range" min="89" max="119" step="1" value={selectedCongress} onChange={(event) => { setIsPlaying(false); setSelectedCongress(Number(event.target.value)); }} className="mt-5 w-full accent-primary" />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>89th · 1965</span><span>104th · 1995</span><span>119th · 2025</span></div>
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3" aria-live="polite">
              <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-[9px] font-semibold uppercase tracking-[.13em] text-primary">All-state playback progress</p><p className="mt-1 text-sm font-semibold">Frame {visibleFrameNumber} of {CONGRESSES.length} · {displayedCongress}th Congress</p></div><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${isFrameTransitioning ? "border-primary/35 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground"}`}>{isFrameTransitioning ? `Queued: frame ${queuedFrameNumber}` : frameStatus?.ready ? "Frame complete" : "Loading frame"}</span></div>
              <div className="relative mt-3 h-5"><div className="absolute inset-x-0 top-1.5 h-2 overflow-hidden rounded-full bg-background/90 ring-1 ring-inset ring-border" role="progressbar" aria-label="Historical Atlas playback progress" aria-valuemin={1} aria-valuemax={CONGRESSES.length} aria-valuenow={visibleFrameNumber} aria-valuetext={`Frame ${visibleFrameNumber} of ${CONGRESSES.length}, ${displayedCongress}th Congress`}><div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${visibleFrameProgress}%` }} /></div>{legalMarkers.map((marker) => <button type="button" key={marker.year} aria-label={`Jump to ${marker.year}: ${marker.title}`} title={`${marker.year}: ${marker.title}`} onClick={() => { setIsPlaying(false); setSelectedCongress(marker.congress); }} className="absolute top-0 grid h-5 w-5 -translate-x-1/2 place-items-center rounded-full border border-background bg-primary text-[8px] font-bold text-primary-foreground shadow-sm transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" style={{ left: `${marker.progress}%` }}>{String(marker.year).slice(-2)}</button>)}</div>
              <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>89th · 1965</span><span>{visibleFrameNumber}/{CONGRESSES.length} visible · markers jump to legal context</span><span>119th · 2025</span></div>
            </div>
            <div className="mt-3 grid gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs sm:grid-cols-4"><div><span className="block text-[9px] font-semibold uppercase tracking-[.13em] text-primary">Visible frame</span><strong>{displayedCongress}th · {congressYears(displayedCongress)[0]}</strong></div><div><span className="block text-[9px] font-semibold uppercase tracking-[.13em] text-primary">State coverage</span><strong>{frameStatus ? `${frameStatus.renderedStates}/${frameStatus.expectedStates} states` : "Loading"}</strong></div><div><span className="block text-[9px] font-semibold uppercase tracking-[.13em] text-primary">Mapped regions</span><strong>{frameStatus ? `${frameStatus.sourceGeometryCount} UCLA regions` : "Loading"}</strong></div><div><span className="block text-[9px] font-semibold uppercase tracking-[.13em] text-primary">Data layer</span><strong>{overlayMode === "boundary" ? "Validated UCLA districts" : frameStatus?.overlayState === "ready" ? `${frameStatus.overlayCount} verified records` : frameStatus?.overlayState === "unavailable" ? "Source unavailable" : "Loading verified overlay"}</strong></div></div>
            <div className="mt-3 text-xs text-muted-foreground">Every frame begins with all 50 states and is validated against the corresponding Census apportionment series. A mapped region can be at-large and may represent more than one House seat; Census remains the official seat-total record.</div>
            <div className="mt-5"><HistoricalUSMap congress={selectedCongress} selectedState={selected?.stateCode} onStateSelect={selectAtlasState} onDistrictSelect={selectAtlasDistrict} overlayMode={overlayMode} onFrameStatus={setFrameStatus} /></div>
          </>}

          {compareMode && <div className="mt-5 grid gap-5 xl:grid-cols-2"><CongressComparisonPanel label="Comparison A" congress={comparisonCongress} onCongressChange={setComparisonCongress} selectedState={selected?.stateCode} onStateSelect={selectAtlasState} onDistrictSelect={selectAtlasDistrict} overlayMode={overlayMode} /><CongressComparisonPanel label="Comparison B" congress={selectedCongress} onCongressChange={setSelectedCongress} selectedState={selected?.stateCode} onStateSelect={selectAtlasState} onDistrictSelect={selectAtlasDistrict} overlayMode={overlayMode} /></div>}
          {selectedDistrict && <DistrictDetailPanel district={selectedDistrict} boundaryEra={selectedBoundaryEra?.name} stateSeatCount={selectedSeatCount} onClose={() => setSelectedDistrict(null)} />}
          <div className="mt-4 grid gap-3 sm:grid-cols-3"><AtlasLens title={overlayMode === "boundary" ? "Map basis" : "Verified overlay"} detail={overlayMode === "boundary" ? "The national frame uses UCLA’s Congress-specific historical district geometry. Census apportionment is retained as the official seat-count standard." : overlayMode === "party" ? "Voteview party code 100 is Democratic blue, 200 is Republican red, and other codes remain purple rather than being recoded." : "Voteview matches House member names, party codes, districts, and Bioguide identifiers to the selected Congress when a verified roster match is available."} /><AtlasLens title="Compare transitions" detail="Choose two Congresses to place the same verified party palette side by side. The map shows records; it does not infer why a district changed party." /><AtlasLens title="Selected state" detail={selected ? `${selected.stateName} has ${selectedSeatCount} House seat${selectedSeatCount === 1 ? "" : "s"} in this period${seatChange ? ` (${seatChange > 0 ? "+" : ""}${seatChange} at the applicable apportionment cycle)` : ""}.` : "Select any state or district to open its detailed historical record."} /></div>
        </div>
      </section>

      <section className="container pb-8"><VraTimeline onSelectCongress={(congress) => { setIsPlaying(false); setSelectedCongress(congress); }} /></section>

      <section className="container grid gap-6 pb-8 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-border bg-card"><div className="border-b border-border p-4"><p className="font-semibold">All 50 state histories</p><p className="mt-1 text-xs text-muted-foreground">The full apportionment and boundary-era archive from the Voting Rights Act era forward.</p><label className="relative mt-3 block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={stateQuery} onChange={(event) => setStateQuery(event.target.value)} placeholder="Find a state" className="h-9 w-full rounded-md border border-border bg-background pl-8 pr-2 text-sm" /></label></div><div className="max-h-[580px] divide-y divide-border overflow-y-auto">{visibleStates.map((state) => <button type="button" onClick={() => selectAtlasState(state.stateCode)} key={state.stateCode} className={`flex w-full items-center justify-between p-3 text-left transition-colors ${selected?.stateCode === state.stateCode ? "bg-primary/10 text-primary" : "hover:bg-muted/60"}`}><span className="text-sm font-medium">{state.stateName}</span><span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">History</span></button>)}{visibleStates.length === 0 && <p className="p-4 text-sm text-muted-foreground">No matching state history.</p>}</div></aside>

        {selected && <main className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:justify-between"><div><p className="text-primary text-xs uppercase tracking-[.18em]">{selected.stateCode} · historical record</p><h2 className="font-display mt-2 text-3xl font-bold">{selected.stateName}</h2><p className="mt-2 max-w-2xl text-muted-foreground">A source-backed congressional apportionment and boundary-era record from the Voting Rights Act era forward.</p></div><div className="h-fit rounded-xl border border-border bg-background p-3 text-sm"><span className="block text-xs text-muted-foreground">Coverage</span><strong>89th–119th Congress</strong></div></div><div className="mt-6 grid gap-3 md:grid-cols-4"><Info label="Source method" value="Congressional apportionment" icon={Scale} /><Info label="Map scope" value="89th–119th Congress" icon={Building2} /><Info label="Seat record" value="Decennial cycles" icon={Layers3} /><Info label="Boundary eras" value={boundaryEras.length ? `${boundaryEras.length} repository files` : "Not catalogued"} icon={MapPinned} /></div></div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-display text-xl font-bold">Apportionment history</h3><p className="mt-1 text-sm text-muted-foreground">House seats following each decennial redistricting cycle, retained from the original Atlas coverage.</p></div><span className="font-display text-2xl font-bold text-primary">{history[history.length - 1]}</span></div><SeatChart values={history} /><div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground">{APPORTIONMENT_YEARS.map((year) => <span key={year}>{year}</span>)}</div></div>
          <AtlasBoundaryPreview stateName={selected.stateName} congress={selectedCongress} filename={selectedBoundaryEra?.name} seats={selectedSeatCount} />
          <div className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-display text-xl font-bold">District index for this Congress</h3><p className="mt-1 text-sm text-muted-foreground">A compact index of the {selectedSeatCount} apportioned House seat{selectedSeatCount === 1 ? "" : "s"} in this period—not a substitute for the legal district boundary file.</p><div className="mt-5 grid grid-cols-6 gap-2 sm:grid-cols-8">{Array.from({ length: selectedSeatCount || 1 }).map((_, index) => <div key={index} className="grid aspect-square place-items-center rounded-md border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">{selectedSeatCount === 1 ? "AL" : index + 1}</div>)}</div></div><div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-display text-xl font-bold">Source-checked archive context</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{archiveNote || "No repository boundary file is currently identified for this selection."}</p><p className="mt-4 text-xs font-semibold uppercase tracking-[.12em] text-primary">Editorial status: no editor-approved interpretation published</p><p className="mt-2 text-sm text-muted-foreground">The Atlas keeps source-checked archive context separate from editor-approved historical interpretation. A published editorial note requires a named editor, a cited source, and an approval record.</p></div></div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-display text-xl font-bold">Boundary-era archive</h3><p className="mt-1 text-sm text-muted-foreground">Original repository district-file eras for {selected.stateName}, indexed by Congress. Select an era to update the boundary viewer.</p></div><span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{boundaryEras.length} eras</span></div>{boundaryEras.length ? <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{boundaryEras.map((era) => <button type="button" onClick={() => setSelectedCongress(era.end)} key={era.name} className={`rounded-lg border p-3 text-left transition-colors ${selectedCongress >= era.start && selectedCongress <= era.end ? "border-primary/60 bg-primary/10" : "border-border bg-background hover:border-primary/35"}`}><p className="text-sm font-medium">{era.start}th–{era.end}th Congress</p><p className="mt-1 break-all text-xs text-muted-foreground">{era.name}</p></button>)}</div> : <p className="mt-5 text-sm text-muted-foreground">No boundary-era manifest entry is currently available for this state.</p>}</div>
        </main>}
      </section>

      {mobileStateDetailOpen && selected && <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 p-3 sm:hidden" role="dialog" aria-modal="true" aria-label={`${selected.stateName} historical detail`} onClick={() => setMobileStateDetailOpen(false)}><div className="w-full rounded-2xl border border-primary/30 bg-card p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-primary">{selectedDistrict ? "Selected district · verified detail" : "Selected state · historical detail"}</p><h2 className="mt-1 text-2xl font-bold">{selectedDistrict ? `${selectedDistrict.state} · ${selectedDistrict.districtLabel}` : selected.stateName}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedDistrict?.congress ?? selectedCongress}th Congress · {congressYears(selectedDistrict?.congress ?? selectedCongress)[0]}–{congressYears(selectedDistrict?.congress ?? selectedCongress)[1]} · {selectedSeatCount} House seat{selectedSeatCount === 1 ? "" : "s"}</p></div><button type="button" onClick={() => setMobileStateDetailOpen(false)} className="rounded-md border border-border px-3 py-2 text-xs font-semibold">Close</button></div>{selectedDistrict?.member && <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3"><span className="block text-[9px] font-bold uppercase tracking-[.12em] text-primary">Verified House roster</span><strong className="mt-1 block text-foreground">{selectedDistrict.member.name}</strong><span className="mt-1 block text-xs text-muted-foreground">{atlasPartyLabel(selectedDistrict.member.party, selectedDistrict.member.partyCode)}</span></div>}<div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg border border-border bg-background p-3"><span className="block text-[9px] font-bold uppercase tracking-[.12em] text-primary">Boundary era</span><strong className="mt-1 block break-all text-foreground">{selectedBoundaryEra?.name || "Not catalogued"}</strong></div><div className="rounded-lg border border-border bg-background p-3"><span className="block text-[9px] font-bold uppercase tracking-[.12em] text-primary">UCLA feature ID</span><strong className="mt-1 block break-all text-foreground">{selectedDistrict?.sourceFeatureId || "Open map to select"}</strong></div></div><p className="mt-4 text-xs leading-5 text-muted-foreground">{archiveNote || "No repository boundary file is currently identified for this selection."}</p><button type="button" onClick={() => setMobileStateDetailOpen(false)} className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Return to map</button></div></div>}
    </div>
  );
}

function CongressComparisonPanel({ label, congress, onCongressChange, selectedState, onStateSelect, onDistrictSelect, overlayMode }: { label: string; congress: number; onCongressChange: (congress: number) => void; selectedState?: string | null; onStateSelect: (stateCode: string) => void; onDistrictSelect: (selection: AtlasDistrictSelection) => void; overlayMode: AtlasOverlayMode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameStatus, setFrameStatus] = useState<AtlasFrameStatus | null>(null);
  useEffect(() => {
    if (!isPlaying || !frameStatus?.ready || frameStatus.congress !== congress) return;
    if (congress >= 119) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => onCongressChange(nextPlaybackCongress(congress)), PLAYBACK_SPEEDS.standard.duration);
    return () => window.clearTimeout(timer);
  }, [congress, frameStatus, isPlaying, onCongressChange]);
  return <div className="rounded-xl border border-border bg-background p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-primary">{label}</p><p className="font-display mt-1 text-lg font-bold">{congress}th Congress · {congressYears(congress)[0]}–{congressYears(congress)[1]}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => { if (!isPlaying && congress >= 119) onCongressChange(89); setIsPlaying((value) => !value); }} className="inline-flex h-9 items-center gap-1 rounded-md border border-primary/35 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10">{isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}{isPlaying ? "Pause" : "Play"}</button><select aria-label={`${label} Congress`} value={congress} onChange={(event) => { setIsPlaying(false); onCongressChange(Number(event.target.value)); }} className="h-9 rounded-md border border-border bg-card px-2 text-xs font-semibold text-foreground">{CONGRESSES.map((value) => <option value={value} key={value}>{value}th · {congressYears(value)[0]}</option>)}</select></div></div><input aria-label={`${label} historical map Congress`} type="range" min="89" max="119" step="1" value={congress} onChange={(event) => { setIsPlaying(false); onCongressChange(Number(event.target.value)); }} className="mt-4 w-full accent-primary" /><div className="mt-4"><HistoricalUSMap congress={congress} selectedState={selectedState} onStateSelect={onStateSelect} onDistrictSelect={onDistrictSelect} overlayMode={overlayMode} label={label} compact onFrameStatus={setFrameStatus} /></div></div>;
}

function DistrictDetailPanel({ district, boundaryEra, stateSeatCount, onClose }: { district: AtlasDistrictSelection; boundaryEra?: string; stateSeatCount: number; onClose: () => void }) {
  const [startYear, endYear] = congressYears(district.congress);
  return <section className="mt-5 rounded-2xl border border-primary/30 bg-[radial-gradient(circle_at_95%_10%,rgba(212,165,82,.16),transparent_40%),var(--card)] p-5 shadow-sm sm:p-6" aria-live="polite"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-primary text-xs font-bold uppercase tracking-[.16em]">Selected congressional district · UCLA source geometry</p><h3 className="font-display mt-2 text-2xl font-bold">{district.state} · {district.districtLabel}</h3><p className="mt-1 text-sm text-muted-foreground">{district.congress}th Congress · {startYear}–{endYear}</p></div><button type="button" onClick={onClose} className="inline-flex h-9 items-center gap-1.5 self-start rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"><X size={14} /> Close detail</button></div><div className="mt-5 grid gap-3 md:grid-cols-4"><DetailDatum label="District record" value={`${district.stateCode}-${district.districtNumber === 0 ? "AL" : district.districtNumber}`} /><DetailDatum label="Apportioned seats" value={`${stateSeatCount} in ${district.state}`} /><DetailDatum label="UCLA feature ID" value={district.sourceFeatureId || "Available in frame metadata"} mono /><DetailDatum label="Boundary era" value={boundaryEra || "Not catalogued"} /></div><div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="rounded-xl border border-border bg-background/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-primary">Verified House roster overlay</p>{district.member ? <><p className="mt-2 text-lg font-bold">{district.member.name}</p><p className="mt-1 text-sm text-muted-foreground">{atlasPartyLabel(district.member.party, district.member.partyCode)}</p><p className="mt-3 text-xs text-muted-foreground">{district.member.bioguideId ? `Bioguide ID: ${district.member.bioguideId}` : "No Bioguide identifier was supplied with the verified roster match."}</p></> : <p className="mt-2 text-sm text-muted-foreground">No verified House member match is available in the source export for this district. The UCLA geometry remains available and is not altered.</p>}</div><div className="rounded-xl border border-border bg-background/70 p-4"><p className="text-[10px] font-bold uppercase tracking-[.13em] text-primary">Record sources</p><a href={UCLA_CDMAPS_URL} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4">UCLA district archive <ExternalLink size={13} /></a><a href={VOTEVIEW_DATA_URL} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary underline underline-offset-4">Voteview House data <ExternalLink size={13} /></a><p className="mt-3 text-[10px] leading-4 text-muted-foreground">Geometry and roster data remain separately identified. This panel does not infer why a district’s party or boundaries changed.</p></div></div></section>;
}

function DetailDatum({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="rounded-lg border border-border bg-background/70 p-3"><p className="text-[9px] font-bold uppercase tracking-[.12em] text-primary">{label}</p><p className={`mt-1 break-words text-sm font-semibold ${mono ? "font-mono text-xs" : ""}`}>{value}</p></div>; }
function VraTimeline({ onSelectCongress }: { onSelectCongress: (congress: number) => void }) { return <div className="rounded-2xl border border-border bg-card p-5 sm:p-7"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-primary text-xs font-semibold uppercase tracking-[.18em]">Guided legal context</p><h2 className="font-display mt-2 text-2xl font-bold">Voting Rights Act map-change timeline</h2><p className="mt-2 max-w-3xl text-sm text-muted-foreground">Choose a source-linked milestone to move the complete 50-state map to its corresponding Congress. These entries describe legal context only; they do not certify a state map or assign a cause to a particular boundary-file transition.</p></div><span className="text-xs text-muted-foreground">Primary and institutional sources linked</span></div><div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">{ATLAS_VRA_TIMELINE.map((milestone) => <button type="button" key={milestone.year} onClick={() => onSelectCongress(milestone.congress)} className="rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/35"><p className="text-xl font-bold text-primary">{milestone.year}</p><p className="mt-1 text-sm font-semibold">{milestone.title}</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{milestone.summary}</p><span className="mt-3 inline-flex rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[.09em] text-primary">{milestone.sourceUrl.includes("supremecourt.gov") ? "Primary court source" : "Institutional source"}</span><a href={milestone.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary underline underline-offset-4">{milestone.sourceLabel} <ExternalLink size={11} /></a></button>)}</div></div>; }
function Metric({ value, label, icon: Icon }: { value: string | number; label: string; icon: any }) { return <div className="rounded-xl border border-border bg-card/80 px-4 py-3"><Icon size={16} className="mb-2 text-primary" /><div className="font-display text-xl font-bold">{value}</div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div></div>; }
function Info({ label, value, icon: Icon }: { label: string; value: string; icon: any }) { return <div className="rounded-lg border border-border bg-background p-3"><Icon size={15} className="mb-2 text-primary" /><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>; }
function AtlasLens({ title, detail }: { title: string; detail: string }) { return <div className="rounded-xl border border-primary/15 bg-card/70 p-4"><p className="text-xs font-bold uppercase tracking-[.13em] text-primary">{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p></div>; }
function SeatChart({ values }: { values: number[] }) { const max = Math.max(...values, 1); return <div className="mt-6 flex h-52 items-end gap-2">{values.map((value, index) => <div key={index} className="flex h-full flex-1 flex-col justify-end"><span className="mb-1 text-center text-xs text-muted-foreground">{value}</span><div className="min-h-2 rounded-t-md bg-primary/75 transition-all" style={{ height: `${Math.max(8, (value / max) * 100)}%` }} /></div>)}</div>; }

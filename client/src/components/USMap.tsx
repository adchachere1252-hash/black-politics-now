import { useState, useMemo } from "react";

// Simplified US state paths for an SVG map
// Each state has: id (2-letter code), name, path (SVG d attribute), and center point for labels
const STATES: { id: string; name: string; d: string; cx: number; cy: number }[] = [
  { id: "AL", name: "Alabama", d: "M628,396 L628,448 L614,452 L610,460 L614,462 L612,470 L590,470 L590,396Z", cx: 610, cy: 430 },
  { id: "AK", name: "Alaska", d: "M161,485 L183,485 L183,510 L210,510 L210,525 L161,525Z", cx: 185, cy: 505 },
  { id: "AZ", name: "Arizona", d: "M205,380 L260,380 L270,445 L210,445 L195,420Z", cx: 232, cy: 412 },
  { id: "AR", name: "Arkansas", d: "M530,395 L585,395 L585,440 L530,440Z", cx: 557, cy: 417 },
  { id: "CA", name: "California", d: "M120,260 L165,260 L185,310 L185,420 L145,420 L120,360Z", cx: 152, cy: 340 },
  { id: "CO", name: "Colorado", d: "M280,290 L360,290 L360,345 L280,345Z", cx: 320, cy: 317 },
  { id: "CT", name: "Connecticut", d: "M780,210 L800,210 L800,228 L780,228Z", cx: 790, cy: 219 },
  { id: "DE", name: "Delaware", d: "M745,280 L760,280 L760,300 L745,300Z", cx: 752, cy: 290 },
  { id: "FL", name: "Florida", d: "M620,470 L690,460 L710,480 L700,530 L660,540 L640,510 L620,480Z", cx: 665, cy: 495 },
  { id: "GA", name: "Georgia", d: "M630,395 L680,395 L690,455 L635,455Z", cx: 660, cy: 425 },
  { id: "HI", name: "Hawaii", d: "M260,490 L290,490 L290,515 L260,515Z", cx: 275, cy: 502 },
  { id: "ID", name: "Idaho", d: "M195,155 L235,155 L240,250 L200,250 L195,200Z", cx: 217, cy: 202 },
  { id: "IL", name: "Illinois", d: "M560,240 L590,240 L595,340 L555,340 L555,290Z", cx: 575, cy: 290 },
  { id: "IN", name: "Indiana", d: "M595,250 L630,250 L630,340 L595,340Z", cx: 612, cy: 295 },
  { id: "IA", name: "Iowa", d: "M480,225 L555,225 L555,280 L480,280Z", cx: 517, cy: 252 },
  { id: "KS", name: "Kansas", d: "M380,310 L470,310 L470,360 L380,360Z", cx: 425, cy: 335 },
  { id: "KY", name: "Kentucky", d: "M590,340 L670,330 L680,360 L590,370Z", cx: 635, cy: 350 },
  { id: "LA", name: "Louisiana", d: "M530,445 L580,445 L585,490 L545,495 L530,475Z", cx: 555, cy: 467 },
  { id: "ME", name: "Maine", d: "M800,115 L825,115 L830,170 L800,170Z", cx: 815, cy: 142 },
  { id: "MD", name: "Maryland", d: "M700,280 L745,275 L745,300 L700,305Z", cx: 722, cy: 290 },
  { id: "MA", name: "Massachusetts", d: "M780,190 L815,190 L815,205 L780,205Z", cx: 797, cy: 197 },
  { id: "MI", name: "Michigan", d: "M580,160 L630,155 L640,230 L590,235 L580,200Z", cx: 610, cy: 195 },
  { id: "MN", name: "Minnesota", d: "M460,130 L530,130 L530,215 L460,215Z", cx: 495, cy: 172 },
  { id: "MS", name: "Mississippi", d: "M570,400 L600,400 L600,470 L570,470Z", cx: 585, cy: 435 },
  { id: "MO", name: "Missouri", d: "M480,300 L555,300 L560,380 L490,380 L480,340Z", cx: 520, cy: 340 },
  { id: "MT", name: "Montana", d: "M240,120 L360,120 L360,175 L240,175Z", cx: 300, cy: 147 },
  { id: "NE", name: "Nebraska", d: "M360,260 L460,260 L470,305 L360,305Z", cx: 415, cy: 282 },
  { id: "NV", name: "Nevada", d: "M170,240 L215,240 L225,370 L175,370Z", cx: 197, cy: 305 },
  { id: "NH", name: "New Hampshire", d: "M795,145 L815,145 L815,185 L795,185Z", cx: 805, cy: 165 },
  { id: "NJ", name: "New Jersey", d: "M750,240 L770,240 L770,285 L750,285Z", cx: 760, cy: 262 },
  { id: "NM", name: "New Mexico", d: "M260,380 L340,380 L340,450 L260,450Z", cx: 300, cy: 415 },
  { id: "NY", name: "New York", d: "M700,170 L780,170 L790,230 L710,230 L700,200Z", cx: 745, cy: 200 },
  { id: "NC", name: "North Carolina", d: "M640,350 L740,340 L750,370 L650,380Z", cx: 695, cy: 360 },
  { id: "ND", name: "North Dakota", d: "M370,120 L455,120 L455,170 L370,170Z", cx: 412, cy: 145 },
  { id: "OH", name: "Ohio", d: "M630,240 L690,240 L690,310 L630,310Z", cx: 660, cy: 275 },
  { id: "OK", name: "Oklahoma", d: "M370,365 L480,365 L480,400 L530,400 L530,390 L370,390Z", cx: 440, cy: 380 },
  { id: "OR", name: "Oregon", d: "M120,155 L195,155 L195,220 L120,220Z", cx: 157, cy: 187 },
  { id: "PA", name: "Pennsylvania", d: "M690,230 L760,225 L760,270 L690,270Z", cx: 725, cy: 248 },
  { id: "RI", name: "Rhode Island", d: "M800,210 L815,210 L815,222 L800,222Z", cx: 807, cy: 216 },
  { id: "SC", name: "South Carolina", d: "M660,380 L720,375 L720,410 L670,415Z", cx: 690, cy: 395 },
  { id: "SD", name: "South Dakota", d: "M370,175 L455,175 L455,230 L370,230Z", cx: 412, cy: 202 },
  { id: "TN", name: "Tennessee", d: "M560,360 L670,355 L670,385 L560,390Z", cx: 615, cy: 372 },
  { id: "TX", name: "Texas", d: "M330,400 L440,400 L460,410 L480,450 L460,520 L380,530 L340,490 L310,450Z", cx: 400, cy: 460 },
  { id: "UT", name: "Utah", d: "M230,260 L280,260 L280,345 L230,345Z", cx: 255, cy: 302 },
  { id: "VT", name: "Vermont", d: "M775,145 L795,145 L795,185 L775,185Z", cx: 785, cy: 165 },
  { id: "VA", name: "Virginia", d: "M650,310 L740,300 L750,340 L660,350Z", cx: 700, cy: 325 },
  { id: "WA", name: "Washington", d: "M130,95 L200,95 L200,155 L130,155Z", cx: 165, cy: 125 },
  { id: "WV", name: "West Virginia", d: "M660,290 L700,280 L700,330 L665,340Z", cx: 680, cy: 310 },
  { id: "WI", name: "Wisconsin", d: "M510,145 L570,145 L575,230 L510,230Z", cx: 540, cy: 187 },
  { id: "WY", name: "Wyoming", d: "M270,185 L355,185 L355,250 L270,250Z", cx: 312, cy: 217 },
];

interface USMapProps {
  raceData: Record<string, { rating: string | null; candidate1: string; candidate2: string; calledWinner?: string | null }>;
  onStateClick?: (stateId: string) => void;
  selectedState?: string | null;
  showLegend?: boolean;
}

export function USMap({ raceData, onStateClick, selectedState, showLegend = true }: USMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const getStateColor = (stateId: string) => {
    const race = raceData[stateId];
    if (!race) return "var(--color-no-data)";
    switch (race.rating) {
      case "Solid D": return "var(--color-solid-d)";
      case "Likely D": return "var(--color-likely-d)";
      case "Lean D": return "var(--color-lean-d)";
      case "Toss-up": return "var(--color-tossup)";
      case "Lean R": return "var(--color-lean-r)";
      case "Likely R": return "var(--color-likely-r)";
      case "Solid R": return "var(--color-solid-r)";
      default: return "var(--color-no-data)";
    }
  };

  const hoveredData = hoveredState ? raceData[hoveredState] : null;
  const hoveredName = hoveredState ? STATES.find(s => s.id === hoveredState)?.name : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox="100 80 750 470"
        className="w-full h-auto"
        style={{ maxHeight: "420px" }}
      >
        {STATES.map((state) => (
          <g key={state.id}>
            <path
              d={state.d}
              fill={getStateColor(state.id)}
              stroke={selectedState === state.id ? "var(--color-primary)" : "rgba(255,255,255,0.15)"}
              strokeWidth={selectedState === state.id ? 2.5 : 0.8}
              className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white hover:stroke-[1.5]"
              onClick={() => onStateClick?.(state.id)}
              onMouseEnter={(e) => {
                setHoveredState(state.id);
                const rect = (e.target as SVGElement).ownerSVGElement?.getBoundingClientRect();
                if (rect) {
                  const svgX = e.clientX - rect.left;
                  const svgY = e.clientY - rect.top;
                  setTooltipPos({ x: svgX, y: svgY });
                }
              }}
              onMouseLeave={() => setHoveredState(null)}
            />
            <text
              x={state.cx}
              y={state.cy}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
              fill="white"
              fontSize="9"
              fontWeight="600"
              opacity={0.9}
            >
              {state.id}
            </text>
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredState && hoveredData && (
        <div
          className="absolute pointer-events-none z-50 bg-popover border border-border rounded-lg shadow-xl p-3 min-w-[180px]"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 80}px`,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm font-bold text-foreground">{hoveredName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{hoveredData.rating ?? "No Rating"}</p>
          <div className="mt-1.5 text-xs">
            <p className="text-[color:var(--color-solid-d)]">{hoveredData.candidate1 || "TBD"}</p>
            <p className="text-[color:var(--color-solid-r)]">{hoveredData.candidate2 || "TBD"}</p>
          </div>
          {hoveredData.calledWinner && (
            <p className="text-xs text-primary font-medium mt-1">Winner: {hoveredData.calledWinner}</p>
          )}
        </div>
      )}

      {/* Legend */}
      {showLegend && <div className="flex flex-wrap justify-center gap-3 mt-3">
        {[
          { label: "Solid D", color: "var(--color-solid-d)" },
          { label: "Likely D", color: "var(--color-likely-d)" },
          { label: "Lean D", color: "var(--color-lean-d)" },
          { label: "Toss-up", color: "var(--color-tossup)" },
          { label: "Lean R", color: "var(--color-lean-r)" },
          { label: "Likely R", color: "var(--color-likely-r)" },
          { label: "Solid R", color: "var(--color-solid-r)" },
          { label: "No Data", color: "var(--color-no-data)" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

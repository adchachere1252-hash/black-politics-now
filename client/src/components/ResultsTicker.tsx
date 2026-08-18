import { Pause, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { isFinalElectionTickerOutcome } from "@/lib/resultsTickerEligibility";

interface TickerItem {
  state: string;
  winner: string;
  party: string;
  chamber: string;
}

interface ResultsTickerProps {
  senateRaces: any[];
  houseRaces: any[];
}

export function ResultsTicker({ senateRaces, houseRaces }: ResultsTickerProps) {
  const [paused, setPaused] = useState(false);
  const calledRaces = useMemo(() => {
    const results: TickerItem[] = [];
    senateRaces.forEach((r: any) => {
      if (isFinalElectionTickerOutcome(r)) results.push({ state: r.stateName, winner: r.calledWinner, party: r.calledParty ?? "?", chamber: "Senate" });
    });
    houseRaces.forEach((r: any) => {
      if (isFinalElectionTickerOutcome(r)) results.push({ state: `${r.stateName}-${r.district ?? "AL"}`, winner: r.calledWinner, party: r.calledParty ?? "?", chamber: "House" });
    });
    return results;
  }, [senateRaces, houseRaces]);

  if (calledRaces.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-muted/30 border border-border/50 rounded-lg py-2 px-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-destructive/20 border border-destructive/40 text-[10px] font-black text-destructive uppercase tracking-widest whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            RESULTS
          </span>
          <span className="text-xs text-muted-foreground">No races called yet — results will scroll here as winners are declared</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border/50 bg-muted/30 py-1.5" role="region" aria-label="Final Senate and House election results ticker">
      <p className="sr-only" aria-live="polite">{calledRaces.map((race) => `${race.state} ${race.chamber}: ${race.winner}, ${race.party}`).join(". ")}</p>
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1 border-r border-border/50 bg-muted/80 px-3 py-0.5 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[10px] font-black text-destructive uppercase tracking-widest">RESULTS</span>
        </span>
        <div className="ticker-viewport min-w-0 flex-1" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className={`ticker-scroll flex gap-6 ${paused ? "ticker-scroll--paused" : ""}`} tabIndex={0} aria-label="Scrolling final election outcomes. Hover, focus, or use the pause control to stop movement." aria-hidden="true">
          {[...calledRaces, ...calledRaces].map((race, i) => (
            <span key={i} className="whitespace-nowrap text-xs">
              <span className="font-medium text-foreground">{race.state}</span>
              <span className="text-muted-foreground"> {race.chamber}: </span>
              <span className={race.party === "D" ? "text-[color:var(--color-solid-d)]" : race.party === "R" ? "text-[color:var(--color-solid-r)]" : "text-foreground"}>
                {race.winner} ({race.party})
              </span>
            </span>
          ))}
        </div>
        </div>
        <button type="button" onClick={() => setPaused((value) => !value)} className="mr-2 inline-flex h-6 shrink-0 items-center gap-1 rounded border border-border bg-background px-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground" aria-pressed={paused} aria-label={paused ? "Resume results ticker" : "Pause results ticker"}>{paused ? <Play size={11} /> : <Pause size={11} />}<span className="hidden sm:inline">{paused ? "Resume" : "Pause"}</span></button>
      </div>
    </div>
  );
}

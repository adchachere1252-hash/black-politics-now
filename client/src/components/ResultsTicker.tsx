import { useMemo } from "react";
import { isFinalElectionTickerOutcome } from "@/lib/resultsTickerEligibility";
import { createTickerSequences } from "@/lib/tickerFlow";

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
  const tickerSequences = useMemo(() => createTickerSequences(calledRaces), [calledRaces]);

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
        <div className="ticker-viewport min-w-0 flex-1" aria-label="Continuously scrolling final election outcomes">
          <div className="ticker-scroll" aria-hidden="true">
            {tickerSequences.map((sequence, sequenceIndex) => <div className="ticker-sequence" key={sequenceIndex}>
              {sequence.map((race, index) => (
                <span key={`${sequenceIndex}-${race.state}-${race.chamber}-${index}`} className="whitespace-nowrap text-xs">
                  <span className="font-medium text-foreground">{race.state}</span>
                  <span className="text-muted-foreground"> {race.chamber}: </span>
                  <span className={race.party === "D" ? "text-[color:var(--color-solid-d)]" : race.party === "R" ? "text-[color:var(--color-solid-r)]" : "text-foreground"}>
                    {race.winner} ({race.party})
                  </span>
                </span>
              ))}
            </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

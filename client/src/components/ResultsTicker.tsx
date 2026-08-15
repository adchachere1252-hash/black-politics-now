import { useMemo } from "react";
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
    <div className="w-full overflow-hidden bg-muted/30 border border-border/50 rounded-lg py-2 relative">
      <div className="flex items-center">
        <span className="inline-flex items-center gap-1 px-3 py-0.5 whitespace-nowrap z-10 bg-muted/80 border-r border-border/50">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[10px] font-black text-destructive uppercase tracking-widest">RESULTS</span>
        </span>
        <div className="ticker-scroll flex gap-6">
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
    </div>
  );
}

import { useMemo } from "react";

interface TickerItem {
  state: string;
  winner: string;
  party: string;
  chamber: string;
}

interface ResultsTickerProps {
  senateRaces: any[];
  houseRaces: any[];
  governors: any[];
}

export function ResultsTicker({ senateRaces, houseRaces, governors }: ResultsTickerProps) {
  const calledRaces = useMemo(() => {
    const results: TickerItem[] = [];
    senateRaces.forEach((r: any) => {
      if (r.calledWinner) results.push({ state: r.stateName, winner: r.calledWinner, party: r.calledParty ?? "?", chamber: "Senate" });
    });
    houseRaces.forEach((r: any) => {
      if (r.calledWinner) results.push({ state: `${r.stateName}-${r.district ?? "AL"}`, winner: r.calledWinner, party: r.calledParty ?? "?", chamber: "House" });
    });
    governors.forEach((r: any) => {
      if (r.calledWinner) results.push({ state: r.stateName, winner: r.calledWinner, party: "?", chamber: "Governor" });
    });
    return results;
  }, [senateRaces, houseRaces, governors]);

  if (calledRaces.length === 0) {
    return (
      <div className="w-full overflow-hidden bg-muted/50 rounded-lg py-2 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider whitespace-nowrap">Results Ticker</span>
          <span className="text-xs text-muted-foreground">No races called yet — results will scroll here as winners are declared</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-muted/50 rounded-lg py-2 relative">
      <div className="flex items-center">
        <span className="text-xs font-bold text-primary uppercase tracking-wider px-4 whitespace-nowrap z-10 bg-muted/50">Results</span>
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

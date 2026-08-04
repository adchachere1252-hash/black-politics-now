import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";

const RATINGS = ["All", "Solid D", "Likely D", "Lean D", "Toss-up", "Lean R", "Likely R", "Solid R"] as const;
type ViewTab = "senate" | "house" | "governors" | "referendums";

export default function Elections() {
  const [tab, setTab] = useState<ViewTab>("senate");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: senateRaces = [] } = trpc.election.senate.useQuery();
  const { data: houseRaces = [] } = trpc.election.house.useQuery();
  const { data: governors = [] } = trpc.election.governors.useQuery();
  const { data: referendumsList = [] } = trpc.election.referendums.useQuery();
  const { data: scoreboard } = trpc.election.scoreboard.useQuery();

  const filteredSenate = useMemo(() => {
    let races = senateRaces as any[];
    if (ratingFilter !== "All") races = races.filter(r => r.rating === ratingFilter);
    if (searchQuery) races = races.filter(r => r.stateName?.toLowerCase().includes(searchQuery.toLowerCase()) || r.candidate1Name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.candidate2Name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return races;
  }, [senateRaces, ratingFilter, searchQuery]);

  const filteredHouse = useMemo(() => {
    let races = houseRaces as any[];
    if (ratingFilter !== "All") races = races.filter(r => r.rating === ratingFilter);
    if (searchQuery) races = races.filter(r => r.stateName?.toLowerCase().includes(searchQuery.toLowerCase()) || r.candidate1Name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.candidate2Name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return races;
  }, [houseRaces, ratingFilter, searchQuery]);

  const filteredGovs = useMemo(() => {
    let races = governors as any[];
    if (ratingFilter !== "All") races = races.filter(r => r.rating === ratingFilter);
    if (searchQuery) races = races.filter(r => r.stateName?.toLowerCase().includes(searchQuery.toLowerCase()));
    return races;
  }, [governors, ratingFilter, searchQuery]);

  const filteredRefs = useMemo(() => {
    let refs = referendumsList as any[];
    if (searchQuery) refs = refs.filter(r => r.stateName?.toLowerCase().includes(searchQuery.toLowerCase()) || r.title?.toLowerCase().includes(searchQuery.toLowerCase()));
    return refs;
  }, [referendumsList, searchQuery]);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold mb-1">2026 U.S. Election Center</h1>
        <p className="text-muted-foreground text-sm">Real-time race ratings, results, and analysis.</p>
      </div>

      {/* Scoreboard */}
      {scoreboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ScoreCard label="Senate Dem" value={scoreboard.senate.dem} color="var(--color-solid-d)" />
          <ScoreCard label="Senate Rep" value={scoreboard.senate.rep} color="var(--color-solid-r)" />
          <ScoreCard label="House Dem" value={scoreboard.house.dem} color="var(--color-solid-d)" />
          <ScoreCard label="House Rep" value={scoreboard.house.rep} color="var(--color-solid-r)" />
        </div>
      )}

      {/* Tabs + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["senate", "house", "governors", "referendums"] as ViewTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search races..."
              className="w-full pl-8 pr-3 py-2 bg-muted rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {tab !== "referendums" && (
            <select
              value={ratingFilter}
              onChange={e => setRatingFilter(e.target.value)}
              className="bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Race list */}
      {tab === "senate" && <RaceGrid races={filteredSenate} chamber="senate" />}
      {tab === "house" && <RaceGrid races={filteredHouse} chamber="house" />}
      {tab === "governors" && <GovernorGrid races={filteredGovs} />}
      {tab === "referendums" && <ReferendumGrid refs={filteredRefs} />}
    </div>
  );
}

function ScoreCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="glass-card rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function RaceGrid({ races, chamber }: { races: any[]; chamber: string }) {
  if (races.length === 0) return <p className="text-center text-muted-foreground py-8">No races match your filters.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {races.map((race) => (
        <div key={race.id} className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">
              {race.stateName}
              {chamber === "house" && race.district ? ` - ${race.districtLabel || `District ${race.district}`}` : ""}
            </h3>
            <RatingBadge rating={race.rating} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{race.candidate1Name ?? "TBD"} ({race.candidate1Party ?? "?"})</span>
            <span>{race.candidate2Name ?? "TBD"} ({race.candidate2Party ?? "?"})</span>
          </div>
          {(race.candidate1VotePct || race.candidate2VotePct) && (
            <div className="flex h-2 rounded-full overflow-hidden bg-muted mt-2">
              <div className="bg-[var(--color-solid-d)]" style={{ width: `${race.candidate1VotePct ?? 0}%` }} />
              <div className="bg-[var(--color-solid-r)]" style={{ width: `${race.candidate2VotePct ?? 0}%` }} />
            </div>
          )}
          {race.calledWinner && (
            <p className="text-xs text-primary mt-2 font-medium">Winner: {race.calledWinner} ({race.calledParty})</p>
          )}
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Status: {race.status}</span>
            {race.pctReporting != null && <span>{race.pctReporting}% reporting</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function GovernorGrid({ races }: { races: any[] }) {
  if (races.length === 0) return <p className="text-center text-muted-foreground py-8">No races match your filters.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {races.map((race) => (
        <div key={race.id} className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold">{race.stateName}</h3>
            <RatingBadge rating={race.rating} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{race.demCandidate ?? "TBD"} (D)</span>
            <span>{race.repCandidate ?? "TBD"} (R)</span>
          </div>
          {race.calledWinner && (
            <p className="text-xs text-primary mt-2 font-medium">Winner: {race.calledWinner}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReferendumGrid({ refs }: { refs: any[] }) {
  if (refs.length === 0) return <p className="text-center text-muted-foreground py-8">No referendums match your search.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {refs.map((ref) => (
        <div key={ref.id} className="glass-card rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold">{ref.stateName} - {ref.measureId}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${ref.result === "Passed" ? "bg-green-500/20 text-green-400" : ref.result === "Failed" ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"}`}>
              {ref.result ?? "Pending"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{ref.title}</p>
          {ref.category && <p className="text-xs text-primary/70 mt-1">{ref.category}</p>}
        </div>
      ))}
    </div>
  );
}

function RatingBadge({ rating }: { rating: string | null }) {
  const cls = getRatingClass(rating);
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{rating ?? "N/A"}</span>;
}

function getRatingClass(rating: string | null) {
  switch (rating) {
    case "Solid D": return "rating-solid-d";
    case "Likely D": return "rating-likely-d";
    case "Lean D": return "rating-lean-d";
    case "Toss-up": return "rating-tossup";
    case "Lean R": return "rating-lean-r";
    case "Likely R": return "rating-likely-r";
    case "Solid R": return "rating-solid-r";
    default: return "bg-muted text-muted-foreground";
  }
}

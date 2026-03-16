"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Triangle, TrendingUp, Shield } from "lucide-react";
import TrapezoidChart, { FilterMode } from "@/components/trapezoid/TrapezoidChart";
import ChartFilters from "@/components/trapezoid/ChartFilters";
import ChartLegend from "@/components/trapezoid/ChartLegend";
import { getAllTeams } from "@/data/teamUtils";

function HomeContent() {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<FilterMode>("all");
  const [filterRegion, setFilterRegion] = useState("East");
  const [filterSeedRange, setFilterSeedRange] = useState<[number, number]>([1, 4]);
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);

  // Handle ?team= query param for cross-page navigation
  useEffect(() => {
    const teamName = searchParams.get("team");
    if (teamName) {
      setHighlightedTeam(teamName);
      const timer = setTimeout(() => setHighlightedTeam(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const teams = useMemo(() => getAllTeams(), []);

  const trapCount = teams.filter((t) => t.insideTrapezoid).length;
  const champCount = teams.filter((t) => t.meetsChampFormula).length;
  const bothCount = teams.filter(
    (t) => t.insideTrapezoid && t.meetsChampFormula
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-text-primary">
          Trapezoid of Excellence
        </h1>
        <p className="max-w-2xl text-sm text-text-secondary">
          All 68 tournament teams plotted by pace vs. net rating. Teams inside
          the trapezoid have the profile of past champions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-lg border border-border bg-surface px-4 py-2.5">
        <ChartFilters
          filter={filter}
          onFilterChange={setFilter}
          filterRegion={filterRegion}
          onRegionChange={setFilterRegion}
          filterSeedRange={filterSeedRange}
          onSeedRangeChange={setFilterSeedRange}
        />
      </div>

      {/* Chart */}
      <div className="mb-4 overflow-hidden rounded-xl border border-border bg-surface p-4">
        <TrapezoidChart
          filter={filter}
          filterRegion={filterRegion}
          filterSeedRange={filterSeedRange}
          highlightedTeam={highlightedTeam}
        />
      </div>

      {/* Legend */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
        <ChartLegend />
        <span className="font-mono text-[10px] text-text-secondary/40">
          Data: kenpom.com · {teams.length} teams
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          {
            label: "In Trapezoid",
            value: trapCount,
            color: "text-accent-green",
            icon: Triangle,
          },
          {
            label: "Champ Formula",
            value: champCount,
            color: "text-accent-orange",
            icon: TrendingUp,
          },
          {
            label: "Both Filters",
            value: bothCount,
            color: "text-accent-gold",
            icon: Shield,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <card.icon size={14} className={card.color} />
              <span className="text-xs text-text-secondary">{card.label}</span>
            </div>
            <p className={`font-mono text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

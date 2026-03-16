"use client";

import { useMemo } from "react";
import { getAllTeams } from "@/data/teamUtils";
import { TeamTier } from "@/types";

const TIERS: { key: TeamTier; label: string; color: string }[] = [
  { key: "title_contender", label: "Title Contender", color: "#F5A623" },
  { key: "trapezoid_elite", label: "Trapezoid Elite", color: "#2EC4B6" },
  { key: "trapezoid_team", label: "Trapezoid Team", color: "#0891B2" },
  { key: "long_shot", label: "Long Shot", color: "#4a4f5a" },
];

export default function ChartLegend() {
  const counts = useMemo(() => {
    const teams = getAllTeams();
    const map: Record<string, number> = {};
    for (const t of teams) {
      map[t.tier] = (map[t.tier] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {TIERS.map((tier) => (
        <div key={tier.key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{
              background: tier.color,
              boxShadow:
                tier.key === "title_contender"
                  ? `0 0 6px ${tier.color}60`
                  : "none",
            }}
          />
          <span className="text-xs text-text-secondary">
            {tier.label}
          </span>
          <span className="font-mono text-xs text-text-secondary/60">
            ({counts[tier.key] ?? 0})
          </span>
        </div>
      ))}
    </div>
  );
}

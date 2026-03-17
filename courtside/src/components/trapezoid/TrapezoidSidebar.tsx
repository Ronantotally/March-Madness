"use client";

import { useMemo } from "react";
import { getAllTeams } from "@/data/teamUtils";
import { TeamTier } from "@/types";
const TIERS: {
  key: TeamTier;
  color: string;
  label: string;
  description: string;
}[] = [
  {
    key: "title_contender",
    color: "#F5A623",
    label: "Title Contender",
    description: "Inside trapezoid + KenPom champion profile.",
  },
  {
    key: "trapezoid_elite",
    color: "#2EC4B6",
    label: "Trapezoid Elite",
    description: "Inside trapezoid with strong efficiency numbers.",
  },
  {
    key: "trapezoid_team",
    color: "#0891B2",
    label: "Trapezoid Team",
    description: "Inside trapezoid but some weaknesses.",
  },
  {
    key: "kenpom_sleeper",
    color: "#8B5CF6",
    label: "KenPom Sleeper",
    description: "Great stats but wrong pace/style for a champion.",
  },
  {
    key: "long_shot",
    color: "#4a4f5a",
    label: "Long Shot",
    description: "Outside both frameworks.",
  },
];

const STORYLINES = [
  "Houston joins title contenders — inside the new tighter trapezoid boundary.",
  "Alabama has the #3 offense but #67 defense — classic upset candidate.",
  "Michigan St., Louisville fall outside the tighter trapezoid — now KenPom sleepers.",
  "All four 1-seeds are title contenders.",
];

interface Props {
  activeTier: TeamTier | null;
  onTierToggle: (tier: TeamTier) => void;
}

export default function TrapezoidSidebar({
  activeTier,
  onTierToggle,
}: Props) {
  const counts = useMemo(() => {
    const teams = getAllTeams();
    const map: Record<string, number> = {};
    for (const t of teams) {
      map[t.tier] = (map[t.tier] || 0) + 1;
    }
    return map;
  }, []);

  return (
    <aside className="flex flex-col gap-0 rounded-xl border border-border bg-surface lg:w-[280px]">
      {/* Section 1 — What am I looking at? */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-text-primary">
          What am I looking at?
        </h2>
        <p className="text-[11px] leading-relaxed text-text-secondary">
          Our Trapezoid of KenPom plots every tournament team by tempo vs
          efficiency margin using KenPom&apos;s adjusted metrics. Teams inside the
          green shape play at a championship level — 6 of the last 6 national
          champions were inside it.
        </p>
      </div>

      {/* Section 2 — Reading the chart */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-text-primary">
          Reading the chart
        </h2>
        <div className="space-y-2 text-[11px] leading-relaxed text-text-secondary">
          <div>
            <p className="text-text-primary">→ X-axis: Adjusted Tempo (AdjT)</p>
            <p>
              How fast a team plays, measured in possessions per game and
              adjusted for opponent. If you play a bunch of slow teams, your raw
              pace drops — but that doesn&apos;t mean you&apos;re a slow team. AdjT
              corrects for that to estimate your true speed against an average
              opponent.
            </p>
          </div>
          <div>
            <p className="text-text-primary">↑ Y-axis: Adjusted Efficiency Margin (AdjEM)</p>
            <p>
              How many points a team would outscore an average opponent per 100
              possessions. It combines offensive and defensive efficiency (AdjO
              minus AdjD) and adjusts for opponent quality — beating a great
              team by 5 tells you more than beating a bad team by 20. This is a
              predictive measure, not just a summary of past results. It
              estimates how good a team truly is right now, with schedule noise
              filtered out.
            </p>
          </div>
          <div>
            <p className="text-text-primary">Why these two axes?</p>
            <p>
              AdjEM strips out pace so you can compare fast and slow teams
              fairly. AdjT tells you how fast they actually play. These are
              completely independent — knowing a team&apos;s speed tells you nothing
              about how good they are, and vice versa. The trapezoid combines
              both to identify teams with the right mix of dominance and style
              to win in March.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 — Tier legend (clickable filters) */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-text-primary">
          What the colors mean
        </h2>
        <div className="space-y-1.5">
          {TIERS.map((tier) => {
            const isActive = activeTier === tier.key;
            return (
              <button
                key={tier.key}
                onClick={() => onTierToggle(tier.key)}
                className={`flex w-full items-start gap-2 rounded-md px-1.5 py-1 text-left transition-colors ${
                  isActive
                    ? "bg-white/[0.04]"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className="mt-[3px] inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{
                    background: tier.color,
                    boxShadow:
                      tier.key === "title_contender"
                        ? `0 0 6px ${tier.color}60`
                        : "none",
                    outline: isActive
                      ? `2px solid ${tier.color}`
                      : "none",
                    outlineOffset: "2px",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-[11px] font-semibold"
                      style={{ color: isActive ? tier.color : "#e8e9ed" }}
                    >
                      {tier.label}
                    </span>
                    <span className="font-mono text-[10px] text-text-secondary/50">
                      ({counts[tier.key] ?? 0})
                    </span>
                  </div>
                  <p className="text-[10px] leading-snug text-text-secondary/70">
                    {tier.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4 — Key storylines */}
      <div className="px-4 py-3">
        <h2 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-text-primary">
          Key storylines
        </h2>
        <ul className="space-y-1.5">
          {STORYLINES.map((s, i) => (
            <li
              key={i}
              className="flex gap-2 text-[11px] leading-relaxed text-text-secondary"
            >
              <span className="mt-0.5 text-accent-gold">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Team, TeamTier } from "@/types";
import { getAllTeams } from "@/data/teamUtils";
import { getTrapezoidVertices } from "@/data/trapezoid";
import TeamCard from "./TeamCard";

// ---------- constants ----------
const TIER_COLORS: Record<TeamTier, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  long_shot: "#4a4f5a",
};

const TIER_LABELS: Record<TeamTier, string> = {
  title_contender: "Title Contender",
  trapezoid_elite: "Trapezoid Elite",
  trapezoid_team: "Trapezoid Team",
  long_shot: "Long Shot",
};

// Chart layout
const MARGIN = { top: 48, right: 32, bottom: 56, left: 64 };
const CHART_W = 920;
const CHART_H = 560;
const INNER_W = CHART_W - MARGIN.left - MARGIN.right;
const INNER_H = CHART_H - MARGIN.top - MARGIN.bottom;

// Data range — padded
const X_MIN = 61;
const X_MAX = 74.5;
const Y_MIN = -14;
const Y_MAX = 42;

function xScale(pace: number) {
  return MARGIN.left + ((pace - X_MIN) / (X_MAX - X_MIN)) * INNER_W;
}
function yScale(netRtg: number) {
  return MARGIN.top + ((Y_MAX - netRtg) / (Y_MAX - Y_MIN)) * INNER_H;
}
function dotRadius(seed: number) {
  return Math.max(5, 14 - (seed - 1) * 0.65);
}

// ---------- filter types ----------
export type FilterMode = "all" | "title_contenders" | "trapezoid" | "region" | "seed";

interface Props {
  filter: FilterMode;
  filterRegion?: string;
  filterSeedRange?: [number, number];
}

export default function TrapezoidChart({ filter, filterRegion, filterSeedRange }: Props) {
  const allTeams = useMemo(() => getAllTeams(), []);
  const vertices = useMemo(() => getTrapezoidVertices(), []);
  const [hoveredTeam, setHoveredTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Apply filters
  const filteredTeams = useMemo(() => {
    switch (filter) {
      case "title_contenders":
        return allTeams.filter((t) => t.tier === "title_contender");
      case "trapezoid":
        return allTeams.filter((t) => t.insideTrapezoid);
      case "region":
        return filterRegion
          ? allTeams.filter((t) => t.region === filterRegion)
          : allTeams;
      case "seed":
        if (!filterSeedRange) return allTeams;
        return allTeams.filter(
          (t) => t.seed >= filterSeedRange[0] && t.seed <= filterSeedRange[1]
        );
      default:
        return allTeams;
    }
  }, [allTeams, filter, filterRegion, filterSeedRange]);

  const dimmedTeams = useMemo(() => {
    if (filter === "all") return new Set<string>();
    const active = new Set(filteredTeams.map((t) => t.name));
    return new Set(allTeams.filter((t) => !active.has(t.name)).map((t) => t.name));
  }, [allTeams, filteredTeams, filter]);

  // Trapezoid polygon path
  const trapezoidPath = useMemo(() => {
    return vertices
      .map((v, i) => `${i === 0 ? "M" : "L"}${xScale(v.pace)},${yScale(v.netRtg)}`)
      .join(" ") + " Z";
  }, [vertices]);

  // Grid lines
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let x = Math.ceil(X_MIN); x <= Math.floor(X_MAX); x += 2) ticks.push(x);
    return ticks;
  }, []);
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let y = Math.ceil(Y_MIN / 5) * 5; y <= Y_MAX; y += 5) ticks.push(y);
    return ticks;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, team: Team) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setHoveredTeam(team);
    },
    []
  );

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        style={{ maxWidth: CHART_W }}
      >
        {/* Background */}
        <rect width={CHART_W} height={CHART_H} fill="#0a0b0f" rx={12} />

        {/* Grid */}
        {xTicks.map((x) => (
          <line
            key={`gx-${x}`}
            x1={xScale(x)}
            x2={xScale(x)}
            y1={MARGIN.top}
            y2={CHART_H - MARGIN.bottom}
            stroke="#1e2028"
            strokeWidth={0.5}
          />
        ))}
        {yTicks.map((y) => (
          <line
            key={`gy-${y}`}
            x1={MARGIN.left}
            x2={CHART_W - MARGIN.right}
            y1={yScale(y)}
            y2={yScale(y)}
            stroke="#1e2028"
            strokeWidth={0.5}
          />
        ))}

        {/* Zero line */}
        {Y_MIN < 0 && (
          <line
            x1={MARGIN.left}
            x2={CHART_W - MARGIN.right}
            y1={yScale(0)}
            y2={yScale(0)}
            stroke="#2a2c34"
            strokeWidth={1}
          />
        )}

        {/* Axis labels */}
        {xTicks.map((x) => (
          <text
            key={`xl-${x}`}
            x={xScale(x)}
            y={CHART_H - MARGIN.bottom + 20}
            textAnchor="middle"
            fill="#8a8f98"
            fontSize={11}
            fontFamily="var(--font-mono)"
          >
            {x}
          </text>
        ))}
        {yTicks.map((y) => (
          <text
            key={`yl-${y}`}
            x={MARGIN.left - 12}
            y={yScale(y) + 4}
            textAnchor="end"
            fill="#8a8f98"
            fontSize={11}
            fontFamily="var(--font-mono)"
          >
            {y}
          </text>
        ))}

        {/* Axis titles */}
        <text
          x={MARGIN.left + INNER_W / 2}
          y={CHART_H - 8}
          textAnchor="middle"
          fill="#8a8f98"
          fontSize={12}
          fontFamily="var(--font-sans)"
        >
          Adj. Tempo (Pace)
        </text>
        <text
          x={16}
          y={MARGIN.top + INNER_H / 2}
          textAnchor="middle"
          fill="#8a8f98"
          fontSize={12}
          fontFamily="var(--font-sans)"
          transform={`rotate(-90, 16, ${MARGIN.top + INNER_H / 2})`}
        >
          Adj. Efficiency Margin (AdjEM)
        </text>

        {/* Trapezoid fill */}
        <path
          d={trapezoidPath}
          fill="#2EC4B6"
          fillOpacity={0.04}
          stroke="#2EC4B6"
          strokeWidth={1.5}
          strokeDasharray="6 4"
          strokeOpacity={0.6}
        />

        {/* Trapezoid label */}
        <text
          x={(xScale(vertices[0].pace) + xScale(vertices[1].pace)) / 2}
          y={yScale(vertices[0].netRtg) - 10}
          textAnchor="middle"
          fill="#2EC4B6"
          fillOpacity={0.5}
          fontSize={10}
          fontFamily="var(--font-sans)"
          letterSpacing="2"
          style={{ textTransform: "uppercase" } as React.CSSProperties}
        >
          TRAPEZOID OF EXCELLENCE
        </text>
        <text
          x={xScale(vertices[1].pace) + 4}
          y={yScale(vertices[1].netRtg) + 4}
          textAnchor="start"
          fill="#2EC4B6"
          fillOpacity={0.3}
          fontSize={9}
          fontFamily="var(--font-mono)"
        >
          @RyanHammer09
        </text>

        {/* Glow filter for title contenders */}
        <defs>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#F5A623" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Team dots — render long_shot first so they appear behind */}
        {allTeams
          .slice()
          .sort((a, b) => {
            const order: Record<TeamTier, number> = {
              long_shot: 0,
              trapezoid_team: 1,
              trapezoid_elite: 2,
              title_contender: 3,
            };
            return order[a.tier] - order[b.tier];
          })
          .map((team) => {
            const cx = xScale(team.adjT);
            const cy = yScale(team.netRtg);
            const r = dotRadius(team.seed);
            const color = TIER_COLORS[team.tier];
            const isDimmed = dimmedTeams.has(team.name);
            const isHovered = hoveredTeam?.name === team.name;
            const isSelected = selectedTeam?.name === team.name;
            const isGold = team.tier === "title_contender";

            return (
              <g key={team.name}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? r * 1.5 : isSelected ? r * 1.3 : r}
                  fill={color}
                  fillOpacity={isDimmed ? 0.12 : isGold ? 0.9 : 0.75}
                  stroke={isSelected ? "#e8e9ed" : isHovered ? color : "none"}
                  strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0}
                  filter={isGold && !isDimmed ? "url(#glow-gold)" : undefined}
                  style={{
                    cursor: "pointer",
                    transition: "r 0.15s ease, fill-opacity 0.2s ease, stroke-width 0.15s ease",
                  }}
                  onMouseMove={(e) => handleMouseMove(e, team)}
                  onMouseLeave={() => setHoveredTeam(null)}
                  onClick={() =>
                    setSelectedTeam(selectedTeam?.name === team.name ? null : team)
                  }
                />
                {/* Seed label for 1-4 seeds when not dimmed */}
                {team.seed <= 4 && !isDimmed && (
                  <text
                    x={cx}
                    y={cy + (r > 10 ? 3.5 : 3)}
                    textAnchor="middle"
                    fill="#0a0b0f"
                    fontSize={r > 10 ? 9 : 7}
                    fontWeight={700}
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {team.seed}
                  </text>
                )}
              </g>
            );
          })}
      </svg>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredTeam && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute z-30 rounded-lg border border-border bg-surface px-3 py-2 shadow-xl"
            style={{
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 8,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: TIER_COLORS[hoveredTeam.tier] }}
              />
              <span className="text-sm font-semibold text-text-primary">
                {hoveredTeam.name}
              </span>
              <span className="font-mono text-xs text-text-secondary">
                ({hoveredTeam.seed})
              </span>
            </div>
            <div className="mt-1 flex gap-3 font-mono text-xs text-text-secondary">
              <span>
                KP #{hoveredTeam.kenpomRank}
              </span>
              <span>
                AdjEM {hoveredTeam.netRtg > 0 ? "+" : ""}
                {hoveredTeam.netRtg}
              </span>
              <span>Pace {hoveredTeam.adjT}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail card */}
      <AnimatePresence>
        {selectedTeam && (
          <TeamCard
            team={selectedTeam}
            onClose={() => setSelectedTeam(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export { TIER_COLORS, TIER_LABELS };

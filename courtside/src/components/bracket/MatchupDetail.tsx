"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, MessageSquare, AlertTriangle, Shield, Zap } from "lucide-react";
import { Team, BracketGame, TeamTier, UpsetRisk } from "@/types";
import { analyzeMatchup } from "@/data/matchup";
import { getTrapezoidVertices } from "@/data/trapezoid";

const TIER_COLORS: Record<TeamTier, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  long_shot: "#4a4f5a",
};

const UPSET_RISK_CONFIG: Record<UpsetRisk, { label: string; color: string; bg: string }> = {
  safe: { label: "Safe", color: "#2EC4B6", bg: "rgba(46,196,182,0.1)" },
  watch: { label: "Watch", color: "#F5A623", bg: "rgba(245,166,35,0.1)" },
  danger: { label: "Danger", color: "#FF6B35", bg: "rgba(255,107,53,0.1)" },
  likely_upset: { label: "Likely Upset", color: "#E63946", bg: "rgba(230,57,70,0.1)" },
};

const SEED_WIN_RATES: Record<string, string> = {
  "1v16": "99%", "2v15": "94%", "3v14": "85%", "4v13": "79%",
  "5v12": "65%", "6v11": "63%", "7v10": "61%", "8v9": "51%",
};

// Mini trapezoid constants
const MINI_W = 200;
const MINI_H = 120;
const MINI_M = { t: 10, r: 10, b: 10, l: 10 };
const MX_MIN = 61; const MX_MAX = 74.5;
const MY_MIN = -5; const MY_MAX = 42;

function mx(pace: number) {
  return MINI_M.l + ((pace - MX_MIN) / (MX_MAX - MX_MIN)) * (MINI_W - MINI_M.l - MINI_M.r);
}
function my(netRtg: number) {
  return MINI_M.t + ((MY_MAX - netRtg) / (MY_MAX - MY_MIN)) * (MINI_H - MINI_M.t - MINI_M.b);
}

function StatBar({
  label,
  valueA,
  valueB,
  rankA,
  rankB,
  higherIsBetter = true,
}: {
  label: string;
  valueA: number;
  valueB: number;
  rankA?: number;
  rankB?: number;
  higherIsBetter?: boolean;
}) {
  const aWins = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bWins = higherIsBetter ? valueB > valueA : valueB < valueA;
  const maxVal = Math.max(Math.abs(valueA), Math.abs(valueB));
  const barA = maxVal > 0 ? (Math.abs(valueA) / maxVal) * 100 : 50;
  const barB = maxVal > 0 ? (Math.abs(valueB) / maxVal) * 100 : 50;

  return (
    <div className="mb-2.5">
      <div className="mb-1 text-center text-[10px] text-text-secondary">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex w-16 items-center justify-end gap-1">
          {rankA !== undefined && (
            <span className="font-mono text-[9px] text-text-secondary/50">#{rankA}</span>
          )}
          <span className={`font-mono text-xs font-semibold ${aWins ? "text-text-primary" : "text-text-secondary"}`}>
            {typeof valueA === "number" ? valueA.toFixed(1) : valueA}
          </span>
        </div>
        <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-background">
          <div className="flex h-full w-1/2 justify-end">
            <div
              className="h-full rounded-l-full transition-all"
              style={{
                width: `${barA}%`,
                background: aWins ? "#2EC4B6" : "#4a4f5a",
              }}
            />
          </div>
          <div className="flex h-full w-1/2">
            <div
              className="h-full rounded-r-full transition-all"
              style={{
                width: `${barB}%`,
                background: bWins ? "#2EC4B6" : "#4a4f5a",
              }}
            />
          </div>
        </div>
        <div className="flex w-16 items-center gap-1">
          <span className={`font-mono text-xs font-semibold ${bWins ? "text-text-primary" : "text-text-secondary"}`}>
            {typeof valueB === "number" ? valueB.toFixed(1) : valueB}
          </span>
          {rankB !== undefined && (
            <span className="font-mono text-[9px] text-text-secondary/50">#{rankB}</span>
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  game: BracketGame;
  onClose: () => void;
  onAskAnalyst: (teamA: Team, teamB: Team) => void;
}

export default function MatchupDetail({ game, onClose, onAskAnalyst }: Props) {
  const teamA = game.topSeed;
  const teamB = game.bottomSeed;

  const vertices = useMemo(() => getTrapezoidVertices(), []);
  const trapPath = useMemo(
    () =>
      vertices
        .map((v, i) => `${i === 0 ? "M" : "L"}${mx(v.pace)},${my(v.netRtg)}`)
        .join(" ") + " Z",
    [vertices]
  );

  if (!teamA || !teamB) return null;

  const analysis = analyzeMatchup(teamA, teamB);
  const riskConfig = UPSET_RISK_CONFIG[analysis.upsetRisk];
  const higherSeed = teamA.seed <= teamB.seed ? teamA : teamB;
  const lowerSeed = teamA.seed <= teamB.seed ? teamB : teamA;
  const seedKey = `${higherSeed.seed}v${lowerSeed.seed}`;
  const historicalRate = SEED_WIN_RATES[seedKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary">
              {game.round} · {game.region}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ color: riskConfig.color, background: riskConfig.bg }}
            >
              {riskConfig.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <X size={14} />
          </button>
        </div>

        {/* Team names */}
        <div className="flex items-stretch border-b border-border">
          <div className="flex flex-1 flex-col items-center justify-center border-r border-border py-3">
            <span className="font-mono text-[10px] text-text-secondary">({teamA.seed})</span>
            <span className="text-sm font-bold text-text-primary">{teamA.name}</span>
            <span
              className="mt-0.5 rounded-full px-1.5 py-px text-[9px] font-bold"
              style={{ color: TIER_COLORS[teamA.tier], background: `${TIER_COLORS[teamA.tier]}15` }}
            >
              KP #{teamA.kenpomRank}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center px-3 py-3">
            <span className="font-mono text-xl font-bold text-text-primary">
              {Math.round(analysis.winProbabilityA * 100)}
            </span>
            <span className="text-[9px] text-text-secondary">vs</span>
            <span className="font-mono text-xl font-bold text-text-primary">
              {Math.round(analysis.winProbabilityB * 100)}
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center border-l border-border py-3">
            <span className="font-mono text-[10px] text-text-secondary">({teamB.seed})</span>
            <span className="text-sm font-bold text-text-primary">{teamB.name}</span>
            <span
              className="mt-0.5 rounded-full px-1.5 py-px text-[9px] font-bold"
              style={{ color: TIER_COLORS[teamB.tier], background: `${TIER_COLORS[teamB.tier]}15` }}
            >
              KP #{teamB.kenpomRank}
            </span>
          </div>
        </div>

        {/* Mini trapezoid */}
        <div className="flex items-center justify-center border-b border-border py-2">
          <svg width={MINI_W} height={MINI_H}>
            <rect width={MINI_W} height={MINI_H} fill="#0a0b0f" rx={6} />
            <path d={trapPath} fill="#2EC4B6" fillOpacity={0.06} stroke="#2EC4B6" strokeWidth={0.8} strokeDasharray="3 2" strokeOpacity={0.4} />
            {/* Team A dot */}
            <circle
              cx={mx(teamA.adjT)}
              cy={my(teamA.netRtg)}
              r={6}
              fill={TIER_COLORS[teamA.tier]}
              fillOpacity={0.9}
              stroke="#e8e9ed"
              strokeWidth={1}
            />
            <text x={mx(teamA.adjT)} y={my(teamA.netRtg) - 10} textAnchor="middle" fill="#e8e9ed" fontSize={8} fontFamily="var(--font-mono)">
              {teamA.name}
            </text>
            {/* Team B dot */}
            <circle
              cx={mx(teamB.adjT)}
              cy={my(teamB.netRtg)}
              r={6}
              fill={TIER_COLORS[teamB.tier]}
              fillOpacity={0.9}
              stroke="#e8e9ed"
              strokeWidth={1}
            />
            <text x={mx(teamB.adjT)} y={my(teamB.netRtg) + 16} textAnchor="middle" fill="#e8e9ed" fontSize={8} fontFamily="var(--font-mono)">
              {teamB.name}
            </text>
          </svg>
        </div>

        {/* Stat bars */}
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-text-secondary">{teamA.name}</span>
            <span className="text-[10px] font-semibold text-text-secondary">{teamB.name}</span>
          </div>
          <StatBar label="Offense (AdjO)" valueA={teamA.oRtg} valueB={teamB.oRtg} rankA={teamA.oRtgRank} rankB={teamB.oRtgRank} />
          <StatBar label="Defense (AdjD)" valueA={teamA.dRtg} valueB={teamB.dRtg} rankA={teamA.dRtgRank} rankB={teamB.dRtgRank} higherIsBetter={false} />
          <StatBar label="Net Rating (AdjEM)" valueA={teamA.netRtg} valueB={teamB.netRtg} />
          <StatBar label="Tempo (AdjT)" valueA={teamA.adjT} valueB={teamB.adjT} />
          <StatBar label="SOS Rank" valueA={teamA.sosNetRtgRank} valueB={teamB.sosNetRtgRank} higherIsBetter={false} />
        </div>

        {/* Insights */}
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 flex items-center gap-3">
            {historicalRate && (
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-text-secondary" />
                <span className="font-mono text-[10px] text-text-secondary">
                  {higherSeed.seed}-seed wins {historicalRate} historically
                </span>
              </div>
            )}
            {analysis.paceMismatch > 3 && (
              <div className="flex items-center gap-1">
                <Zap size={10} className="text-accent-orange" />
                <span className="font-mono text-[10px] text-accent-orange">
                  {analysis.paceMismatch.toFixed(1)} pace gap
                </span>
              </div>
            )}
          </div>
          {analysis.keyFactors.length > 0 && (
            <div className="space-y-1">
              {analysis.keyFactors.slice(0, 3).map((factor, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle size={9} className="mt-0.5 shrink-0 text-text-secondary/50" />
                  <span className="text-[11px] leading-tight text-text-secondary">{factor}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <button
            onClick={() => onAskAnalyst(teamA, teamB)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold/10 py-2 text-xs font-semibold text-accent-gold transition-colors hover:bg-accent-gold/20"
          >
            <MessageSquare size={13} />
            Ask the Analyst
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

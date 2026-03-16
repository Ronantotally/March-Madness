"use client";

import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { Team, BracketGame, TeamTier } from "@/types";
import { analyzeMatchup } from "@/data/matchup";

const TIER_COLORS: Record<TeamTier, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  long_shot: "#4a4f5a",
};

function getConfidenceColor(game: BracketGame): string {
  const { topSeed, bottomSeed } = game;
  if (!topSeed || !bottomSeed) return "#1e2028";

  const higherSeed = topSeed.seed <= bottomSeed.seed ? topSeed : bottomSeed;
  const lowerSeed = topSeed.seed <= bottomSeed.seed ? bottomSeed : topSeed;

  const adjEMGap = higherSeed.netRtg - lowerSeed.netRtg;
  const tierRank: Record<TeamTier, number> = {
    title_contender: 4,
    trapezoid_elite: 3,
    trapezoid_team: 2,
    long_shot: 1,
  };
  const higherTierRank = tierRank[higherSeed.tier];
  const lowerTierRank = tierRank[lowerSeed.tier];

  // Red: lower seed has higher tier or better KenPom rank
  if (lowerTierRank > higherTierRank || lowerSeed.kenpomRank < higherSeed.kenpomRank) {
    return "#E63946";
  }
  // Green: higher seed has better tier AND AdjEM gap > 15
  if (higherTierRank > lowerTierRank && adjEMGap > 15) {
    return "#2EC4B6";
  }
  // Yellow: tiers close or AdjEM gap < 10
  if (Math.abs(higherTierRank - lowerTierRank) <= 1 || adjEMGap < 10) {
    return "#F5A623";
  }
  return "#2EC4B6";
}

interface TeamRowProps {
  team: Team | null;
  isWinner: boolean;
  isTop: boolean;
  onClick: () => void;
  isPlayIn?: boolean;
}

function TeamRow({ team, isWinner, isTop, onClick, isPlayIn }: TeamRowProps) {
  if (!team) {
    return (
      <div
        className={`flex h-7 items-center gap-1.5 px-2 ${
          isTop ? "border-b border-border/40" : ""
        }`}
      >
        <span className="font-mono text-[10px] text-text-secondary/30">—</span>
        <span className="text-[11px] text-text-secondary/30">
          {isPlayIn ? "Play-in winner" : "TBD"}
        </span>
      </div>
    );
  }

  return (
    <motion.button
      whileHover={{ backgroundColor: "rgba(232,233,237,0.04)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex h-7 w-full items-center gap-1.5 px-2 text-left transition-colors ${
        isTop ? "border-b border-border/40" : ""
      } ${isWinner ? "bg-white/[0.03]" : ""}`}
    >
      <span className="w-4 shrink-0 font-mono text-[10px] text-text-secondary">
        {team.seed}
      </span>
      <span
        className={`flex-1 truncate text-[11px] font-medium ${
          isWinner ? "text-text-primary" : "text-text-secondary"
        }`}
      >
        {team.name}
      </span>
      {isWinner && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: TIER_COLORS[team.tier] }}
        />
      )}
    </motion.button>
  );
}

interface Props {
  game: BracketGame;
  onPick: (team: Team) => void;
  onExpand: () => void;
  compact?: boolean;
}

export default function MatchupSlot({ game, onPick, onExpand, compact }: Props) {
  const confidenceColor = getConfidenceColor(game);
  const hasMatchup = game.topSeed && game.bottomSeed;

  // Win probability preview
  let winProbTop: number | null = null;
  if (game.topSeed && game.bottomSeed) {
    const analysis = analyzeMatchup(game.topSeed, game.bottomSeed);
    winProbTop = analysis.winProbabilityA;
  }

  return (
    <div
      className={`group relative overflow-hidden rounded border border-border bg-surface ${
        compact ? "w-[160px]" : "w-[185px]"
      }`}
      style={{ borderLeftColor: confidenceColor, borderLeftWidth: 3 }}
    >
      <TeamRow
        team={game.topSeed}
        isWinner={game.winner?.name === game.topSeed?.name}
        isTop
        onClick={() => game.topSeed && onPick(game.topSeed)}
        isPlayIn={game.isPlayIn}
      />
      <TeamRow
        team={game.bottomSeed}
        isWinner={game.winner?.name === game.bottomSeed?.name}
        isTop={false}
        onClick={() => game.bottomSeed && onPick(game.bottomSeed)}
      />

      {/* Win prob bar */}
      {winProbTop !== null && (
        <div className="flex h-[2px] w-full">
          <div
            className="h-full"
            style={{
              width: `${winProbTop * 100}%`,
              background: game.topSeed ? TIER_COLORS[game.topSeed.tier] : "#4a4f5a",
              opacity: 0.5,
            }}
          />
          <div
            className="h-full"
            style={{
              width: `${(1 - winProbTop) * 100}%`,
              background: game.bottomSeed ? TIER_COLORS[game.bottomSeed.tier] : "#4a4f5a",
              opacity: 0.5,
            }}
          />
        </div>
      )}

      {/* Expand button */}
      {hasMatchup && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="absolute right-0.5 top-0.5 rounded p-0.5 text-text-secondary/0 transition-all group-hover:text-text-secondary hover:!text-text-primary"
          title="Compare matchup"
        >
          <BarChart2 size={11} />
        </button>
      )}
    </div>
  );
}

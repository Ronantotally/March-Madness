"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ChevronDown, ChevronUp, Check, Radio } from "lucide-react";
import { BracketState, BracketGame, Team } from "@/types";
import { analyzeMatchup, getUpsetRisk } from "@/data/matchup";
import { getArchetype } from "@/data/archetypes";

interface UpsetCandidate {
  game: BracketGame;
  higherSeed: Team;
  lowerSeed: Team;
  upsetProbability: number;
  reason: string;
  risk: "watch" | "danger" | "likely_upset";
  userPickedUpset: boolean | null; // null if no pick yet
}

const RISK_CONFIG = {
  watch: { label: "Watch", color: "#F5A623", glow: "rgba(245,166,35,0.15)" },
  danger: { label: "Danger", color: "#FF6B35", glow: "rgba(255,107,53,0.2)" },
  likely_upset: { label: "Likely Upset", color: "#E63946", glow: "rgba(230,57,70,0.25)" },
};

function RiskGauge({ probability, color }: { probability: number; color: string }) {
  const pct = Math.round(probability * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="h-[6px] w-16 overflow-hidden rounded-full bg-background">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="font-mono text-[11px] font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function generateUpsetReason(higher: Team, lower: Team): string {
  const adjEMGap = higher.netRtg - lower.netRtg;
  const lowerArch = getArchetype(lower);

  // Lower seed is actually the better KenPom team
  if (lower.kenpomRank < higher.kenpomRank) {
    return `${lower.name} is KenPom #${lower.kenpomRank}, ${higher.name} is #${higher.kenpomRank}. The ${lower.seed}-seed is actually the better team.`;
  }

  // Very close AdjEM
  if (adjEMGap < 3) {
    return `Only ${adjEMGap.toFixed(1)}-point AdjEM gap — this is a coin flip regardless of seeding.`;
  }

  // Lower seed has elite offense or defense
  if (lower.oRtgRank <= 15) {
    return `${lower.name} has the #${lower.oRtgRank} offense in the country. ${lowerArch.label} identity can torch anyone.`;
  }
  if (lower.dRtgRank <= 15) {
    return `${lower.name} has the #${lower.dRtgRank} defense. ${lowerArch.label} style grinds favorites into upsets.`;
  }

  // Lower seed inside trapezoid
  if (lower.insideTrapezoid && !higher.insideTrapezoid) {
    return `${lower.name} is inside the Trapezoid of KenPom; ${higher.name} is outside. The data favors the underdog.`;
  }

  return `${lower.name} (KP #${lower.kenpomRank}) has the profile to pull this off against ${higher.name} (KP #${higher.kenpomRank}).`;
}

interface Props {
  bracketState: BracketState;
  isOpen: boolean;
  onToggle: () => void;
}

export default function UpsetRadar({ bracketState, isOpen, onToggle }: Props) {
  const [showAll, setShowAll] = useState(false);

  const hasPicks = bracketState.picks.length > 0;

  const upsetCandidates = useMemo(() => {
    const candidates: UpsetCandidate[] = [];

    for (const game of Object.values(bracketState.games)) {
      if (game.round !== "R64" || !game.topSeed || !game.bottomSeed) continue;

      const higher = game.topSeed.seed <= game.bottomSeed.seed ? game.topSeed : game.bottomSeed;
      const lower = game.topSeed.seed <= game.bottomSeed.seed ? game.bottomSeed : game.topSeed;

      // Skip same-seed matchups
      if (higher.seed === lower.seed) continue;

      const risk = getUpsetRisk(higher, lower);
      if (risk === "safe") continue;

      const analysis = analyzeMatchup(game.topSeed, game.bottomSeed);
      const upsetProb = higher === game.topSeed
        ? analysis.winProbabilityB
        : analysis.winProbabilityA;

      // Only show if upset probability >= 30%
      if (upsetProb < 0.30) continue;

      let userPickedUpset: boolean | null = null;
      if (game.winner) {
        userPickedUpset = game.winner.name === lower.name;
      }

      candidates.push({
        game,
        higherSeed: higher,
        lowerSeed: lower,
        upsetProbability: upsetProb,
        reason: generateUpsetReason(higher, lower),
        risk: risk as "watch" | "danger" | "likely_upset",
        userPickedUpset,
      });
    }

    return candidates.sort((a, b) => b.upsetProbability - a.upsetProbability);
  }, [bracketState]);

  const displayCandidates = showAll ? upsetCandidates : upsetCandidates.slice(0, 5);

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-accent-red" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Upset Radar
          </span>
          {upsetCandidates.length > 0 && (
            <span className="rounded-full bg-accent-red/10 px-1.5 py-px font-mono text-[10px] font-bold text-accent-red">
              {upsetCandidates.length}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp size={14} className="text-text-secondary" />
        ) : (
          <ChevronDown size={14} className="text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {/* Banner when no picks */}
              {!hasPicks && (
                <div className="mx-4 mt-3 rounded-lg border border-accent-gold/20 bg-accent-gold/[0.06] px-3 py-2">
                  <p className="text-[11px] leading-relaxed text-text-secondary">
                    <span className="font-semibold text-accent-gold">Fill out your bracket</span>
                    {" — we'll tell you if you're missing any upsets the data sees."}
                  </p>
                </div>
              )}

              {upsetCandidates.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <AlertTriangle size={20} className="mx-auto mb-2 text-text-secondary/20" />
                  <p className="text-xs text-text-secondary">
                    No first-round matchups above the 30% upset threshold.
                  </p>
                </div>
              ) : (
                <div className="px-3 py-2">
                  {displayCandidates.map((candidate, i) => {
                    const cfg = RISK_CONFIG[candidate.risk];
                    const isTopThreat = i === 0;

                    return (
                      <motion.div
                        key={candidate.game.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative mb-2 rounded-lg border px-3 py-2.5"
                        style={{
                          borderColor: `${cfg.color}30`,
                          background: cfg.glow,
                        }}
                      >
                        {/* Pulse on highest risk */}
                        {isTopThreat && (
                          <motion.div
                            className="absolute inset-0 rounded-lg"
                            style={{ border: `1px solid ${cfg.color}` }}
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}

                        {/* Matchup line */}
                        <div className="mb-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-text-primary">
                              ({candidate.lowerSeed.seed}) {candidate.lowerSeed.name}
                            </span>
                            <span className="text-[10px] text-text-secondary">over</span>
                            <span className="text-[11px] font-medium text-text-secondary">
                              ({candidate.higherSeed.seed}) {candidate.higherSeed.name}
                            </span>
                          </div>
                          <span
                            className="rounded-full px-1.5 py-px text-[8px] font-bold uppercase"
                            style={{ color: cfg.color, background: `${cfg.color}20` }}
                          >
                            {cfg.label}
                          </span>
                        </div>

                        {/* Risk gauge */}
                        <RiskGauge probability={candidate.upsetProbability} color={cfg.color} />

                        {/* Reason */}
                        <p className="mt-1 text-[10px] leading-snug text-text-secondary">
                          {candidate.reason}
                        </p>

                        {/* User pick status */}
                        {candidate.userPickedUpset !== null && (
                          <div className="mt-1.5 flex items-center gap-1">
                            {candidate.userPickedUpset ? (
                              <>
                                <Check size={10} className="text-accent-green" />
                                <span className="text-[10px] font-medium text-accent-green">
                                  You picked {candidate.lowerSeed.name}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={10} className="text-accent-orange" />
                                <span className="text-[10px] font-medium text-accent-orange">
                                  You have {candidate.higherSeed.name} advancing but the data says {candidate.lowerSeed.name} is dangerous
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {upsetCandidates.length > 5 && (
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="w-full py-1.5 text-center text-[10px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
                    >
                      {showAll
                        ? "Show less"
                        : `Show ${upsetCandidates.length - 5} more`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

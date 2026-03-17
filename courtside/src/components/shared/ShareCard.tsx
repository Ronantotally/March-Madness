"use client";

import { useCallback, useState } from "react";
import { Share2, Trophy, AlertTriangle, TrendingUp, X } from "lucide-react";
import { BracketState, Team, TeamTier } from "@/types";
import { getBracketScore } from "@/data/bracket";

const TIER_COLORS: Record<TeamTier, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  kenpom_sleeper: "#8B5CF6",
  long_shot: "#4a4f5a",
};

interface Props {
  bracketState: BracketState;
  isOpen: boolean;
  onClose: () => void;
}

function getFinalFourTeams(state: BracketState): Team[] {
  const teams: Team[] = [];
  const f4_1 = state.games["F4-1"];
  const f4_2 = state.games["F4-2"];
  if (f4_1?.topSeed) teams.push(f4_1.topSeed);
  if (f4_1?.bottomSeed) teams.push(f4_1.bottomSeed);
  if (f4_2?.topSeed) teams.push(f4_2.topSeed);
  if (f4_2?.bottomSeed) teams.push(f4_2.bottomSeed);
  return teams;
}

function getUpsetCount(state: BracketState): number {
  return state.picks.filter((pick) => {
    const game = state.games[pick.gameId];
    if (!game?.topSeed || !game?.bottomSeed) return false;
    const higherSeed = game.topSeed.seed <= game.bottomSeed.seed ? game.topSeed : game.bottomSeed;
    return pick.winner.name !== higherSeed.name;
  }).length;
}

export default function ShareCard({ bracketState, isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const finalFour = getFinalFourTeams(bracketState);
  const upsetCount = getUpsetCount(bracketState);
  const score = getBracketScore(bracketState);
  const champion = bracketState.champion;
  const totalPicks = bracketState.picks.length;
  const chalkPct = totalPicks > 0
    ? Math.round(((totalPicks - upsetCount) / totalPicks) * 100)
    : 0;

  const shareText = `🏀 My Courtside Bracket 2026\n${champion ? `🏆 Champion: ${champion.name} (${champion.seed}-seed)` : `📋 ${totalPicks}/63 picks made`}\n${finalFour.length > 0 ? `🏟 Final Four: ${finalFour.map((t) => t.name).join(", ")}` : ""}\n📊 ${chalkPct}% chalk · ${upsetCount} upsets · ${score} pts`;

  const handleShare = useCallback(async () => {
    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Courtside Bracket 2026",
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or not supported
      }
    }
    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareText]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-xs font-semibold text-text-secondary">Share Your Bracket</span>
          <button onClick={onClose} className="rounded p-1 text-text-secondary hover:text-text-primary">
            <X size={14} />
          </button>
        </div>

        {/* Card preview */}
        <div className="bg-background p-5">
          {/* Header */}
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-gold/10">
              <Trophy size={14} className="text-accent-gold" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">Courtside 2026</p>
              <p className="text-[10px] text-text-secondary">March Madness Bracket</p>
            </div>
          </div>

          {/* Champion */}
          {champion ? (
            <div className="mb-4 rounded-lg border border-border bg-surface p-3 text-center">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary/50">
                Champion
              </p>
              <p className="text-lg font-bold text-text-primary">{champion.name}</p>
              <div className="mt-1 flex items-center justify-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: TIER_COLORS[champion.tier] }}
                />
                <span className="font-mono text-xs text-text-secondary">
                  ({champion.seed}) · KP #{champion.kenpomRank}
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-lg border border-border/50 bg-surface/50 p-3 text-center">
              <p className="text-xs text-text-secondary">Bracket in progress...</p>
              <p className="font-mono text-lg font-bold text-text-primary">{totalPicks}/63</p>
            </div>
          )}

          {/* Final Four */}
          {finalFour.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary/50">
                Final Four
              </p>
              <div className="grid grid-cols-2 gap-2">
                {finalFour.map((team) => (
                  <div
                    key={team.name}
                    className="rounded border border-border bg-surface px-2 py-1.5 text-center"
                  >
                    <span className="text-xs font-semibold text-text-primary">{team.name}</span>
                    <span className="ml-1 font-mono text-[10px] text-text-secondary">
                      ({team.seed})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={11} className="text-accent-gold" />
              <span className="font-mono text-xs font-semibold text-text-primary">{chalkPct}%</span>
              <span className="text-[10px] text-text-secondary">chalk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={11} className="text-accent-red" />
              <span className="font-mono text-xs font-semibold text-text-primary">{upsetCount}</span>
              <span className="text-[10px] text-text-secondary">upsets</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Trophy size={11} className="text-accent-green" />
              <span className="font-mono text-xs font-semibold text-text-primary">{score}</span>
              <span className="text-[10px] text-text-secondary">pts</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-border p-4">
          <button
            onClick={handleShare}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold/10 py-2.5 text-xs font-semibold text-accent-gold transition-colors hover:bg-accent-gold/20"
          >
            {copied ? (
              <>Copied to clipboard!</>
            ) : (
              <>
                <Share2 size={13} />
                Share Bracket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

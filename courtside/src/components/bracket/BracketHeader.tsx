"use client";

import { useMemo } from "react";
import { Trophy, TrendingUp, AlertTriangle, Target, RotateCcw } from "lucide-react";
import { BracketState, Team } from "@/types";
import { analyzeMatchup } from "@/data/matchup";

interface Props {
  bracketState: BracketState;
  onReset: () => void;
}

export default function BracketHeader({ bracketState, onReset }: Props) {
  const stats = useMemo(() => {
    const picks = bracketState.picks;
    const totalPicks = picks.length;

    // Count chalk picks (higher seed won)
    let chalkCount = 0;
    let upsetCount = 0;
    for (const pick of picks) {
      const game = bracketState.games[pick.gameId];
      if (!game || !game.topSeed || !game.bottomSeed) continue;
      const higherSeed = game.topSeed.seed <= game.bottomSeed.seed ? game.topSeed : game.bottomSeed;
      if (pick.winner.name === higherSeed.name) {
        chalkCount++;
      } else {
        upsetCount++;
      }
    }

    const chalkPct = totalPicks > 0 ? Math.round((chalkCount / totalPicks) * 100) : 0;

    // Title contenders in Final Four
    const f4Teams: Team[] = [];
    const f4_1 = bracketState.games["F4-1"];
    const f4_2 = bracketState.games["F4-2"];
    if (f4_1?.topSeed) f4Teams.push(f4_1.topSeed);
    if (f4_1?.bottomSeed) f4Teams.push(f4_1.bottomSeed);
    if (f4_2?.topSeed) f4Teams.push(f4_2.topSeed);
    if (f4_2?.bottomSeed) f4Teams.push(f4_2.bottomSeed);
    const titleContendersInF4 = f4Teams.filter((t) => t.tier === "title_contender").length;

    // Confidence score (when > 50% complete)
    let confidenceScore: number | null = null;
    let riskiestPick: { team: Team; opponent: Team; round: string } | null = null;

    if (totalPicks >= 32) {
      let totalAlignment = 0;
      let lowestProb = 1;

      for (const pick of picks) {
        const game = bracketState.games[pick.gameId];
        if (!game || !game.topSeed || !game.bottomSeed) continue;

        const analysis = analyzeMatchup(game.topSeed, game.bottomSeed);
        const winProb = pick.winner.name === game.topSeed.name
          ? analysis.winProbabilityA
          : analysis.winProbabilityB;

        // Framework alignment bonus
        let bonus = 0;
        if (pick.winner.insideTrapezoid) bonus += 0.1;
        if (pick.winner.meetsChampFormula) bonus += 0.15;

        totalAlignment += Math.min(1, winProb + bonus);

        if (winProb < lowestProb) {
          lowestProb = winProb;
          const opponent = pick.winner.name === game.topSeed.name ? game.bottomSeed : game.topSeed;
          riskiestPick = { team: pick.winner, opponent, round: game.round };
        }
      }

      confidenceScore = Math.round((totalAlignment / totalPicks) * 100);
    }

    return { totalPicks, chalkPct, upsetCount, titleContendersInF4, confidenceScore, riskiestPick };
  }, [bracketState]);

  return (
    <div className="mb-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Picks counter */}
          <div className="flex items-center gap-2">
            <Target size={14} className="text-accent-green" />
            <div>
              <span className="font-mono text-lg font-bold text-text-primary">
                {stats.totalPicks}
              </span>
              <span className="font-mono text-sm text-text-secondary">/63</span>
              <span className="ml-1.5 text-xs text-text-secondary">picked</span>
            </div>
          </div>

          {/* Chalk % */}
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-accent-gold" />
            <div>
              <span className="font-mono text-lg font-bold text-text-primary">
                {stats.chalkPct}%
              </span>
              <span className="ml-1.5 text-xs text-text-secondary">chalk</span>
            </div>
          </div>

          {/* Upsets */}
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-accent-red" />
            <div>
              <span className="font-mono text-lg font-bold text-text-primary">
                {stats.upsetCount}
              </span>
              <span className="ml-1.5 text-xs text-text-secondary">upsets</span>
            </div>
          </div>

          {/* Title contenders in F4 */}
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-accent-gold" />
            <div>
              <span className="font-mono text-lg font-bold text-text-primary">
                {stats.titleContendersInF4}
              </span>
              <span className="ml-1.5 text-xs text-text-secondary">contenders in F4</span>
            </div>
          </div>

          {/* Confidence score */}
          {stats.confidenceScore !== null && (
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
              <span className="text-xs text-text-secondary">Confidence</span>
              <span
                className="font-mono text-lg font-bold"
                style={{
                  color:
                    stats.confidenceScore >= 70
                      ? "#2EC4B6"
                      : stats.confidenceScore >= 50
                      ? "#F5A623"
                      : "#E63946",
                }}
              >
                {stats.confidenceScore}
              </span>
              {stats.riskiestPick && (
                <span className="text-[10px] text-text-secondary/60">
                  Riskiest: {stats.riskiestPick.team.name} over{" "}
                  {stats.riskiestPick.opponent.name} ({stats.riskiestPick.round})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>
    </div>
  );
}

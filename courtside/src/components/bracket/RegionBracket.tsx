"use client";

import { Team, BracketGame, BracketState, Round } from "@/types";
import MatchupSlot from "./MatchupSlot";

const ROUND_ORDER: Round[] = ["R64", "R32", "S16", "E8"];

interface Props {
  region: string;
  bracketState: BracketState;
  onPick: (gameId: string, team: Team) => void;
  onExpand: (game: BracketGame) => void;
}

export default function RegionBracket({ region, bracketState, onPick, onExpand }: Props) {
  // Get games for this region organized by round
  const gamesByRound: Record<Round, BracketGame[]> = {
    R64: [], R32: [], S16: [], E8: [], F4: [], CHAMP: [],
  };

  for (const game of Object.values(bracketState.games)) {
    if (game.region === region) {
      gamesByRound[game.round].push(game);
    }
  }

  // Sort games by position within each round
  for (const round of ROUND_ORDER) {
    gamesByRound[round].sort((a, b) => a.position - b.position);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      {/* Region header */}
      <h3 className="mb-3 text-center text-sm font-bold tracking-wide text-text-primary">
        {region.toUpperCase()}
      </h3>

      {/* Bracket grid */}
      <div className="flex gap-3">
        {ROUND_ORDER.map((round) => {
          const games = gamesByRound[round];
          if (games.length === 0) return null;

          // Calculate vertical spacing to align with previous round pairs
          const roundIdx = ROUND_ORDER.indexOf(round);
          const gapMultiplier = Math.pow(2, roundIdx);
          const topPad = (gapMultiplier - 1) * 30; // half of slot height × multiplier

          return (
            <div key={round} className="flex flex-col items-center">
              <div className="mb-2 text-center font-mono text-[9px] text-text-secondary/50">
                {round === "R64" ? "1st Rd" : round === "R32" ? "2nd Rd" : round === "S16" ? "Sweet 16" : "Elite 8"}
              </div>
              <div
                className="flex flex-col"
                style={{
                  gap: `${gapMultiplier * 8}px`,
                  paddingTop: topPad,
                }}
              >
                {games.map((game) => (
                  <MatchupSlot
                    key={game.id}
                    game={game}
                    onPick={(team) => onPick(game.id, team)}
                    onExpand={() => onExpand(game)}
                    compact={round !== "R64"}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

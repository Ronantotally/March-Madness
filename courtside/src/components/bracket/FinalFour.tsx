"use client";

import { Trophy } from "lucide-react";
import { Team, BracketState, TeamTier } from "@/types";
import MatchupSlot from "./MatchupSlot";
import { BracketGame } from "@/types";

const TIER_COLORS: Record<TeamTier, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  long_shot: "#4a4f5a",
};

interface Props {
  bracketState: BracketState;
  onPick: (gameId: string, team: Team) => void;
  onExpand: (game: BracketGame) => void;
}

export default function FinalFour({ bracketState, onPick, onExpand }: Props) {
  const f4_1 = bracketState.games["F4-1"];
  const f4_2 = bracketState.games["F4-2"];
  const champ = bracketState.games["CHAMP-1"];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-4 text-center text-sm font-bold tracking-wide text-text-primary">
        FINAL FOUR & CHAMPIONSHIP
      </h3>

      <div className="flex items-center justify-center gap-4">
        {/* Semifinal 1: East vs South */}
        <div className="flex flex-col items-center">
          <div className="mb-1 font-mono text-[9px] text-text-secondary/50">East / South</div>
          {f4_1 && (
            <MatchupSlot
              game={f4_1}
              onPick={(team) => onPick(f4_1.id, team)}
              onExpand={() => onExpand(f4_1)}
            />
          )}
        </div>

        {/* Championship */}
        <div className="flex flex-col items-center">
          <div className="mb-1 font-mono text-[9px] text-text-secondary/50">Championship</div>
          {champ && (
            <MatchupSlot
              game={champ}
              onPick={(team) => onPick(champ.id, team)}
              onExpand={() => onExpand(champ)}
            />
          )}
          {/* Champion display */}
          {bracketState.champion && (
            <div className="mt-3 flex flex-col items-center">
              <Trophy size={20} style={{ color: TIER_COLORS[bracketState.champion.tier] }} />
              <span className="mt-1 text-sm font-bold text-text-primary">
                {bracketState.champion.name}
              </span>
              <span className="font-mono text-[10px] text-text-secondary">Champion</span>
            </div>
          )}
        </div>

        {/* Semifinal 2: Midwest vs West */}
        <div className="flex flex-col items-center">
          <div className="mb-1 font-mono text-[9px] text-text-secondary/50">Midwest / West</div>
          {f4_2 && (
            <MatchupSlot
              game={f4_2}
              onPick={(team) => onPick(f4_2.id, team)}
              onExpand={() => onExpand(f4_2)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

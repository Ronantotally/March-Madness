"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Team, BracketGame } from "@/types";
import { createInitialBracketState, advanceTeam } from "@/data/bracket";
import RegionBracket from "@/components/bracket/RegionBracket";
import FinalFour from "@/components/bracket/FinalFour";
import BracketHeader from "@/components/bracket/BracketHeader";
import MatchupDetail from "@/components/bracket/MatchupDetail";
import { useChatContext } from "@/components/chat/ChatContext";

const REGIONS_TOP = ["East", "South"];
const REGIONS_BOTTOM = ["Midwest", "West"];

export default function BracketPage() {
  const [bracketState, setBracketState] = useState(() =>
    createInitialBracketState()
  );
  const [expandedGame, setExpandedGame] = useState<BracketGame | null>(null);
  const { askQuestion } = useChatContext();

  const handlePick = useCallback((gameId: string, team: Team) => {
    setBracketState((prev) => advanceTeam(prev, gameId, team));
  }, []);

  const handleExpand = useCallback((game: BracketGame) => {
    setExpandedGame(game);
  }, []);

  const handleReset = useCallback(() => {
    setBracketState(createInitialBracketState());
  }, []);

  const handleAskAnalyst = useCallback((teamA: Team, teamB: Team) => {
    setExpandedGame(null);
    askQuestion(
      `Break down the matchup between ${teamA.name} (${teamA.seed}-seed) and ${teamB.name} (${teamB.seed}-seed). Who wins and why?`,
      { view: "bracket", matchup: { teamA, teamB } }
    );
  }, [askQuestion]);

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-text-primary">
          Bracket Builder
        </h1>
        <p className="max-w-2xl text-sm text-text-secondary">
          Click a team to advance them. Colored borders show matchup confidence.
          Click the compare icon for detailed analysis.
        </p>
      </div>

      {/* Live stats */}
      <BracketHeader bracketState={bracketState} onReset={handleReset} />

      {/* Region brackets — 2×2 grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        {REGIONS_TOP.map((region) => (
          <RegionBracket
            key={region}
            region={region}
            bracketState={bracketState}
            onPick={handlePick}
            onExpand={handleExpand}
          />
        ))}
      </div>

      {/* Final Four */}
      <div className="mb-4">
        <FinalFour
          bracketState={bracketState}
          onPick={handlePick}
          onExpand={handleExpand}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {REGIONS_BOTTOM.map((region) => (
          <RegionBracket
            key={region}
            region={region}
            bracketState={bracketState}
            onPick={handlePick}
            onExpand={handleExpand}
          />
        ))}
      </div>

      {/* Matchup detail modal */}
      <AnimatePresence>
        {expandedGame && expandedGame.topSeed && expandedGame.bottomSeed && (
          <MatchupDetail
            game={expandedGame}
            onClose={() => setExpandedGame(null)}
            onAskAnalyst={handleAskAnalyst}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

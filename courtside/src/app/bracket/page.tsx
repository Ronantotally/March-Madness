"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Team, BracketGame } from "@/types";
import { createInitialBracketState, advanceTeam } from "@/data/bracket";
import RegionBracket from "@/components/bracket/RegionBracket";
import FinalFour from "@/components/bracket/FinalFour";
import BracketHeader from "@/components/bracket/BracketHeader";
import MatchupDetail from "@/components/bracket/MatchupDetail";
import ShareCard from "@/components/shared/ShareCard";
import { useChatContext } from "@/components/chat/ChatContext";

const REGIONS_TOP = ["East", "South"];
const REGIONS_BOTTOM = ["Midwest", "West"];

function BracketContent() {
  const searchParams = useSearchParams();
  const [bracketState, setBracketState] = useState(() =>
    createInitialBracketState()
  );
  const [expandedGame, setExpandedGame] = useState<BracketGame | null>(null);
  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const { askQuestion } = useChatContext();

  // Handle ?team= query param for cross-page navigation
  useEffect(() => {
    const teamName = searchParams.get("team");
    if (teamName) {
      setHighlightedTeam(teamName);
      const timer = setTimeout(() => setHighlightedTeam(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

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
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4 sm:py-6">
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
      <BracketHeader bracketState={bracketState} onReset={handleReset} onShare={() => setShareOpen(true)} />

      {/* Region brackets — 2×2 grid on desktop, 1-col on mobile */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {REGIONS_TOP.map((region) => (
          <RegionBracket
            key={region}
            region={region}
            bracketState={bracketState}
            onPick={handlePick}
            onExpand={handleExpand}
            highlightedTeam={highlightedTeam}
          />
        ))}
      </div>

      {/* Final Four */}
      <div className="mb-4">
        <FinalFour
          bracketState={bracketState}
          onPick={handlePick}
          onExpand={handleExpand}
          highlightedTeam={highlightedTeam}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {REGIONS_BOTTOM.map((region) => (
          <RegionBracket
            key={region}
            region={region}
            bracketState={bracketState}
            onPick={handlePick}
            onExpand={handleExpand}
            highlightedTeam={highlightedTeam}
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

      {/* Share card modal */}
      <ShareCard
        bracketState={bracketState}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

export default function BracketPage() {
  return (
    <Suspense>
      <BracketContent />
    </Suspense>
  );
}

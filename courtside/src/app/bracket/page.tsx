"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Team, BracketGame } from "@/types";
import RegionBracket from "@/components/bracket/RegionBracket";
import FinalFour from "@/components/bracket/FinalFour";
import BracketHeader from "@/components/bracket/BracketHeader";
import MatchupDetail from "@/components/bracket/MatchupDetail";
import ShareCard from "@/components/shared/ShareCard";
import TournamentIntel from "@/components/bracket/TournamentIntel";
import ChampionProfile from "@/components/bracket/ChampionProfile";
import UpsetRadar from "@/components/bracket/UpsetRadar";
import { useBracketStore, useChatStore } from "@/lib/stores";

const REGIONS_TOP = ["East", "South"];
const REGIONS_BOTTOM = ["Midwest", "West"];

function BracketContent() {
  const searchParams = useSearchParams();
  const bracketState = useBracketStore((s) => s.bracketState);
  const pick = useBracketStore((s) => s.pick);
  const reset = useBracketStore((s) => s.reset);
  const expandedGame = useBracketStore((s) => s.expandedGame);
  const setExpandedGame = useBracketStore((s) => s.setExpandedGame);
  const askQuestion = useChatStore((s) => s.askQuestion);

  const [highlightedTeam, setHighlightedTeam] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [championProfileOpen, setChampionProfileOpen] = useState(true);
  const [upsetRadarOpen, setUpsetRadarOpen] = useState(true);

  // Handle ?team= query param for cross-page navigation
  useEffect(() => {
    const teamName = searchParams.get("team");
    if (teamName) {
      setHighlightedTeam(teamName);
      const timer = setTimeout(() => setHighlightedTeam(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePick = useCallback(
    (gameId: string, team: Team) => {
      pick(gameId, team);
    },
    [pick]
  );

  const handleExpand = useCallback(
    (game: BracketGame) => {
      setExpandedGame(game);
    },
    [setExpandedGame]
  );

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleAskAnalyst = useCallback(
    (teamA: Team, teamB: Team) => {
      setExpandedGame(null);
      askQuestion(
        `Break down the matchup between ${teamA.name} (${teamA.seed}-seed) and ${teamB.name} (${teamB.seed}-seed). Who wins and why?`,
        { view: "bracket", matchup: { teamA, teamB } }
      );
    },
    [askQuestion, setExpandedGame]
  );

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

      {/* Main content: bracket + intel sidebar */}
      <div className="flex gap-4">
        {/* Bracket area */}
        <div className="min-w-0 flex-1">
          {/* Top regions */}
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

          {/* Bottom regions */}
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
        </div>

        {/* Sidebar panels — desktop only, hidden on mobile */}
        <div className="hidden w-[300px] flex-shrink-0 lg:block">
          <div className="sticky top-20 space-y-3">
            <UpsetRadar
              bracketState={bracketState}
              isOpen={upsetRadarOpen}
              onToggle={() => setUpsetRadarOpen(!upsetRadarOpen)}
            />
            <ChampionProfile
              bracketState={bracketState}
              isOpen={championProfileOpen}
              onToggle={() => setChampionProfileOpen(!championProfileOpen)}
            />
            <TournamentIntel />
          </div>
        </div>
      </div>

      {/* Mobile panels — below bracket on small screens */}
      <div className="mt-4 space-y-3 lg:hidden">
        <UpsetRadar
          bracketState={bracketState}
          isOpen={upsetRadarOpen}
          onToggle={() => setUpsetRadarOpen(!upsetRadarOpen)}
        />
        <ChampionProfile
          bracketState={bracketState}
          isOpen={championProfileOpen}
          onToggle={() => setChampionProfileOpen(!championProfileOpen)}
        />
        <TournamentIntel />
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

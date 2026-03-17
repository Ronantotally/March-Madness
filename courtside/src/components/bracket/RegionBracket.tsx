"use client";

import { Team, BracketGame, BracketState, Round } from "@/types";
import MatchupSlot from "./MatchupSlot";

const ROUND_ORDER: Round[] = ["R64", "R32", "S16", "E8"];
const ROUND_LABELS: Record<string, string> = {
  R64: "1st Rd",
  R32: "2nd Rd",
  S16: "Sweet 16",
  E8: "Elite 8",
};

const ROW_H = 66; // slot ~58px + 8px breathing room

interface Props {
  region: string;
  bracketState: BracketState;
  onPick: (gameId: string, team: Team) => void;
  onExpand: (game: BracketGame) => void;
  highlightedTeam?: string | null;
}

/**
 * Bracket connector lines between rounds.
 * Always draws: two horizontal stubs at 25%/75% height → vertical bar → exit at 50%.
 * Works for any row span because the geometry is always the same ratio.
 */
function BracketConnector() {
  return (
    <div className="relative h-full w-6">
      {/* Horizontal from top game → vertical */}
      <div
        className="absolute left-0 h-px bg-border/50"
        style={{ top: "25%", width: "50%" }}
      />
      {/* Horizontal from bottom game → vertical */}
      <div
        className="absolute left-0 h-px bg-border/50"
        style={{ top: "75%", width: "50%" }}
      />
      {/* Vertical bar */}
      <div
        className="absolute w-px bg-border/50"
        style={{ top: "25%", height: "50%", left: "50%" }}
      />
      {/* Exit horizontal → next round */}
      <div
        className="absolute right-0 h-px bg-border/50"
        style={{ top: "50%", width: "50%" }}
      />
    </div>
  );
}

export default function RegionBracket({
  region,
  bracketState,
  onPick,
  onExpand,
  highlightedTeam,
}: Props) {
  const gamesByRound: Record<Round, BracketGame[]> = {
    R64: [],
    R32: [],
    S16: [],
    E8: [],
    F4: [],
    CHAMP: [],
  };

  for (const game of Object.values(bracketState.games)) {
    if (game.region === region) {
      gamesByRound[game.round].push(game);
    }
  }

  for (const round of ROUND_ORDER) {
    gamesByRound[round].sort((a, b) => a.position - b.position);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-3 sm:p-4">
      <h3 className="mb-3 text-center text-sm font-bold tracking-wide text-text-primary">
        {region.toUpperCase()}
      </h3>

      {/* CSS Grid bracket — 4 game columns + 3 connector columns, 8 game rows + 1 header row */}
      <div
        className="overflow-x-auto pb-2"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 24px auto 24px auto 24px auto",
          gridTemplateRows: `auto repeat(8, ${ROW_H}px)`,
          columnGap: 0,
          rowGap: 0,
        }}
      >
        {/* ── Round headers (row 1) ── */}
        {ROUND_ORDER.map((round, i) => (
          <div
            key={`hdr-${round}`}
            className="flex items-end justify-center pb-2 font-mono text-[9px] text-text-secondary/50"
            style={{ gridColumn: i * 2 + 1, gridRow: 1 }}
          >
            {ROUND_LABELS[round]}
          </div>
        ))}

        {/* ── R64 games (col 1, rows 2-9) ── */}
        {gamesByRound.R64.map((game, i) => (
          <div
            key={game.id}
            style={{
              gridColumn: 1,
              gridRow: i + 2,
              alignSelf: "center",
            }}
          >
            <MatchupSlot
              game={game}
              onPick={(team) => onPick(game.id, team)}
              onExpand={() => onExpand(game)}
              highlightedTeam={highlightedTeam}
            />
          </div>
        ))}

        {/* ── Connectors R64→R32 (col 2) ── */}
        {[0, 1, 2, 3].map((j) => (
          <div
            key={`c1-${j}`}
            style={{
              gridColumn: 2,
              gridRow: `${2 * j + 2} / ${2 * j + 4}`,
            }}
          >
            <BracketConnector />
          </div>
        ))}

        {/* ── R32 games (col 3, each spans 2 rows) ── */}
        {gamesByRound.R32.map((game, j) => (
          <div
            key={game.id}
            style={{
              gridColumn: 3,
              gridRow: `${2 * j + 2} / ${2 * j + 4}`,
              alignSelf: "center",
            }}
          >
            <MatchupSlot
              game={game}
              onPick={(team) => onPick(game.id, team)}
              onExpand={() => onExpand(game)}
              compact
              highlightedTeam={highlightedTeam}
            />
          </div>
        ))}

        {/* ── Connectors R32→S16 (col 4) ── */}
        {[0, 1].map((k) => (
          <div
            key={`c2-${k}`}
            style={{
              gridColumn: 4,
              gridRow: `${4 * k + 2} / ${4 * k + 6}`,
            }}
          >
            <BracketConnector />
          </div>
        ))}

        {/* ── S16 games (col 5, each spans 4 rows) ── */}
        {gamesByRound.S16.map((game, k) => (
          <div
            key={game.id}
            style={{
              gridColumn: 5,
              gridRow: `${4 * k + 2} / ${4 * k + 6}`,
              alignSelf: "center",
            }}
          >
            <MatchupSlot
              game={game}
              onPick={(team) => onPick(game.id, team)}
              onExpand={() => onExpand(game)}
              compact
              highlightedTeam={highlightedTeam}
            />
          </div>
        ))}

        {/* ── Connector S16→E8 (col 6, spans all 8 rows) ── */}
        <div style={{ gridColumn: 6, gridRow: "2 / 10" }}>
          <BracketConnector />
        </div>

        {/* ── E8 game (col 7, spans all 8 rows) ── */}
        {gamesByRound.E8.map((game) => (
          <div
            key={game.id}
            style={{
              gridColumn: 7,
              gridRow: "2 / 10",
              alignSelf: "center",
            }}
          >
            <MatchupSlot
              game={game}
              onPick={(team) => onPick(game.id, team)}
              onExpand={() => onExpand(game)}
              compact
              highlightedTeam={highlightedTeam}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Team, BracketGame, BracketState, BracketPick, Round } from "@/types";
import { getTeam } from "./teamUtils";

const ROUNDS: Round[] = ["R64", "R32", "S16", "E8", "F4", "CHAMP"];
const REGIONS = ["East", "South", "Midwest", "West"];

interface MatchupDef {
  topSeed: string;
  bottomSeed: string;
  isPlayIn?: boolean;
  playInTeams?: string[];
}

// Real 2026 first-round matchups by region
const FIRST_ROUND: Record<string, MatchupDef[]> = {
  East: [
    { topSeed: "Duke", bottomSeed: "Siena" },
    { topSeed: "Ohio St.", bottomSeed: "TCU" },
    { topSeed: "St. John's", bottomSeed: "Northern Iowa" },
    { topSeed: "Kansas", bottomSeed: "Cal Baptist" },
    { topSeed: "Louisville", bottomSeed: "South Florida" },
    { topSeed: "UCLA", bottomSeed: "UCF" },
    { topSeed: "Michigan St.", bottomSeed: "N. Dakota St." },
    { topSeed: "UConn", bottomSeed: "Furman" },
  ],
  South: [
    { topSeed: "Florida", bottomSeed: "Lehigh", isPlayIn: true, playInTeams: ["Lehigh", "Prairie View A&M"] },
    { topSeed: "Clemson", bottomSeed: "Iowa" },
    { topSeed: "Vanderbilt", bottomSeed: "McNeese" },
    { topSeed: "Nebraska", bottomSeed: "Troy" },
    { topSeed: "North Carolina", bottomSeed: "VCU" },
    { topSeed: "Saint Mary's", bottomSeed: "Texas A&M" },
    { topSeed: "Illinois", bottomSeed: "Penn" },
    { topSeed: "Houston", bottomSeed: "Idaho" },
  ],
  Midwest: [
    { topSeed: "Michigan", bottomSeed: "UMBC", isPlayIn: true, playInTeams: ["UMBC", "Howard"] },
    { topSeed: "Georgia", bottomSeed: "Saint Louis" },
    { topSeed: "Texas Tech", bottomSeed: "Akron" },
    { topSeed: "Alabama", bottomSeed: "Hofstra" },
    { topSeed: "Tennessee", bottomSeed: "SMU", isPlayIn: true, playInTeams: ["SMU", "Miami OH"] },
    { topSeed: "Kentucky", bottomSeed: "Santa Clara" },
    { topSeed: "Virginia", bottomSeed: "Wright St." },
    { topSeed: "Iowa St.", bottomSeed: "Tennessee St." },
  ],
  West: [
    { topSeed: "Arizona", bottomSeed: "LIU" },
    { topSeed: "Villanova", bottomSeed: "Utah St." },
    { topSeed: "Wisconsin", bottomSeed: "High Point" },
    { topSeed: "Arkansas", bottomSeed: "Hawaii" },
    { topSeed: "BYU", bottomSeed: "N.C. State", isPlayIn: true, playInTeams: ["N.C. State", "Texas"] },
    { topSeed: "Miami FL", bottomSeed: "Missouri" },
    { topSeed: "Gonzaga", bottomSeed: "Kennesaw St." },
    { topSeed: "Purdue", bottomSeed: "Queens" },
  ],
};

/**
 * Get first-round matchups for a given region, resolved to Team objects.
 */
export function getFirstRoundMatchups(region: string): BracketGame[] {
  const matchups = FIRST_ROUND[region];
  if (!matchups) return [];

  return matchups.map((m, i) => {
    const topTeam = getTeam(m.topSeed) ?? null;
    const bottomTeam = getTeam(m.bottomSeed) ?? null;
    const playInTeams = m.playInTeams
      ?.map((name) => getTeam(name))
      .filter((t): t is Team => t !== undefined);

    return {
      id: `${region}-R64-${i + 1}`,
      round: "R64" as Round,
      region,
      position: i + 1,
      topSeed: topTeam,
      bottomSeed: bottomTeam,
      winner: null,
      isPlayIn: m.isPlayIn ?? false,
      playInTeams,
    };
  });
}

/**
 * Creates a fresh bracket state with all first-round games populated.
 */
export function createInitialBracketState(): BracketState {
  const games: Record<string, BracketGame> = {};

  // Populate R64 games
  for (const region of REGIONS) {
    const regionGames = getFirstRoundMatchups(region);
    for (const game of regionGames) {
      games[game.id] = game;
    }
  }

  // Create empty games for subsequent rounds
  const gamesPerRegion: Record<Round, number> = {
    R64: 8,
    R32: 4,
    S16: 2,
    E8: 1,
    F4: 0,
    CHAMP: 0,
  };

  for (const region of REGIONS) {
    for (const round of ROUNDS.slice(1, 4)) {
      const count = gamesPerRegion[round];
      for (let i = 1; i <= count; i++) {
        const id = `${region}-${round}-${i}`;
        games[id] = {
          id,
          round,
          region,
          position: i,
          topSeed: null,
          bottomSeed: null,
          winner: null,
          isPlayIn: false,
        };
      }
    }
  }

  // Final Four (2 games)
  games["F4-1"] = {
    id: "F4-1",
    round: "F4",
    region: "Final Four",
    position: 1,
    topSeed: null,
    bottomSeed: null,
    winner: null,
    isPlayIn: false,
  };
  games["F4-2"] = {
    id: "F4-2",
    round: "F4",
    region: "Final Four",
    position: 2,
    topSeed: null,
    bottomSeed: null,
    winner: null,
    isPlayIn: false,
  };

  // Championship
  games["CHAMP-1"] = {
    id: "CHAMP-1",
    round: "CHAMP",
    region: "Championship",
    position: 1,
    topSeed: null,
    bottomSeed: null,
    winner: null,
    isPlayIn: false,
  };

  return { games, picks: [], champion: null };
}

/**
 * Advance a team as the winner of a game, propagating to the next round.
 */
export function advanceTeam(
  state: BracketState,
  gameId: string,
  winner: Team
): BracketState {
  const newState: BracketState = {
    games: { ...state.games },
    picks: [...state.picks],
    champion: state.champion,
  };

  const game = newState.games[gameId];
  if (!game) return newState;

  // Set winner
  newState.games[gameId] = { ...game, winner };

  // Record pick
  const existingPickIndex = newState.picks.findIndex((p) => p.gameId === gameId);
  const pick: BracketPick = { gameId, winner, round: game.round };
  if (existingPickIndex >= 0) {
    newState.picks[existingPickIndex] = pick;
  } else {
    newState.picks.push(pick);
  }

  // Propagate to next round
  const nextGameId = getNextGameId(gameId);
  if (nextGameId && newState.games[nextGameId]) {
    const nextGame = { ...newState.games[nextGameId] };
    const isTopSlot = isTopSlotInNextRound(gameId);
    if (isTopSlot) {
      nextGame.topSeed = winner;
    } else {
      nextGame.bottomSeed = winner;
    }
    newState.games[nextGameId] = nextGame;
  }

  // Check for champion
  if (game.round === "CHAMP") {
    newState.champion = winner;
  }

  return newState;
}

function getNextGameId(gameId: string): string | null {
  const parts = gameId.split("-");

  // Final Four → Championship
  if (parts[0] === "F4") {
    return "CHAMP-1";
  }

  // Elite 8 → Final Four
  if (parts[1] === "E8") {
    const region = parts[0];
    // East/South → F4-1, Midwest/West → F4-2
    return region === "East" || region === "South" ? "F4-1" : "F4-2";
  }

  // Region rounds: R64 → R32 → S16 → E8
  const region = parts[0];
  const round = parts[1] as Round;
  const position = parseInt(parts[2]);

  const nextRound = ROUNDS[ROUNDS.indexOf(round) + 1];
  if (!nextRound) return null;

  const nextPosition = Math.ceil(position / 2);
  return `${region}-${nextRound}-${nextPosition}`;
}

function isTopSlotInNextRound(gameId: string): boolean {
  const parts = gameId.split("-");

  if (parts[0] === "F4") {
    return parts[1] === "1";
  }

  if (parts[1] === "E8") {
    const region = parts[0];
    return region === "East" || region === "Midwest";
  }

  const position = parseInt(parts[2] ?? parts[1]);
  return position % 2 === 1;
}

/**
 * Score a bracket based on standard ESPN scoring.
 * R64=10, R32=20, S16=40, E8=80, F4=160, CHAMP=320
 */
export function getBracketScore(state: BracketState): number {
  const pointsByRound: Record<Round, number> = {
    R64: 10,
    R32: 20,
    S16: 40,
    E8: 80,
    F4: 160,
    CHAMP: 320,
  };

  return state.picks.reduce((score, pick) => {
    if (pick.winner) {
      return score + (pointsByRound[pick.round] ?? 0);
    }
    return score;
  }, 0);
}

export function getAllRegions(): string[] {
  return REGIONS;
}

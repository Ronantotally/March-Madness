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
// Order: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15 (standard NCAA bracket)
const FIRST_ROUND: Record<string, MatchupDef[]> = {
  East: [
    { topSeed: "Duke", bottomSeed: "Siena" },           // 1v16
    { topSeed: "Ohio St.", bottomSeed: "TCU" },          // 8v9
    { topSeed: "St. John's", bottomSeed: "Northern Iowa" }, // 5v12
    { topSeed: "Kansas", bottomSeed: "Cal Baptist" },    // 4v13
    { topSeed: "Louisville", bottomSeed: "South Florida" }, // 6v11
    { topSeed: "Michigan St.", bottomSeed: "N. Dakota St." }, // 3v14
    { topSeed: "UCLA", bottomSeed: "UCF" },              // 7v10
    { topSeed: "UConn", bottomSeed: "Furman" },          // 2v15
  ],
  South: [
    { topSeed: "Florida", bottomSeed: "Lehigh", isPlayIn: true, playInTeams: ["Lehigh", "Prairie View A&M"] }, // 1v16
    { topSeed: "Clemson", bottomSeed: "Iowa" },          // 8v9
    { topSeed: "Vanderbilt", bottomSeed: "McNeese" },    // 5v12
    { topSeed: "Nebraska", bottomSeed: "Troy" },         // 4v13
    { topSeed: "North Carolina", bottomSeed: "VCU" },    // 6v11
    { topSeed: "Illinois", bottomSeed: "Penn" },         // 3v14
    { topSeed: "Saint Mary's", bottomSeed: "Texas A&M" }, // 7v10
    { topSeed: "Houston", bottomSeed: "Idaho" },         // 2v15
  ],
  Midwest: [
    { topSeed: "Michigan", bottomSeed: "UMBC", isPlayIn: true, playInTeams: ["UMBC", "Howard"] }, // 1v16
    { topSeed: "Georgia", bottomSeed: "Saint Louis" },   // 8v9
    { topSeed: "Texas Tech", bottomSeed: "Akron" },      // 5v12
    { topSeed: "Alabama", bottomSeed: "Hofstra" },       // 4v13
    { topSeed: "Tennessee", bottomSeed: "SMU", isPlayIn: true, playInTeams: ["SMU", "Miami OH"] }, // 6v11
    { topSeed: "Virginia", bottomSeed: "Wright St." },   // 3v14
    { topSeed: "Kentucky", bottomSeed: "Santa Clara" },  // 7v10
    { topSeed: "Iowa St.", bottomSeed: "Tennessee St." }, // 2v15
  ],
  West: [
    { topSeed: "Arizona", bottomSeed: "LIU" },          // 1v16
    { topSeed: "Villanova", bottomSeed: "Utah St." },    // 8v9
    { topSeed: "Wisconsin", bottomSeed: "High Point" },  // 5v12
    { topSeed: "Arkansas", bottomSeed: "Hawaii" },       // 4v13
    { topSeed: "BYU", bottomSeed: "N.C. State", isPlayIn: true, playInTeams: ["N.C. State", "Texas"] }, // 6v11
    { topSeed: "Gonzaga", bottomSeed: "Kennesaw St." },  // 3v14
    { topSeed: "Miami FL", bottomSeed: "Missouri" },     // 7v10
    { topSeed: "Purdue", bottomSeed: "Queens" },         // 2v15
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
 * If the pick changed, cascade-clears any downstream picks that depended on the old winner.
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

  const oldWinner = game.winner;

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

  // Cascade clear downstream if the winner changed
  if (oldWinner && oldWinner.name !== winner.name) {
    cascadeClear(newState, gameId, oldWinner);
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

/**
 * Recursively clear a team from all downstream games when a pick is changed.
 */
function cascadeClear(state: BracketState, fromGameId: string, oldTeam: Team): void {
  const nextId = getNextGameId(fromGameId);
  if (!nextId || !state.games[nextId]) return;

  const nextGame = { ...state.games[nextId] };
  let changed = false;

  if (nextGame.topSeed?.name === oldTeam.name) {
    nextGame.topSeed = null;
    changed = true;
  }
  if (nextGame.bottomSeed?.name === oldTeam.name) {
    nextGame.bottomSeed = null;
    changed = true;
  }
  if (nextGame.winner?.name === oldTeam.name) {
    nextGame.winner = null;
    state.picks = state.picks.filter((p) => p.gameId !== nextId);
    changed = true;
  }

  state.games[nextId] = nextGame;

  if (nextId === "CHAMP-1" && state.champion?.name === oldTeam.name) {
    state.champion = null;
  }

  if (changed) {
    cascadeClear(state, nextId, oldTeam);
  }
}

export function getNextGameId(gameId: string): string | null {
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

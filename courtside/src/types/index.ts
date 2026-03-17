export type TeamTier = "title_contender" | "trapezoid_elite" | "trapezoid_team" | "kenpom_sleeper" | "long_shot";

export interface Team {
  kenpomRank: number;
  name: string;
  conference: string;
  record: string;
  netRtg: number;
  oRtg: number;
  oRtgRank: number;
  dRtg: number;
  dRtgRank: number;
  adjT: number;
  adjTRank: number;
  luck: number;
  seed: number;
  region: string;
  sosNetRtgRank: number;
  meetsChampFormula: boolean;
  meetsExpandedCriteria: boolean;
  insideTrapezoid: boolean;
  tier: TeamTier;
}

export interface TrapezoidVertex {
  pace: number;
  netRtg: number;
}

export interface TrapezoidBoundary {
  topLeft: TrapezoidVertex;
  topRight: TrapezoidVertex;
  bottomRight: TrapezoidVertex;
  bottomLeft: TrapezoidVertex;
  credit: string;
  note: string;
}

export interface ChampionshipFormula {
  adjORankMax: number;
  adjDRankMax: number;
  overallRankMax: number;
  sosRankMax: number;
  note: string;
}

export interface TeamsData {
  season: string;
  lastUpdated: string;
  dataSource: string;
  trapezoidSource: string;
  trapezoidBoundary: TrapezoidBoundary;
  championshipFormula: ChampionshipFormula;
  teams: Team[];
}

export interface TrapezoidPosition {
  pace: number;
  netRtg: number;
  inside: boolean;
  distance: number;
}

export interface MatchupEdge {
  category: string;
  teamAValue: number;
  teamBValue: number;
  advantage: "A" | "B" | "even";
  magnitude: number;
}

export interface MatchupAnalysis {
  teamA: Team;
  teamB: Team;
  winProbabilityA: number;
  winProbabilityB: number;
  paceMismatch: number;
  edges: MatchupEdge[];
  upsetRisk: UpsetRisk;
  frameworkAlignment: {
    teamATrapezoid: boolean;
    teamBTrapezoid: boolean;
    teamAChampFormula: boolean;
    teamBChampFormula: boolean;
  };
  keyFactors: string[];
}

export type UpsetRisk = "safe" | "watch" | "danger" | "likely_upset";

export type Round = "R64" | "R32" | "S16" | "E8" | "F4" | "CHAMP";

export interface BracketGame {
  id: string;
  round: Round;
  region: string;
  position: number;
  topSeed: Team | null;
  bottomSeed: Team | null;
  winner: Team | null;
  isPlayIn: boolean;
  playInTeams?: Team[];
}

export interface BracketPick {
  gameId: string;
  winner: Team;
  round: Round;
}

export interface BracketState {
  games: Record<string, BracketGame>;
  picks: BracketPick[];
  champion: Team | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

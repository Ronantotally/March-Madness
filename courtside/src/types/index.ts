export interface Team {
  id: number;
  name: string;
  seed: number;
  region: string;
  record: string;
  kenpomRank: number;
  adjO: number; // Adjusted Offensive Efficiency
  adjD: number; // Adjusted Defensive Efficiency
  adjT: number; // Adjusted Tempo
  sos: number; // Strength of Schedule
  conference: string;
  trapezoidScore?: number;
  kenpomEligible?: boolean;
}

export interface TrapezoidBoundary {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface Matchup {
  teamA: Team;
  teamB: Team;
  round: number;
  region: string;
}

export interface BracketSlot {
  position: number;
  round: number;
  team: Team | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

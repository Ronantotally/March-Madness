import { Team } from "@/types";

export type Archetype =
  | "defensive_fortress"
  | "offensive_juggernaut"
  | "two_way_monster"
  | "defensive_grinder"
  | "run_and_gun"
  | "pace_controller"
  | "balanced_attack"
  | "offense_first"
  | "defense_first"
  | "mid_major_menace"
  | "cinderella"
  | "wild_card";

export interface ArchetypeInfo {
  key: Archetype;
  label: string;
  emoji: string;
  color: string;
  category: "defensive" | "offensive" | "balanced" | "underdog" | "neutral";
}

const ARCHETYPE_MAP: Record<Archetype, ArchetypeInfo> = {
  defensive_fortress: {
    key: "defensive_fortress",
    label: "Defensive Fortress",
    emoji: "🛡️",
    color: "#E63946",
    category: "defensive",
  },
  offensive_juggernaut: {
    key: "offensive_juggernaut",
    label: "Offensive Juggernaut",
    emoji: "🔥",
    color: "#FF6B35",
    category: "offensive",
  },
  two_way_monster: {
    key: "two_way_monster",
    label: "Two-Way Monster",
    emoji: "⭐",
    color: "#F5A623",
    category: "balanced",
  },
  defensive_grinder: {
    key: "defensive_grinder",
    label: "Defensive Grinder",
    emoji: "🛡️",
    color: "#E63946",
    category: "defensive",
  },
  run_and_gun: {
    key: "run_and_gun",
    label: "Run & Gun",
    emoji: "🔥",
    color: "#FF6B35",
    category: "offensive",
  },
  pace_controller: {
    key: "pace_controller",
    label: "Pace Controller",
    emoji: "🛡️",
    color: "#E63946",
    category: "defensive",
  },
  balanced_attack: {
    key: "balanced_attack",
    label: "Balanced Attack",
    emoji: "⭐",
    color: "#F5A623",
    category: "balanced",
  },
  offense_first: {
    key: "offense_first",
    label: "Offense-First",
    emoji: "🔥",
    color: "#FF6B35",
    category: "offensive",
  },
  defense_first: {
    key: "defense_first",
    label: "Defense-First",
    emoji: "🛡️",
    color: "#E63946",
    category: "defensive",
  },
  mid_major_menace: {
    key: "mid_major_menace",
    label: "Mid-Major Menace",
    emoji: "✨",
    color: "#8B5CF6",
    category: "underdog",
  },
  cinderella: {
    key: "cinderella",
    label: "Cinderella",
    emoji: "✨",
    color: "#8B5CF6",
    category: "underdog",
  },
  wild_card: {
    key: "wild_card",
    label: "Wild Card",
    emoji: "🎲",
    color: "#4a4f5a",
    category: "neutral",
  },
};

export function getArchetype(team: Team): ArchetypeInfo {
  let key: Archetype;

  if (team.dRtgRank <= 10) {
    key = "defensive_fortress";
  } else if (team.oRtgRank <= 10) {
    key = "offensive_juggernaut";
  } else if (team.oRtgRank <= 20 && team.dRtgRank <= 20) {
    key = "two_way_monster";
  } else if (team.dRtgRank <= 30 && team.oRtgRank > 50) {
    key = "defensive_grinder";
  } else if (team.adjT >= 70 && team.oRtgRank <= 30) {
    key = "run_and_gun";
  } else if (team.adjT <= 65 && team.dRtgRank <= 30) {
    key = "pace_controller";
  } else if (team.oRtgRank <= 40 && team.dRtgRank <= 40) {
    key = "balanced_attack";
  } else if (team.oRtgRank <= 30 && team.dRtgRank > 60) {
    key = "offense_first";
  } else if (team.dRtgRank <= 30 && team.oRtgRank > 60) {
    key = "defense_first";
  } else if (
    team.kenpomRank >= 60 &&
    team.seed <= 12 &&
    (team.oRtgRank <= 50 || team.dRtgRank <= 50)
  ) {
    key = "mid_major_menace";
  } else if (team.seed >= 13) {
    key = "cinderella";
  } else {
    key = "wild_card";
  }

  return ARCHETYPE_MAP[key];
}

export function getArchetypeDescription(team: Team, info: ArchetypeInfo): string {
  switch (info.key) {
    case "defensive_fortress":
      return `Top-10 defense in the country (#${team.dRtgRank} AdjD). They suffocate opponents.`;
    case "offensive_juggernaut":
      return `Top-10 offense in the country (#${team.oRtgRank} AdjO). They can score on anyone.`;
    case "two_way_monster":
      return `Elite on both ends — #${team.oRtgRank} offense, #${team.dRtgRank} defense. Complete team.`;
    case "defensive_grinder":
      return `Strong defense (#${team.dRtgRank}) carries a limited offense (#${team.oRtgRank}). Ugly wins are still wins.`;
    case "run_and_gun":
      return `Fast-paced (#${team.adjTRank} tempo) with a potent offense (#${team.oRtgRank}). They want to run you off the floor.`;
    case "pace_controller":
      return `Slow tempo (#${team.adjTRank}) with stout defense (#${team.dRtgRank}). They dictate the game's rhythm.`;
    case "balanced_attack":
      return `Solid on both ends — #${team.oRtgRank} offense, #${team.dRtgRank} defense. No glaring weaknesses.`;
    case "offense_first":
      return `Strong offense (#${team.oRtgRank}) but vulnerable defense (#${team.dRtgRank}). Live by the sword.`;
    case "defense_first":
      return `Stout defense (#${team.dRtgRank}) but limited offense (#${team.oRtgRank}). Need low-scoring games.`;
    case "mid_major_menace":
      return `Lower-seeded but dangerous — KenPom #${team.kenpomRank} as a ${team.seed}-seed. Don't sleep on them.`;
    case "cinderella":
      return `${team.seed}-seed longshot. Anything can happen in March.`;
    case "wild_card":
      return `Hard to categorize — no elite strength but no fatal flaw either.`;
  }
}

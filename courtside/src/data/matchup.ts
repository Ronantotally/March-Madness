import { Team, MatchupAnalysis, MatchupEdge, UpsetRisk } from "@/types";

// Historical upset rates by seed matchup (higher seed vs lower seed)
const UPSET_RATES: Record<string, number> = {
  "1v16": 0.01,
  "2v15": 0.06,
  "3v14": 0.15,
  "4v13": 0.21,
  "5v12": 0.35,
  "6v11": 0.37,
  "7v10": 0.39,
  "8v9": 0.49,
};

/**
 * Logistic win probability model based on AdjEM (netRtg) difference.
 * Uses standard logistic function calibrated to college basketball.
 * A netRtg gap of ~10 corresponds to roughly 75% win probability.
 */
function logisticWinProbability(netRtgDiff: number): number {
  // k calibrated so that 10-point AdjEM gap ≈ 75% win prob
  const k = 0.1;
  return 1 / (1 + Math.exp(-k * netRtgDiff));
}

/**
 * Full matchup analysis between two teams.
 */
export function analyzeMatchup(teamA: Team, teamB: Team): MatchupAnalysis {
  const netRtgDiff = teamA.netRtg - teamB.netRtg;
  const winProbA = logisticWinProbability(netRtgDiff);

  const edges = computeEdges(teamA, teamB);
  const paceMismatch = Math.abs(teamA.adjT - teamB.adjT);

  // Determine which is higher/lower seed for upset risk
  const [higher, lower] =
    teamA.seed <= teamB.seed ? [teamA, teamB] : [teamB, teamA];
  const upsetRisk = getUpsetRisk(higher, lower);

  const keyFactors = generateKeyFactors(teamA, teamB, edges, paceMismatch);

  return {
    teamA,
    teamB,
    winProbabilityA: Math.round(winProbA * 1000) / 1000,
    winProbabilityB: Math.round((1 - winProbA) * 1000) / 1000,
    paceMismatch: Math.round(paceMismatch * 10) / 10,
    edges,
    upsetRisk,
    frameworkAlignment: {
      teamATrapezoid: teamA.insideTrapezoid,
      teamBTrapezoid: teamB.insideTrapezoid,
      teamAChampFormula: teamA.meetsChampFormula,
      teamBChampFormula: teamB.meetsChampFormula,
    },
    keyFactors,
  };
}

function computeEdges(teamA: Team, teamB: Team): MatchupEdge[] {
  const categories: {
    category: string;
    aVal: number;
    bVal: number;
    higherIsBetter: boolean;
  }[] = [
    { category: "Overall (KenPom)", aVal: teamA.kenpomRank, bVal: teamB.kenpomRank, higherIsBetter: false },
    { category: "Net Rating (AdjEM)", aVal: teamA.netRtg, bVal: teamB.netRtg, higherIsBetter: true },
    { category: "Offense (AdjO)", aVal: teamA.oRtg, bVal: teamB.oRtg, higherIsBetter: true },
    { category: "Defense (AdjD)", aVal: teamA.dRtg, bVal: teamB.dRtg, higherIsBetter: false },
    { category: "Tempo (AdjT)", aVal: teamA.adjT, bVal: teamB.adjT, higherIsBetter: true },
    { category: "Strength of Schedule", aVal: teamA.sosNetRtgRank, bVal: teamB.sosNetRtgRank, higherIsBetter: false },
  ];

  return categories.map(({ category, aVal, bVal, higherIsBetter }) => {
    const diff = higherIsBetter ? aVal - bVal : bVal - aVal;
    const threshold = 0.5;
    let advantage: "A" | "B" | "even";
    if (diff > threshold) advantage = "A";
    else if (diff < -threshold) advantage = "B";
    else advantage = "even";

    return {
      category,
      teamAValue: aVal,
      teamBValue: bVal,
      advantage,
      magnitude: Math.round(Math.abs(diff) * 100) / 100,
    };
  });
}

/**
 * Determines upset risk level for a matchup between a higher-seeded and lower-seeded team.
 */
export function getUpsetRisk(higher: Team, lower: Team): UpsetRisk {
  const adjEMGap = higher.netRtg - lower.netRtg;

  // Get historical base rate
  const seedKey = `${higher.seed}v${lower.seed}`;
  const baseRate = UPSET_RATES[seedKey] ?? 0.25;

  // Adjust based on tier mismatch
  const tierRanking: Record<string, number> = {
    title_contender: 4,
    trapezoid_elite: 3,
    trapezoid_team: 2,
    long_shot: 1,
  };
  const tierGap =
    (tierRanking[higher.tier] ?? 1) - (tierRanking[lower.tier] ?? 1);

  // Composite risk score: blend AdjEM gap, base rate, and tier gap
  // Low AdjEM gap = more upset risk, high base rate = more upset risk
  let riskScore = baseRate;

  // AdjEM adjustment: narrow gaps increase risk
  if (adjEMGap < 5) riskScore += 0.15;
  else if (adjEMGap < 10) riskScore += 0.05;
  else if (adjEMGap > 20) riskScore -= 0.1;

  // Tier adjustment: if lower seed has strong framework, risk goes up
  if (tierGap <= 0) riskScore += 0.1;
  else if (tierGap === 1) riskScore += 0.0;
  else riskScore -= 0.05;

  if (riskScore >= 0.45) return "likely_upset";
  if (riskScore >= 0.30) return "danger";
  if (riskScore >= 0.15) return "watch";
  return "safe";
}

function generateKeyFactors(
  teamA: Team,
  teamB: Team,
  edges: MatchupEdge[],
  paceMismatch: number
): string[] {
  const factors: string[] = [];

  // AdjEM gap
  const gap = Math.abs(teamA.netRtg - teamB.netRtg);
  const favored = teamA.netRtg > teamB.netRtg ? teamA : teamB;
  if (gap > 15) {
    factors.push(`${favored.name} has a dominant ${gap.toFixed(1)}-point AdjEM edge`);
  } else if (gap > 8) {
    factors.push(`${favored.name} holds a solid ${gap.toFixed(1)}-point AdjEM advantage`);
  } else if (gap < 3) {
    factors.push(`Razor-thin ${gap.toFixed(1)}-point AdjEM gap — coin-flip territory`);
  }

  // Pace mismatch
  if (paceMismatch > 5) {
    factors.push(`Significant pace mismatch (${paceMismatch.toFixed(1)} possessions) — style clash likely`);
  }

  // Offensive vs defensive identity
  const offEdge = edges.find((e) => e.category === "Offense (AdjO)");
  const defEdge = edges.find((e) => e.category === "Defense (AdjD)");
  if (offEdge && defEdge && offEdge.advantage !== defEdge.advantage && offEdge.advantage !== "even" && defEdge.advantage !== "even") {
    const offTeam = offEdge.advantage === "A" ? teamA.name : teamB.name;
    const defTeam = defEdge.advantage === "A" ? teamA.name : teamB.name;
    factors.push(`Stylistic contrast: ${offTeam} offense vs ${defTeam} defense`);
  }

  // Trapezoid alignment
  if (teamA.insideTrapezoid && !teamB.insideTrapezoid) {
    factors.push(`${teamA.name} inside Trapezoid of KenPom; ${teamB.name} outside`);
  } else if (teamB.insideTrapezoid && !teamA.insideTrapezoid) {
    factors.push(`${teamB.name} inside Trapezoid of KenPom; ${teamA.name} outside`);
  }

  // Championship formula
  if (teamA.meetsChampFormula && !teamB.meetsChampFormula) {
    factors.push(`${teamA.name} meets full championship formula criteria`);
  } else if (teamB.meetsChampFormula && !teamA.meetsChampFormula) {
    factors.push(`${teamB.name} meets full championship formula criteria`);
  }

  return factors;
}

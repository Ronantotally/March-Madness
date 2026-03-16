import teamsData from "./teams.json";
import { Team, TeamsData } from "@/types";

const data = teamsData as TeamsData;

export function getAllTeams(): Team[] {
  return data.teams;
}

export function getTeam(name: string): Team | undefined {
  return data.teams.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
}

export function getTeamsByRegion(region: string): Team[] {
  return data.teams.filter(
    (t) => t.region.toLowerCase() === region.toLowerCase()
  );
}

export function getTeamsBySeed(seed: number): Team[] {
  return data.teams.filter((t) => t.seed === seed);
}

export function getTeamsByTier(tier: string): Team[] {
  return data.teams.filter((t) => t.tier === tier);
}

export function searchTeams(query: string): Team[] {
  const q = query.toLowerCase();
  return data.teams.filter((t) => {
    const name = t.name.toLowerCase();
    // Exact start match
    if (name.startsWith(q)) return true;
    // Word boundary match
    if (name.split(/[\s.]+/).some((word) => word.startsWith(q))) return true;
    // Substring match
    if (name.includes(q)) return true;
    // Conference match
    if (t.conference.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function getChampionshipFormula() {
  return data.championshipFormula;
}

export function getMetadata() {
  return {
    season: data.season,
    lastUpdated: data.lastUpdated,
    dataSource: data.dataSource,
    trapezoidSource: data.trapezoidSource,
  };
}

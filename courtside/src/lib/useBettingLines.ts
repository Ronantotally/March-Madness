"use client";

import { create } from "zustand";

/* ------------------------------------------------------------------ */
/*  Types (mirror server types)                                        */
/* ------------------------------------------------------------------ */

export interface BettingGame {
  teamA: string;
  teamB: string;
  moneylineA: string;
  moneylineB: string;
  mlBetPctA: string;
  mlBetPctB: string;
  mlDollarPctA: string;
  mlDollarPctB: string;
  spread: string;
  spreadBetPctA: string;
  spreadBetPctB: string;
  spreadDollarPctA: string;
  spreadDollarPctB: string;
  total: string;
  gameDate: string;
  gameTime: string;
}

interface BettingStore {
  games: BettingGame[];
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
  fetch: (refresh?: boolean) => Promise<void>;
}

export const useBettingStore = create<BettingStore>((set, get) => ({
  games: [],
  loading: false,
  error: null,
  fetchedAt: null,

  fetch: async (refresh = false) => {
    // Don't re-fetch if we have data and it's less than 30 min old (unless force refresh)
    const state = get();
    if (!refresh && state.games.length > 0 && state.fetchedAt && Date.now() - state.fetchedAt < 30 * 60 * 1000) {
      return;
    }

    if (state.loading) return;

    set({ loading: true, error: null });

    try {
      const url = refresh ? "/api/betting-lines?refresh=1" : "/api/betting-lines";
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const data = await res.json();

      if (data.error && (!data.games || data.games.length === 0)) {
        throw new Error(data.error);
      }

      set({
        games: data.games ?? [],
        fetchedAt: data.fetchedAt ?? Date.now(),
        loading: false,
        error: data.error ?? null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch betting lines",
      });
    }
  },
}));

/**
 * Find betting data for a specific matchup by team names.
 * Tries both orderings (teamA/teamB could be swapped).
 */
export function findBettingLine(
  games: BettingGame[],
  teamAName: string,
  teamBName: string
): { game: BettingGame; flipped: boolean } | null {
  // Try direct match
  for (const g of games) {
    if (
      (g.teamA === teamAName && g.teamB === teamBName) ||
      (g.teamA.includes(teamAName) && g.teamB.includes(teamBName))
    ) {
      return { game: g, flipped: false };
    }
    if (
      (g.teamA === teamBName && g.teamB === teamAName) ||
      (g.teamA.includes(teamBName) && g.teamB.includes(teamAName))
    ) {
      return { game: g, flipped: true };
    }
  }

  // Fuzzy: check if team name is a substring
  for (const g of games) {
    const gA = g.teamA.toLowerCase();
    const gB = g.teamB.toLowerCase();
    const tA = teamAName.toLowerCase();
    const tB = teamBName.toLowerCase();

    if ((gA.includes(tA) || tA.includes(gA)) && (gB.includes(tB) || tB.includes(gB))) {
      return { game: g, flipped: false };
    }
    if ((gA.includes(tB) || tB.includes(gA)) && (gB.includes(tA) || tA.includes(gB))) {
      return { game: g, flipped: true };
    }
  }

  return null;
}

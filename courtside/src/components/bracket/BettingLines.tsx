"use client";

import { useEffect } from "react";
import { DollarSign, RefreshCw, Loader2, TrendingUp, Users } from "lucide-react";
import { useBettingStore, findBettingLine } from "@/lib/useBettingLines";

function parsePct(val: string): number {
  return parseFloat(val.replace("%", "")) || 0;
}

function TugOfWar({
  label,
  pctA,
  pctB,
  nameA,
  nameB,
  icon: Icon,
}: {
  label: string;
  pctA: number;
  pctB: number;
  nameA: string;
  nameB: string;
  icon: React.ElementType;
}) {
  const total = pctA + pctB || 100;
  const widthA = (pctA / total) * 100;
  const widthB = (pctB / total) * 100;
  const aWins = pctA > pctB;

  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon size={9} className="text-text-secondary/50" />
          <span className="text-[9px] text-text-secondary">{label}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`w-[52px] text-right font-mono text-[10px] ${aWins ? "font-bold text-accent-green" : "text-text-secondary"}`}
        >
          {nameA} {pctA}%
        </span>
        <div className="flex h-[6px] flex-1 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-l-full transition-all duration-500"
            style={{
              width: `${widthA}%`,
              background: aWins ? "#2EC4B6" : "rgb(var(--text-2) / 0.2)",
            }}
          />
          <div
            className="h-full rounded-r-full transition-all duration-500"
            style={{
              width: `${widthB}%`,
              background: !aWins ? "#2EC4B6" : "rgb(var(--text-2) / 0.2)",
            }}
          />
        </div>
        <span
          className={`w-[52px] font-mono text-[10px] ${!aWins ? "font-bold text-accent-green" : "text-text-secondary"}`}
        >
          {pctB}% {nameB}
        </span>
      </div>
    </div>
  );
}

interface Props {
  teamAName: string;
  teamBName: string;
}

export default function BettingLines({ teamAName, teamBName }: Props) {
  const games = useBettingStore((s) => s.games);
  const loading = useBettingStore((s) => s.loading);
  const error = useBettingStore((s) => s.error);
  const fetchedAt = useBettingStore((s) => s.fetchedAt);
  const fetchData = useBettingStore((s) => s.fetch);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find this matchup
  const result = findBettingLine(games, teamAName, teamBName);

  if (loading && games.length === 0) {
    return (
      <div className="border-b border-border px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <DollarSign size={10} className="text-accent-gold" />
          <span className="text-[10px] font-semibold text-text-secondary">
            BETTING LINES
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 py-4">
          <Loader2 size={14} className="animate-spin text-text-secondary" />
          <span className="text-[11px] text-text-secondary">Loading betting data...</span>
        </div>
      </div>
    );
  }

  if (error && games.length === 0) {
    return (
      <div className="border-b border-border px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign size={10} className="text-accent-gold" />
            <span className="text-[10px] font-semibold text-text-secondary">
              BETTING LINES
            </span>
          </div>
          <button
            onClick={() => fetchData(true)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
          >
            <RefreshCw size={9} />
            Retry
          </button>
        </div>
        <p className="py-2 text-center text-[10px] text-text-secondary/60">
          Betting data unavailable
          {error && <span className="mt-1 block text-[9px] text-accent-red/60">{error.slice(0, 100)}</span>}
        </p>
      </div>
    );
  }

  if (!result) {
    if (games.length === 0) return null;
    return (
      <div className="border-b border-border px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <DollarSign size={10} className="text-accent-gold" />
            <span className="text-[10px] font-semibold text-text-secondary">
              BETTING LINES
            </span>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={loading}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-50"
          >
            <RefreshCw size={9} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        <p className="py-2 text-center text-[10px] text-text-secondary/60">
          No betting line found for this matchup
        </p>
      </div>
    );
  }

  const { game: betting, flipped } = result;
  // If flipped, swap A and B to match our panel's team order
  const ml = flipped
    ? { a: betting.moneylineB, b: betting.moneylineA }
    : { a: betting.moneylineA, b: betting.moneylineB };
  const spread = betting.spread;
  const mlBetA = parsePct(flipped ? betting.mlBetPctB : betting.mlBetPctA);
  const mlBetB = parsePct(flipped ? betting.mlBetPctA : betting.mlBetPctB);
  const mlDolA = parsePct(flipped ? betting.mlDollarPctB : betting.mlDollarPctA);
  const mlDolB = parsePct(flipped ? betting.mlDollarPctA : betting.mlDollarPctB);
  const spreadBetA = parsePct(flipped ? betting.spreadBetPctB : betting.spreadBetPctA);
  const spreadBetB = parsePct(flipped ? betting.spreadBetPctA : betting.spreadBetPctB);
  const spreadDolA = parsePct(flipped ? betting.spreadDollarPctB : betting.spreadDollarPctA);
  const spreadDolB = parsePct(flipped ? betting.spreadDollarPctA : betting.spreadDollarPctB);

  const shortA = teamAName.length > 10 ? teamAName.slice(0, 8) : teamAName;
  const shortB = teamBName.length > 10 ? teamBName.slice(0, 8) : teamBName;

  const ageMin = fetchedAt ? Math.round((Date.now() - fetchedAt) / 60000) : 0;

  return (
    <div className="border-b border-border px-4 py-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <DollarSign size={10} className="text-accent-gold" />
          <span className="text-[10px] font-semibold text-text-secondary">
            BETTING LINES
          </span>
          <span className="text-[8px] text-text-secondary/40">
            {ageMin < 1 ? "just now" : `${ageMin}m ago`}
          </span>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={loading}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] text-text-secondary transition-colors hover:bg-background hover:text-text-primary disabled:opacity-50"
        >
          <RefreshCw size={9} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Moneyline & Spread */}
      <div className="mb-2.5 flex gap-3">
        {/* Moneyline */}
        <div className="flex-1 rounded-lg bg-background px-2.5 py-2">
          <div className="mb-1 text-[9px] font-medium text-text-secondary">Moneyline</div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[11px] font-bold text-text-primary">{ml.a}</span>
              <span className="ml-1 text-[9px] text-text-secondary">{shortA}</span>
            </div>
            <div className="text-right">
              <span className="mr-1 text-[9px] text-text-secondary">{shortB}</span>
              <span className="font-mono text-[11px] font-bold text-text-primary">{ml.b}</span>
            </div>
          </div>
        </div>

        {/* Spread */}
        <div className="flex-1 rounded-lg bg-background px-2.5 py-2">
          <div className="mb-1 text-[9px] font-medium text-text-secondary">Spread</div>
          <div className="flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-text-primary">{spread}</span>
          </div>
          {betting.total && betting.total !== "N/A" && (
            <div className="mt-0.5 text-center text-[9px] text-text-secondary">
              O/U {betting.total}
            </div>
          )}
        </div>
      </div>

      {/* Public betting splits */}
      <div className="mb-1 text-[9px] font-medium text-text-secondary">Public Betting Splits</div>

      <TugOfWar
        label="ML Bets"
        pctA={mlBetA}
        pctB={mlBetB}
        nameA={shortA}
        nameB={shortB}
        icon={Users}
      />
      <TugOfWar
        label="ML Money"
        pctA={mlDolA}
        pctB={mlDolB}
        nameA={shortA}
        nameB={shortB}
        icon={DollarSign}
      />
      <TugOfWar
        label="Spread Bets"
        pctA={spreadBetA}
        pctB={spreadBetB}
        nameA={shortA}
        nameB={shortB}
        icon={Users}
      />
      <TugOfWar
        label="Spread Money"
        pctA={spreadDolA}
        pctB={spreadDolB}
        nameA={shortA}
        nameB={shortB}
        icon={TrendingUp}
      />

      {/* Smart money divergence */}
      {Math.abs(mlBetA - mlDolA) > 15 && (
        <div className="mt-1.5 rounded-md bg-accent-gold/8 px-2 py-1.5">
          <span className="text-[9px] leading-snug text-accent-gold">
            {mlBetA > mlDolA
              ? `Sharp money divergence: ${mlBetA}% of bets on ${shortA} but only ${mlDolA}% of the money — sharps may be on ${shortB}.`
              : `Sharp money divergence: only ${mlBetA}% of bets on ${shortA} but ${mlDolA}% of the money — sharps are backing ${shortA}.`}
          </span>
        </div>
      )}
    </div>
  );
}

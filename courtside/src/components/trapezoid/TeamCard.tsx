"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Trophy, Target, Shield, Zap, TrendingUp, BarChart3, Gauge, Dice5, ArrowRight } from "lucide-react";
import { Team, TeamTier } from "@/types";

const TIER_COLORS: Record<TeamTier, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  kenpom_sleeper: "#8B5CF6",
  long_shot: "#4a4f5a",
};

const TIER_LABELS: Record<TeamTier, string> = {
  title_contender: "Title Contender",
  trapezoid_elite: "Trapezoid Elite",
  trapezoid_team: "Trapezoid Team",
  kenpom_sleeper: "KenPom Sleeper",
  long_shot: "Long Shot",
};

const TIER_VERDICTS: Record<TeamTier, string> = {
  title_contender: "Elite profile — meets both Trapezoid and full championship formula.",
  trapezoid_elite: "Strong contender — inside the Trapezoid with solid KenPom credentials.",
  trapezoid_team: "Fringe contender — inside the Trapezoid but weaker overall KenPom profile.",
  kenpom_sleeper: "Outside the Trapezoid but strong KenPom profile — could surprise in March.",
  long_shot: "Outside both frameworks — would need a historic run to cut down the nets.",
};

interface Props {
  team: Team;
  onClose: () => void;
}

function StatRow({
  icon: Icon,
  label,
  value,
  rank,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  rank?: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-text-secondary">
        <Icon size={13} />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          className={`font-mono text-sm font-semibold ${
            highlight ? "text-accent-gold" : "text-text-primary"
          }`}
        >
          {value}
        </span>
        {rank !== undefined && (
          <span className="font-mono text-[10px] text-text-secondary">
            #{rank}
          </span>
        )}
      </div>
    </div>
  );
}

function CheckItem({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span
        className={`font-mono text-xs ${met ? "text-accent-green" : "text-accent-red"}`}
      >
        {met ? "✓" : "✗"}
      </span>
      <span
        className={`text-xs ${met ? "text-text-primary" : "text-text-secondary"}`}
      >
        {label}
      </span>
    </div>
  );
}

export default function TeamCard({ team, onClose }: Props) {
  const router = useRouter();
  const tierColor = TIER_COLORS[team.tier];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      transition={{ type: "spring", damping: 24, stiffness: 260 }}
      className="absolute right-0 top-0 z-40 w-80 rounded-xl border border-border bg-surface shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-text-primary">{team.name}</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                background: `${tierColor}18`,
                color: tierColor,
              }}
            >
              {TIER_LABELS[team.tier]}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
            <span>({team.seed}) {team.region}</span>
            <span>·</span>
            <span>{team.conference}</span>
            <span>·</span>
            <span>{team.record}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
        >
          <X size={16} />
        </button>
      </div>

      {/* KenPom rank badge */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-lg"
          style={{ background: `${tierColor}15` }}
        >
          <span
            className="font-mono text-xl font-black"
            style={{ color: tierColor }}
          >
            {team.kenpomRank}
          </span>
        </div>
        <div>
          <div className="text-xs text-text-secondary">KenPom Rank</div>
          <div className="font-mono text-sm font-semibold text-text-primary">
            AdjEM {team.netRtg > 0 ? "+" : ""}
            {team.netRtg.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-border px-4 py-2">
        <StatRow
          icon={Target}
          label="Offense (AdjO)"
          value={team.oRtg.toFixed(1)}
          rank={team.oRtgRank}
          highlight={team.oRtgRank <= 25}
        />
        <StatRow
          icon={Shield}
          label="Defense (AdjD)"
          value={team.dRtg.toFixed(1)}
          rank={team.dRtgRank}
          highlight={team.dRtgRank <= 25}
        />
        <StatRow
          icon={Zap}
          label="Net Rating"
          value={`${team.netRtg > 0 ? "+" : ""}${team.netRtg.toFixed(2)}`}
        />
        <StatRow
          icon={Gauge}
          label="Tempo (AdjT)"
          value={team.adjT.toFixed(1)}
          rank={team.adjTRank}
        />
        <StatRow
          icon={BarChart3}
          label="SOS (Net Rtg)"
          value=""
          rank={team.sosNetRtgRank}
          highlight={team.sosNetRtgRank <= 45}
        />
        <StatRow
          icon={Dice5}
          label="Luck"
          value={team.luck > 0 ? `+${team.luck.toFixed(3)}` : team.luck.toFixed(3)}
        />
      </div>

      {/* Championship formula */}
      <div className="border-b border-border px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5">
          <Trophy size={12} className="text-accent-gold" />
          <span className="text-xs font-semibold text-text-secondary">
            CHAMPIONSHIP FORMULA
          </span>
        </div>
        <CheckItem label={`AdjO Rank ≤ 25 (currently #${team.oRtgRank})`} met={team.oRtgRank <= 25} />
        <CheckItem label={`AdjD Rank ≤ 25 (currently #${team.dRtgRank})`} met={team.dRtgRank <= 25} />
        <CheckItem label={`Overall Rank ≤ 25 (currently #${team.kenpomRank})`} met={team.kenpomRank <= 25} />
        <CheckItem label={`SOS Rank ≤ 45 (currently #${team.sosNetRtgRank})`} met={team.sosNetRtgRank <= 45} />
        <div className="mt-1.5 flex items-center gap-2">
          <TrendingUp size={12} className={team.insideTrapezoid ? "text-accent-green" : "text-text-secondary"} />
          <CheckItem label="Inside Trapezoid" met={team.insideTrapezoid} />
        </div>
      </div>

      {/* Verdict */}
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs leading-relaxed text-text-secondary">
          {TIER_VERDICTS[team.tier]}
        </p>
      </div>

      {/* View in Bracket link */}
      <div className="px-4 py-3">
        <button
          onClick={() => router.push(`/bracket?team=${encodeURIComponent(team.name)}`)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold/10 py-2 text-xs font-semibold text-accent-gold transition-colors hover:bg-accent-gold/20"
        >
          <ArrowRight size={13} />
          View in Bracket
        </button>
      </div>
    </motion.div>
  );
}

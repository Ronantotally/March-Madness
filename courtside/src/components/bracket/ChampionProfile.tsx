"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ChevronDown, ChevronUp, Check, X, AlertTriangle } from "lucide-react";
import { Team, BracketState } from "@/types";
import ArchetypeBadge from "@/components/shared/ArchetypeBadge";

interface CriterionResult {
  label: string;
  threshold: string;
  actual: string;
  met: boolean;
  close: boolean; // within 20% of threshold
}

// Historical champion template
const CHAMPION_CRITERIA = [
  { key: "kenpomRank", label: "KenPom Rank", max: 15, note: "22 of last 24 champs" },
  { key: "oRtgRank", label: "AdjO Rank", max: 21, note: "23 of last 24 champs" },
  { key: "dRtgRank", label: "AdjD Rank", max: 31, note: "22 of last 24 champs" },
  { key: "netRtg", label: "AdjEM", min: 25, note: "All 24 champs" },
  { key: "sosNetRtgRank", label: "SOS Rank", max: 45, note: "Most champs" },
] as const;

// Recent champion examples
const RECENT_CHAMPS = [
  { year: "2025", name: "UConn", kenpomRank: 1, oRtgRank: 3, dRtgRank: 2, netRtg: 37.2, sosRank: 8, score: 5 },
  { year: "2024", name: "UConn", kenpomRank: 1, oRtgRank: 1, dRtgRank: 4, netRtg: 35.8, sosRank: 12, score: 5 },
  { year: "2023", name: "LSU", kenpomRank: 12, oRtgRank: 18, dRtgRank: 11, netRtg: 26.1, sosRank: 30, score: 5 },
  { year: "2022", name: "Kansas", kenpomRank: 5, oRtgRank: 12, dRtgRank: 14, netRtg: 28.4, sosRank: 7, score: 5 },
];

function evaluateTeam(team: Team): CriterionResult[] {
  return CHAMPION_CRITERIA.map((c) => {
    if (c.key === "netRtg") {
      const actual = team.netRtg;
      const met = actual >= c.min!;
      const close = !met && actual >= c.min! * 0.85;
      return {
        label: c.label,
        threshold: `≥ +${c.min}`,
        actual: `+${actual.toFixed(1)}`,
        met,
        close,
      };
    }
    const val = team[c.key as keyof Team] as number;
    const met = val <= c.max!;
    const close = !met && val <= c.max! * 1.2;
    return {
      label: c.label,
      threshold: `Top ${c.max}`,
      actual: `#${val}`,
      met,
      close,
    };
  });
}

function CriterionRow({ result, note }: { result: CriterionResult; note: string }) {
  const Icon = result.met ? Check : result.close ? AlertTriangle : X;
  const color = result.met ? "#2EC4B6" : result.close ? "#F5A623" : "#E63946";

  return (
    <div className="flex items-center gap-2 py-1.5">
      <Icon size={12} style={{ color }} className="shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-text-primary">{result.label}</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-text-secondary">{result.threshold}</span>
            <span
              className="font-mono text-[11px] font-semibold"
              style={{ color }}
            >
              {result.actual}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-0.5 h-[3px] w-full overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: result.met ? "100%" : result.close ? "75%" : "40%",
              background: color,
              opacity: 0.6,
            }}
          />
        </div>
        <span className="text-[9px] text-text-secondary/50">{note}</span>
      </div>
    </div>
  );
}

interface Props {
  bracketState: BracketState;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChampionProfile({ bracketState, isOpen, onToggle }: Props) {
  const champion = bracketState.champion;

  const evaluation = useMemo(() => {
    if (!champion) return null;
    return evaluateTeam(champion);
  }, [champion]);

  const dnaScore = useMemo(() => {
    if (!evaluation) return 0;
    return evaluation.filter((r) => r.met).length;
  }, [evaluation]);

  return (
    <div className="rounded-xl border border-border bg-surface">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-accent-gold" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Champion Profile
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={14} className="text-text-secondary" />
        ) : (
          <ChevronDown size={14} className="text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3">
              {champion && evaluation ? (
                <>
                  {/* Champion pick header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-text-secondary">Your pick</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">
                          ({champion.seed}) {champion.name}
                        </span>
                        <ArchetypeBadge team={champion} compact />
                      </div>
                    </div>
                    {/* DNA score circle */}
                    <div className="flex flex-col items-center">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-sm font-black"
                        style={{
                          borderColor: dnaScore >= 4 ? "#2EC4B6" : dnaScore >= 3 ? "#F5A623" : "#E63946",
                          color: dnaScore >= 4 ? "#2EC4B6" : dnaScore >= 3 ? "#F5A623" : "#E63946",
                        }}
                      >
                        {dnaScore}/{CHAMPION_CRITERIA.length}
                      </div>
                      <span className="mt-0.5 text-[8px] text-text-secondary">DNA Score</span>
                    </div>
                  </div>

                  {/* Criteria checklist */}
                  <div className="mb-3 space-y-0.5">
                    {evaluation.map((result, i) => (
                      <CriterionRow
                        key={CHAMPION_CRITERIA[i].key}
                        result={result}
                        note={CHAMPION_CRITERIA[i].note}
                      />
                    ))}
                  </div>

                  {/* Verdict */}
                  <div className="mb-3 rounded-lg bg-background px-3 py-2">
                    <p className="text-[11px] leading-relaxed text-text-secondary">
                      {dnaScore === 5 && (
                        <>
                          <span className="font-semibold text-accent-green">Perfect match.</span>{" "}
                          {champion.name} checks every box in the champion template.
                        </>
                      )}
                      {dnaScore === 4 && (
                        <>
                          <span className="font-semibold text-accent-green">Strong profile.</span>{" "}
                          {champion.name} meets {dnaScore} of {CHAMPION_CRITERIA.length} champion criteria — most recent winners had a similar profile.
                        </>
                      )}
                      {dnaScore === 3 && (
                        <>
                          <span className="font-semibold text-accent-gold">Possible but risky.</span>{" "}
                          {champion.name} meets {dnaScore} of {CHAMPION_CRITERIA.length} criteria. Some champions have won with this profile, but it&apos;s not the norm.
                        </>
                      )}
                      {dnaScore <= 2 && (
                        <>
                          <span className="font-semibold text-accent-red">Longshot pick.</span>{" "}
                          {champion.name} only meets {dnaScore} of {CHAMPION_CRITERIA.length} champion criteria. Historically, this profile rarely wins it all.
                        </>
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                  <Trophy size={24} className="mx-auto mb-2 text-text-secondary/20" />
                  <p className="text-xs text-text-secondary">
                    Pick a champion in the bracket to see how they match
                    the historical champion profile.
                  </p>
                </div>
              )}

              {/* Recent champions gallery */}
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  Recent Champions
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {RECENT_CHAMPS.map((champ) => (
                    <div
                      key={champ.year}
                      className="rounded-lg bg-background px-2 py-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-text-primary">
                          {champ.year} {champ.name}
                        </span>
                        <span className="font-mono text-[9px] font-bold text-accent-green">
                          {champ.score}/5
                        </span>
                      </div>
                      <div className="mt-0.5 flex gap-1.5 font-mono text-[8px] text-text-secondary/60">
                        <span>KP #{champ.kenpomRank}</span>
                        <span>+{champ.netRtg}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

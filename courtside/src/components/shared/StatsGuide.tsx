"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  title_contender: "#F5A623",
  trapezoid_elite: "#2EC4B6",
  trapezoid_team: "#0891B2",
  kenpom_sleeper: "#8B5CF6",
  long_shot: "#4a4f5a",
};

const TIERS = [
  {
    key: "title_contender",
    label: "Title Contender",
    description:
      "Inside the trapezoid AND passes KenPom\u2019s championship formula. These teams check every box. Only 8 teams qualify.",
  },
  {
    key: "trapezoid_elite",
    label: "Trapezoid Elite",
    description:
      "Inside the trapezoid with strong KenPom numbers. Dangerous teams that could make a deep run.",
  },
  {
    key: "trapezoid_team",
    label: "Trapezoid Team",
    description:
      "Inside the trapezoid but with some KenPom weaknesses. Good but not complete.",
  },
  {
    key: "kenpom_sleeper",
    label: "KenPom Sleeper",
    description:
      "Strong KenPom efficiency but outside the trapezoid. The numbers say they\u2019re good, but their pace/style profile doesn\u2019t match championship teams.",
  },
  {
    key: "long_shot",
    label: "Long Shot",
    description:
      "Doesn\u2019t pass either filter. Could still pull an upset, but the data says it\u2019s unlikely they\u2019ll go far.",
  },
];

const INDIVIDUAL_STATS = [
  {
    abbr: "AdjEM",
    name: "Net Rating",
    description:
      "How many points better (or worse) a team is than average, per game. Duke leads at +38.9, meaning they\u2019d beat an average team by ~39 points. Higher = better.",
  },
  {
    abbr: "AdjO",
    name: "Offensive Rating",
    description:
      "Points scored per 100 possessions, adjusted for opponent quality. Think of it as \u2018how good is this team at scoring against real competition?\u2019 Higher = better.",
  },
  {
    abbr: "AdjD",
    name: "Defensive Rating",
    description:
      "Points allowed per 100 possessions, adjusted for opponent quality. Lower = better. Michigan\u2019s 89.0 is #1 in the country.",
  },
  {
    abbr: "AdjT",
    name: "Tempo / Pace",
    description:
      "How many possessions a team plays per game. High pace = fast, run-and-gun style. Low pace = slow, grind-it-out style. Neither is inherently better.",
  },
  {
    abbr: "SOS",
    name: "Strength of Schedule",
    description:
      "How tough a team\u2019s opponents were. A 25-5 record against elite competition means more than 30-2 against weak teams. Lower rank = harder schedule.",
  },
  {
    abbr: "Luck",
    name: "Luck",
    description:
      "KenPom\u2019s estimate of how much a team over- or under-performed expectations in close games. Positive = lucky (won more close games than expected). Doesn\u2019t mean they\u2019re bad \u2014 but it\u2019s a warning sign.",
  },
];

const MATCHUP_STATS = [
  {
    name: "Win Probability",
    description:
      "Our model\u2019s estimate of each team\u2019s chance to win, based on the gap in their efficiency ratings.",
  },
  {
    name: "Upset Risk",
    description:
      "How likely the lower-seeded team is to win, combining our model with historical upset rates for each seed matchup (e.g., 12-seeds beat 5-seeds 35% of the time historically).",
  },
];

export default function StatsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating help button — bottom-left */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary shadow-lg transition-all hover:scale-105 hover:border-accent-gold/40 hover:text-accent-gold"
        aria-label="Stats guide"
      >
        <HelpCircle size={18} />
      </button>

      {/* Backdrop + Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-up panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-b-0 border-border bg-surface shadow-2xl"
            >
              {/* Handle + Header */}
              <div className="flex-shrink-0 border-b border-border px-5 pb-3 pt-3">
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-text-primary">
                    Stats Guide
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Everything you need to understand the numbers.
                </p>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border">
                {/* === THE TWO FRAMEWORKS === */}
                <Section title="The Two Frameworks">
                  <FrameworkCard
                    title="Trapezoid of KenPom"
                    credit="KenPom-based"
                    description="Teams are plotted by how fast they play (pace) vs how good they are (net rating). Championship-caliber teams fall inside the trapezoid shape. The shape is wider at the top because elite teams can win playing fast or slow — but good-not-great teams need to play at a moderate pace. Every recent national champion was inside the trapezoid."
                  />
                  <FrameworkCard
                    title="KenPom Ratings"
                    credit="Ken Pomeroy"
                    description="The gold standard for evaluating college basketball teams. Instead of just looking at wins and losses, KenPom measures how efficiently teams score and defend per 100 possessions — so a slow team and a fast team can be compared fairly."
                  />
                </Section>

                {/* === TIER SYSTEM === */}
                <Section title="Tier System">
                  <div className="space-y-2.5">
                    {TIERS.map((tier) => (
                      <div key={tier.key} className="flex gap-3">
                        <span
                          className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full"
                          style={{ background: TIER_COLORS[tier.key] }}
                        />
                        <div>
                          <span className="text-xs font-semibold text-text-primary">
                            {tier.label}
                          </span>
                          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                            {tier.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* === INDIVIDUAL STATS === */}
                <Section title="Individual Stats">
                  <div className="space-y-3">
                    {INDIVIDUAL_STATS.map((stat) => (
                      <div key={stat.abbr}>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xs font-bold text-accent-gold">
                            {stat.abbr}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {stat.name}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                          {stat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* === CHAMPIONSHIP FORMULA === */}
                <Section title="Championship Formula">
                  <p className="text-xs leading-relaxed text-text-secondary">
                    Based on historical analysis: 22 of the last 23 national
                    champions ranked top 25 in BOTH offensive and defensive
                    efficiency, top 25 overall, and played a top-45 strength of
                    schedule. Teams meeting all 4 criteria are marked as title
                    contenders.
                  </p>
                </Section>

                {/* === MATCHUP STATS === */}
                <Section title="Matchup Stats">
                  <div className="space-y-3">
                    {MATCHUP_STATS.map((stat) => (
                      <div key={stat.name}>
                        <span className="text-xs font-semibold text-text-primary">
                          {stat.name}
                        </span>
                        <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                          {stat.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                {/* Spacer for bottom padding */}
                <div className="h-4" />
              </div>

              {/* Got it button */}
              <div className="flex-shrink-0 border-t border-border px-5 py-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-lg bg-accent-gold/15 py-2.5 text-sm font-semibold text-accent-gold transition-colors hover:bg-accent-gold/25"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Sub-components ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FrameworkCard({
  title,
  credit,
  description,
}: {
  title: string;
  credit: string;
  description: string;
}) {
  return (
    <div className="mb-2.5 rounded-lg border border-border bg-background px-3.5 py-3">
      <div className="flex items-baseline gap-2">
        <span className="text-xs font-semibold text-text-primary">
          {title}
        </span>
        <span className="text-[10px] text-text-secondary/50">
          by {credit}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
        {description}
      </p>
    </div>
  );
}

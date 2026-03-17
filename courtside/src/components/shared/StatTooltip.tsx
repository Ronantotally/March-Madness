"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Short, one-line definitions for inline tooltips.
 */
const STAT_DEFINITIONS: Record<string, string> = {
  AdjEM: "Points better than average per 100 possessions, adjusted for opponent quality. Higher = more dominant.",
  AdjO: "Points scored per 100 possessions. Higher = better.",
  AdjD: "Points allowed per 100 possessions. Lower = better.",
  AdjT: "Possessions per game, adjusted for opponent tempo. Higher = faster pace.",
  SOS: "Strength of schedule. Lower rank = tougher opponents.",
  Luck: "Close-game over/under-performance. Positive = lucky.",
};

interface Props {
  /** The stat abbreviation key — must match a STAT_DEFINITIONS key */
  stat: keyof typeof STAT_DEFINITIONS;
  children: React.ReactNode;
}

export default function StatTooltip({ stat, children }: Props) {
  const [show, setShow] = useState(false);
  const [above, setAbove] = useState(true);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const definition = STAT_DEFINITIONS[stat];
  if (!definition) return <>{children}</>;

  /* eslint-disable react-hooks/rules-of-hooks */
  useEffect(() => {
    if (show && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      // If not enough room above, flip below
      setAbove(rect.top > 48);
    }
  }, [show]);
  /* eslint-enable react-hooks/rules-of-hooks */

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow((v) => !v)}
    >
      {/* Dotted underline indicator */}
      <span className="border-b border-dotted border-text-secondary/40">
        {children}
      </span>

      {/* Tooltip bubble */}
      {show && (
        <span
          className={`absolute left-1/2 z-50 w-52 -translate-x-1/2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] leading-snug text-text-secondary shadow-xl ${
            above ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          <span className="font-semibold text-text-primary">{stat}</span>
          {" — "}
          {definition}
        </span>
      )}
    </span>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Team } from "@/types";
import { getArchetype, getArchetypeDescription } from "@/data/archetypes";

interface Props {
  team: Team;
  compact?: boolean;
}

export default function ArchetypeBadge({ team, compact }: Props) {
  const [show, setShow] = useState(false);
  const [above, setAbove] = useState(true);
  const ref = useRef<HTMLSpanElement>(null);

  const info = getArchetype(team);
  const description = getArchetypeDescription(team, info);

  useEffect(() => {
    if (show && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setAbove(rect.top > 80);
    }
  }, [show]);

  return (
    <span
      ref={ref}
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow((v) => !v)}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full font-semibold ${
          compact
            ? "px-1.5 py-px text-[8px]"
            : "px-2 py-0.5 text-[10px]"
        }`}
        style={{
          color: info.color,
          background: `${info.color}15`,
        }}
      >
        <span>{info.emoji}</span>
        {!compact && <span>{info.label}</span>}
        {compact && <span>{info.label}</span>}
      </span>

      {show && (
        <span
          className={`absolute left-1/2 z-50 w-56 -translate-x-1/2 rounded-md border border-border bg-surface px-2.5 py-2 text-[11px] leading-snug text-text-secondary shadow-xl ${
            above ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          <span className="font-semibold" style={{ color: info.color }}>
            {info.emoji} {info.label}
          </span>
          {": "}
          {description}
        </span>
      )}
    </span>
  );
}

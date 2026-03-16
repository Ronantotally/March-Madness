"use client";

import { FilterMode } from "./TrapezoidChart";

const REGIONS = ["East", "South", "Midwest", "West"];
const SEED_RANGES: { label: string; range: [number, number] }[] = [
  { label: "1–4", range: [1, 4] },
  { label: "5–8", range: [5, 8] },
  { label: "9–12", range: [9, 12] },
  { label: "13–16", range: [13, 16] },
];

interface Props {
  filter: FilterMode;
  onFilterChange: (mode: FilterMode) => void;
  filterRegion?: string;
  onRegionChange: (region: string) => void;
  filterSeedRange?: [number, number];
  onSeedRangeChange: (range: [number, number]) => void;
}

function Chip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
        active
          ? "text-background"
          : "text-text-secondary hover:bg-background hover:text-text-primary"
      }`}
      style={
        active
          ? { background: color ?? "#e8e9ed", color: "#0a0b0f" }
          : undefined
      }
    >
      {label}
    </button>
  );
}

export default function ChartFilters({
  filter,
  onFilterChange,
  filterRegion,
  onRegionChange,
  filterSeedRange,
  onSeedRangeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip
        label="All"
        active={filter === "all"}
        onClick={() => onFilterChange("all")}
      />
      <Chip
        label="Title Contenders"
        active={filter === "title_contenders"}
        onClick={() => onFilterChange("title_contenders")}
        color="#F5A623"
      />
      <Chip
        label="Trapezoid Teams"
        active={filter === "trapezoid"}
        onClick={() => onFilterChange("trapezoid")}
        color="#2EC4B6"
      />

      <span className="mx-1 h-4 w-px bg-border" />

      {REGIONS.map((r) => (
        <Chip
          key={r}
          label={r}
          active={filter === "region" && filterRegion === r}
          onClick={() => {
            onFilterChange("region");
            onRegionChange(r);
          }}
        />
      ))}

      <span className="mx-1 h-4 w-px bg-border" />

      {SEED_RANGES.map((sr) => (
        <Chip
          key={sr.label}
          label={`Seeds ${sr.label}`}
          active={
            filter === "seed" &&
            filterSeedRange?.[0] === sr.range[0] &&
            filterSeedRange?.[1] === sr.range[1]
          }
          onClick={() => {
            onFilterChange("seed");
            onSeedRangeChange(sr.range);
          }}
        />
      ))}
    </div>
  );
}

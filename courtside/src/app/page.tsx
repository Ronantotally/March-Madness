import { Triangle, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-text-primary">
          Trapezoid of Excellence
        </h1>
        <p className="mx-auto max-w-lg text-sm text-text-secondary">
          Visualize which teams fall inside the championship trapezoid based on
          offensive efficiency, defensive efficiency, tempo, and strength of
          schedule.
        </p>
      </div>

      {/* Placeholder chart area */}
      <div className="mb-8 flex h-[480px] items-center justify-center rounded-xl border border-border bg-surface">
        <div className="text-center">
          <Triangle
            size={48}
            className="mx-auto mb-4 text-text-secondary/30"
          />
          <p className="text-sm text-text-secondary">
            Trapezoid chart will render here
          </p>
          <p className="mt-1 font-mono text-xs text-text-secondary/50">
            recharts · scatter plot · interactive
          </p>
        </div>
      </div>

      {/* Stat cards placeholder */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "In Trapezoid",
            value: "—",
            color: "text-accent-green",
            icon: Triangle,
          },
          {
            label: "KenPom Eligible",
            value: "—",
            color: "text-accent-orange",
            icon: TrendingUp,
          },
          {
            label: "Both Filters",
            value: "—",
            color: "text-accent-gold",
            icon: Shield,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-surface p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <card.icon size={14} className={card.color} />
              <span className="text-xs text-text-secondary">{card.label}</span>
            </div>
            <p className={`font-mono text-2xl font-bold ${card.color}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

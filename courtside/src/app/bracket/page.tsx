import { GitBranch, Trophy, Users } from "lucide-react";

export default function BracketPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-text-primary">
          Bracket Builder
        </h1>
        <p className="mx-auto max-w-lg text-sm text-text-secondary">
          Build your bracket with AI-powered matchup analysis. Click any game to
          get a detailed breakdown of the head-to-head matchup.
        </p>
      </div>

      {/* Placeholder bracket area */}
      <div className="mb-8 flex h-[560px] items-center justify-center rounded-xl border border-border bg-surface">
        <div className="text-center">
          <GitBranch
            size={48}
            className="mx-auto mb-4 text-text-secondary/30"
          />
          <p className="text-sm text-text-secondary">
            Interactive bracket will render here
          </p>
          <p className="mt-1 font-mono text-xs text-text-secondary/50">
            64-team bracket · drag &amp; drop · round by round
          </p>
        </div>
      </div>

      {/* Summary cards placeholder */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: "Teams Selected",
            value: "0 / 63",
            icon: Users,
            color: "text-accent-green",
          },
          {
            label: "Champion",
            value: "TBD",
            icon: Trophy,
            color: "text-accent-gold",
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

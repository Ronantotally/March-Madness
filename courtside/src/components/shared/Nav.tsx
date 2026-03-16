"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Triangle, GitBranch } from "lucide-react";

const tabs = [
  { href: "/", label: "Trapezoid", icon: Triangle },
  { href: "/bracket", label: "Bracket", icon: GitBranch },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-gold/10">
            <Triangle size={16} className="text-accent-gold" fill="currentColor" />
          </div>
          <span className="text-sm font-bold tracking-tight text-text-primary">
            COURTSIDE
          </span>
          <span className="rounded bg-accent-gold/10 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent-gold">
            2026
          </span>
        </Link>

        {/* Tab navigation */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-background text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer for balance */}
        <div className="w-32" />
      </div>
    </header>
  );
}

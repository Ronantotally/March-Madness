"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Triangle, GitBranch, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const tabs = [
  { href: "/", label: "Trapezoid", icon: Triangle },
  { href: "/bracket", label: "Bracket", icon: GitBranch },
];

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4">
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

        {/* Tab navigation + theme toggle */}
        <div className="flex items-center gap-1">
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

          <span className="mx-1.5 h-5 w-px bg-border" />

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}

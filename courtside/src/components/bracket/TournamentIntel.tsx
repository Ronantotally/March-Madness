"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface NewsItem {
  headline: string;
  detail: string;
  source: string;
  category: "injury" | "upset_alert" | "stat" | "storyline" | "bracket_tip";
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  injury: { label: "Injury", color: "#E63946", bg: "rgba(230,57,70,0.12)" },
  upset_alert: {
    label: "Upset Alert",
    color: "#FF6B35",
    bg: "rgba(255,107,53,0.12)",
  },
  stat: { label: "Stat", color: "#2EC4B6", bg: "rgba(46,196,182,0.12)" },
  storyline: {
    label: "Storyline",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.12)",
  },
  bracket_tip: {
    label: "Bracket Tip",
    color: "#F5A623",
    bg: "rgba(245,166,35,0.12)",
  },
};

const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "tournament-intel";

export default function TournamentIntel() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const lastFetchRef = useRef(0);
  const didInitRef = useRef(false);

  const fetchIntel = useCallback(async () => {
    if (Date.now() - lastFetchRef.current < RATE_LIMIT_MS) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/intel");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setItems(data.items || []);
      setTimestamp(data.timestamp);
      lastFetchRef.current = Date.now();

      // Persist to localStorage
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ items: data.items, timestamp: data.timestamp })
        );
      } catch {
        /* quota exceeded */
      }
    } catch {
      setError("Could not load tournament intel");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize: restore cache or fetch
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    // Default closed on mobile
    if (window.innerWidth < 1024) setIsOpen(false);

    // Try localStorage cache
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.items?.length && Date.now() - parsed.timestamp < RATE_LIMIT_MS) {
          setItems(parsed.items);
          setTimestamp(parsed.timestamp);
          lastFetchRef.current = parsed.timestamp;
          return;
        }
      }
    } catch {
      /* ignore */
    }

    fetchIntel();
  }, [fetchIntel]);

  const canRefresh = Date.now() - lastFetchRef.current >= RATE_LIMIT_MS;

  const timeAgo = timestamp
    ? (() => {
        const mins = Math.floor((Date.now() - timestamp) / 60000);
        if (mins < 1) return "Just now";
        if (mins === 1) return "1 min ago";
        return `${mins} min ago`;
      })()
    : null;

  return (
    <div className="relative">
      {/* Toggle tab — visible when collapsed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <Newspaper size={13} />
          Intel
          <ChevronLeft size={12} />
        </button>
      )}

      {/* Sidebar panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <div className="w-[300px]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Newspaper size={14} className="text-accent-gold" />
                  <span className="text-xs font-bold text-text-primary">
                    Tournament Intel
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchIntel()}
                    disabled={loading || !canRefresh}
                    className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary disabled:opacity-30"
                    title={
                      canRefresh
                        ? "Refresh"
                        : "Wait 5 min between refreshes"
                    }
                  >
                    <RefreshCw
                      size={12}
                      className={loading ? "animate-spin" : ""}
                    />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded p-1 text-text-secondary transition-colors hover:text-text-primary"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Last updated */}
              {timeAgo && (
                <div className="border-b border-border px-3 py-1.5">
                  <span className="text-[10px] text-text-secondary/60">
                    Last updated: {timeAgo}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
                {error && !items.length ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <AlertCircle
                      size={20}
                      className="text-text-secondary/40"
                    />
                    <p className="text-xs text-text-secondary">{error}</p>
                    <button
                      onClick={() => {
                        lastFetchRef.current = 0;
                        fetchIntel();
                      }}
                      className="mt-1 rounded-md bg-accent-gold/10 px-3 py-1 text-[11px] font-medium text-accent-gold"
                    >
                      Retry
                    </button>
                  </div>
                ) : loading && !items.length ? (
                  <div className="flex flex-col items-center gap-2 px-4 py-8">
                    <RefreshCw
                      size={16}
                      className="animate-spin text-accent-gold"
                    />
                    <p className="text-xs text-text-secondary">
                      Searching for latest tournament news...
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {items.map((item, i) => {
                      const cat =
                        CATEGORY_CONFIG[item.category] ||
                        CATEGORY_CONFIG.storyline;
                      return (
                        <div key={i} className="px-3 py-2.5">
                          {/* Category badge */}
                          <span
                            className="mb-1 inline-block rounded-full px-2 py-px text-[9px] font-bold"
                            style={{
                              color: cat.color,
                              background: cat.bg,
                            }}
                          >
                            {cat.label}
                          </span>
                          {/* Headline */}
                          <h4 className="text-xs font-semibold leading-snug text-text-primary">
                            {item.headline}
                          </h4>
                          {/* Detail */}
                          <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                            {item.detail}
                          </p>
                          {/* Source */}
                          <span className="mt-1 block text-[9px] text-text-secondary/50">
                            {item.source}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

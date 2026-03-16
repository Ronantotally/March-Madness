"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";

export default function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold text-background shadow-lg transition-transform hover:scale-105"
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* Slide-out panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-40 flex h-full w-96 flex-col border-l border-border bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-accent-gold" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Courtside AI
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageSquare
                  size={32}
                  className="mb-3 text-text-secondary"
                />
                <p className="text-sm text-text-secondary">
                  Ask about matchups, stats, or bracket strategy.
                </p>
                <p className="mt-1 text-xs text-text-secondary/60">
                  Powered by Claude
                </p>
              </div>
            </div>

            {/* Input area */}
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about a team or matchup..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none"
                />
                <button
                  className="rounded p-1 text-text-secondary transition-colors hover:text-accent-gold disabled:opacity-30"
                  disabled={!input.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

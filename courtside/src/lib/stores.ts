"use client";

import { create } from "zustand";
import { Team, BracketState, BracketGame } from "@/types";
import { createInitialBracketState, advanceTeam } from "@/data/bracket";
import { ChatContext as ChatContextData, ChatMessageData } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Bracket Store                                                      */
/* ------------------------------------------------------------------ */

interface BracketStore {
  bracketState: BracketState;
  expandedGame: BracketGame | null;
  pick: (gameId: string, team: Team) => void;
  reset: () => void;
  setExpandedGame: (game: BracketGame | null) => void;
}

export const useBracketStore = create<BracketStore>((set) => ({
  bracketState: createInitialBracketState(),
  expandedGame: null,
  pick: (gameId, team) =>
    set((s) => ({ bracketState: advanceTeam(s.bracketState, gameId, team) })),
  reset: () => set({ bracketState: createInitialBracketState() }),
  setExpandedGame: (game) => set({ expandedGame: game }),
}));

/* ------------------------------------------------------------------ */
/*  Chat Store                                                         */
/* ------------------------------------------------------------------ */

interface ChatStore {
  isOpen: boolean;
  context: ChatContextData;
  pendingQuestion: string | null;
  messages: ChatMessageData[];

  setIsOpen: (open: boolean) => void;
  setContext: (ctx: ChatContextData) => void;
  askQuestion: (question: string, ctx?: Partial<ChatContextData>) => void;
  clearPendingQuestion: () => void;
  setMessages: (updater: ChatMessageData[] | ((prev: ChatMessageData[]) => ChatMessageData[])) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  context: { view: "trapezoid" },
  pendingQuestion: null,
  messages: [],

  setIsOpen: (open) => set({ isOpen: open }),
  setContext: (ctx) => set({ context: ctx }),
  askQuestion: (question, ctx) =>
    set((s) => ({
      pendingQuestion: question,
      isOpen: true,
      context: ctx ? { ...s.context, ...ctx } : s.context,
    })),
  clearPendingQuestion: () => set({ pendingQuestion: null }),
  setMessages: (updater) =>
    set((s) => ({
      messages: typeof updater === "function" ? updater(s.messages) : updater,
    })),
  clearMessages: () => set({ messages: [] }),
}));

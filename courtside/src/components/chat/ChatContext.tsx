"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ChatContext as ChatContextData } from "@/lib/api";

interface ChatState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  context: ChatContextData;
  setContext: (ctx: ChatContextData) => void;
  pendingQuestion: string | null;
  askQuestion: (question: string, ctx?: Partial<ChatContextData>) => void;
  clearPendingQuestion: () => void;
}

const ChatCtx = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<ChatContextData>({ view: "trapezoid" });
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);

  const askQuestion = useCallback(
    (question: string, ctx?: Partial<ChatContextData>) => {
      if (ctx) {
        setContext((prev) => ({ ...prev, ...ctx }));
      }
      setPendingQuestion(question);
      setIsOpen(true);
    },
    []
  );

  const clearPendingQuestion = useCallback(() => {
    setPendingQuestion(null);
  }, []);

  return (
    <ChatCtx.Provider
      value={{
        isOpen,
        setIsOpen,
        context,
        setContext,
        pendingQuestion,
        askQuestion,
        clearPendingQuestion,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

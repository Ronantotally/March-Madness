"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, Trash2 } from "lucide-react";
import { useChatStore } from "@/lib/stores";
import { streamChat, ChatMessageData } from "@/lib/api";

const STARTER_PROMPTS = [
  "Who are the real title contenders?",
  "Which first-round upset should I pick?",
  "Make the case for Louisville winning it all",
  "Break down Iowa vs Clemson",
];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPanel() {
  const isOpen = useChatStore((s) => s.isOpen);
  const setIsOpen = useChatStore((s) => s.setIsOpen);
  const context = useChatStore((s) => s.context);
  const pendingQuestion = useChatStore((s) => s.pendingQuestion);
  const clearPendingQuestion = useChatStore((s) => s.clearPendingQuestion);
  const messages = useChatStore((s) => s.messages);
  const setMessages = useChatStore((s) => s.setMessages);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isStreamingRef = useRef(false);
  const inputValueRef = useRef("");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle pending question from "Ask the Analyst"
  useEffect(() => {
    if (pendingQuestion && isOpen && !isStreamingRef.current) {
      sendMessage(pendingQuestion);
      clearPendingQuestion();
    }
  }, [pendingQuestion, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreamingRef.current) return;

      const userMsg: ChatMessageData = {
        id: generateId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };

      const assistantMsg: ChatMessageData = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      const currentMessages = useChatStore.getState().messages;
      setMessages([...currentMessages, userMsg, assistantMsg]);
      inputValueRef.current = "";
      if (inputRef.current) inputRef.current.value = "";
      isStreamingRef.current = true;

      const history = [...currentMessages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamChat(
        history,
        context,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + chunk,
              };
            }
            return updated;
          });
        },
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                isStreaming: false,
              };
            }
            return updated;
          });
          isStreamingRef.current = false;
        },
        (error) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "assistant") {
              updated[updated.length - 1] = {
                ...last,
                content: `Error: ${error}`,
                isStreaming: false,
              };
            }
            return updated;
          });
          isStreamingRef.current = false;
        }
      );
    },
    [context, setMessages]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValueRef.current);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold text-background shadow-lg transition-transform hover:scale-105"
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
            className="fixed right-0 top-0 z-40 flex h-full w-full flex-col border-l border-border bg-surface shadow-2xl sm:w-[400px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-accent-gold" />
                <h2 className="text-sm font-semibold text-text-primary">
                  Courtside AI
                </h2>
                <span className="rounded bg-accent-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-medium text-accent-gold">
                  Claude
                </span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearMessages}
                    className="rounded p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                    title="Clear chat"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col">
                  {/* Empty state */}
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10">
                      <MessageSquare size={20} className="text-accent-gold" />
                    </div>
                    <p className="mb-1 text-sm font-medium text-text-primary">
                      Ask the Analyst
                    </p>
                    <p className="mb-6 text-xs text-text-secondary">
                      Get data-backed insights on any team, matchup, or bracket strategy.
                    </p>
                  </div>

                  {/* Starter prompts */}
                  <div className="space-y-2 pb-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary/50">
                      Try asking
                    </p>
                    {STARTER_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="block w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:border-accent-gold/30 hover:text-text-primary"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`fade-in-up flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                          msg.role === "user"
                            ? "bg-accent-gold/15 text-text-primary"
                            : "bg-background text-text-primary"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="whitespace-pre-wrap">
                            {msg.content || (
                              <span className="flex items-center gap-2 text-text-secondary">
                                <Loader2 size={12} className="animate-spin" />
                                Analyzing...
                              </span>
                            )}
                            {msg.isStreaming && msg.content && (
                              <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-accent-gold" />
                            )}
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input area */}
            <form onSubmit={handleSubmit} className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  defaultValue=""
                  onChange={(e) => {
                    inputValueRef.current = e.target.value;
                  }}
                  placeholder="Ask about a team or matchup..."
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  className="rounded p-1 text-text-secondary transition-colors hover:text-accent-gold disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

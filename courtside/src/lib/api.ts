import { Team } from "@/types";

// Tool result types returned by the API
export interface ToolResult {
  tool: string;
  result: unknown;
}

export interface ChatContext {
  view: "trapezoid" | "bracket";
  selectedTeam?: Team | null;
  matchup?: { teamA: Team; teamB: Team } | null;
}

export interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export async function streamChat(
  messages: { role: "user" | "assistant"; content: string }[],
  context: ChatContext,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });

    if (!res.ok) {
      const errText = await res.text();
      onError(errText || `API error: ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError("No response stream");
      return;
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE lines
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
          } catch {
            // Partial JSON, skip
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Network error");
  }
}

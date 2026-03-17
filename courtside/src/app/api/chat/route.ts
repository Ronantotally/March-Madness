import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import teamsData from "@/data/teams.json";
import { TeamsData, Team } from "@/types";

const data = teamsData as TeamsData;

// --- Rate limiting ---
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20;
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitStore.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  return false;
}

// Clean up stale entries every 5 minutes
if (typeof globalThis !== "undefined") {
  const cleanup = () => {
    const now = Date.now();
    rateLimitStore.forEach((timestamps, ip) => {
      const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (recent.length === 0) rateLimitStore.delete(ip);
      else rateLimitStore.set(ip, recent);
    });
  };
  setInterval(cleanup, 5 * 60_000);
}

const SYSTEM_PROMPT = `You are Courtside's AI basketball analyst — sharp, opinionated, data-grounded. You know the 2026 NCAA Tournament inside and out.

You analyze through two frameworks:
1. Trapezoid of Excellence (Ryan Hammer @RyanHammer09): pace vs net rating scatter. Championship teams fall inside the trapezoid.
2. KenPom Championship Formula: 22 of 23 recent champs were top 25 in both AdjO and AdjD, top 25 overall, and top 45 SOS.

2026 title contenders (both filters): Duke, Arizona, Michigan, Florida, Houston, Iowa State, Michigan State, Louisville (6-seed value pick).

Key insights from the data:
- Iowa (#25 KenPom, 9-seed) is inside the trapezoid — Clemson should be worried.
- Alabama has #3 offense but #67 defense — classic pretender profile despite the 4-seed.
- Louisville is the biggest sleeper as a 6-seed title contender meeting ALL championship formula criteria.
- Northern Iowa's #24 defense is elite for a 12-seed. St. John's should take notice.
- Purdue has the #1 offense but #36 defense — similar red flag to Alabama.
- Illinois (#2 offense) and Vanderbilt (#7 offense) are offensive juggernauts inside the trapezoid.

Reference specific numbers. Have opinions. 2-3 paragraphs unless asked for more.

Here is the complete tournament data:
${JSON.stringify(data, null, 0)}`;

// Tool definitions for Claude
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "get_team_stats",
    description: "Get the full KenPom profile and tournament data for a specific team by name.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Team name (e.g. 'Duke', 'Iowa St.', 'N.C. State')" },
      },
      required: ["name"],
    },
  },
  {
    name: "compare_teams",
    description: "Get a head-to-head matchup analysis between two teams, including win probability, stat edges, pace mismatch, upset risk, and key factors.",
    input_schema: {
      type: "object" as const,
      properties: {
        teamA: { type: "string", description: "First team name" },
        teamB: { type: "string", description: "Second team name" },
      },
      required: ["teamA", "teamB"],
    },
  },
  {
    name: "get_upset_candidates",
    description: "Get games with high upset risk in the first round, based on AdjEM gaps, tier mismatches, and historical seed rates.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_title_contenders",
    description: "Get a breakdown of teams by tier: title contenders, trapezoid elite, trapezoid teams, and long shots.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

function findTeam(name: string): Team | undefined {
  return data.teams.find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
}

function executeToolCall(name: string, input: Record<string, string>): string {
  switch (name) {
    case "get_team_stats": {
      const team = findTeam(input.name);
      if (!team) return JSON.stringify({ error: `Team '${input.name}' not found` });
      return JSON.stringify(team, null, 2);
    }

    case "compare_teams": {
      const teamA = findTeam(input.teamA);
      const teamB = findTeam(input.teamB);
      if (!teamA) return JSON.stringify({ error: `Team '${input.teamA}' not found` });
      if (!teamB) return JSON.stringify({ error: `Team '${input.teamB}' not found` });

      const netRtgDiff = teamA.netRtg - teamB.netRtg;
      const winProbA = 1 / (1 + Math.exp(-0.1 * netRtgDiff));

      return JSON.stringify({
        teamA: { name: teamA.name, seed: teamA.seed, kenpomRank: teamA.kenpomRank, netRtg: teamA.netRtg, oRtg: teamA.oRtg, oRtgRank: teamA.oRtgRank, dRtg: teamA.dRtg, dRtgRank: teamA.dRtgRank, adjT: teamA.adjT, tier: teamA.tier, insideTrapezoid: teamA.insideTrapezoid, meetsChampFormula: teamA.meetsChampFormula },
        teamB: { name: teamB.name, seed: teamB.seed, kenpomRank: teamB.kenpomRank, netRtg: teamB.netRtg, oRtg: teamB.oRtg, oRtgRank: teamB.oRtgRank, dRtg: teamB.dRtg, dRtgRank: teamB.dRtgRank, adjT: teamB.adjT, tier: teamB.tier, insideTrapezoid: teamB.insideTrapezoid, meetsChampFormula: teamB.meetsChampFormula },
        winProbabilityA: Math.round(winProbA * 1000) / 10,
        winProbabilityB: Math.round((1 - winProbA) * 1000) / 10,
        adjEMGap: Math.round(Math.abs(netRtgDiff) * 100) / 100,
        paceMismatch: Math.round(Math.abs(teamA.adjT - teamB.adjT) * 10) / 10,
        frameworkEdge: teamA.insideTrapezoid && !teamB.insideTrapezoid ? teamA.name : teamB.insideTrapezoid && !teamA.insideTrapezoid ? teamB.name : "Neither/Both",
      }, null, 2);
    }

    case "get_upset_candidates": {
      const upsetCandidates = data.teams
        .filter((t) => t.seed >= 9 && t.seed <= 12)
        .map((lower) => {
          const expectedOppSeed = 17 - lower.seed;
          const potentialOpponents = data.teams.filter(
            (t) => t.seed === expectedOppSeed && t.region === lower.region
          );
          return potentialOpponents.map((higher) => {
            const gap = higher.netRtg - lower.netRtg;
            return {
              game: `(${higher.seed}) ${higher.name} vs (${lower.seed}) ${lower.name}`,
              region: lower.region,
              adjEMGap: Math.round(gap * 100) / 100,
              higherTier: higher.tier,
              lowerTier: lower.tier,
              lowerInsideTrapezoid: lower.insideTrapezoid,
              lowerKenpomRank: lower.kenpomRank,
              risk: gap < 5 ? "HIGH" : gap < 10 ? "MEDIUM" : "LOW",
            };
          });
        })
        .flat()
        .sort((a, b) => a.adjEMGap - b.adjEMGap);
      return JSON.stringify(upsetCandidates, null, 2);
    }

    case "get_title_contenders": {
      const tiers: Record<string, { name: string; seed: number; kenpomRank: number; netRtg: number; region: string }[]> = {
        title_contender: [],
        trapezoid_elite: [],
        trapezoid_team: [],
        kenpom_sleeper: [],
        long_shot: [],
      };
      for (const t of data.teams) {
        if (tiers[t.tier]) {
          tiers[t.tier].push({ name: t.name, seed: t.seed, kenpomRank: t.kenpomRank, netRtg: t.netRtg, region: t.region });
        }
      }
      return JSON.stringify({
        title_contenders: { count: tiers.title_contender.length, teams: tiers.title_contender },
        trapezoid_elite: { count: tiers.trapezoid_elite.length, teams: tiers.trapezoid_elite },
        trapezoid_team: { count: tiers.trapezoid_team.length, teams: tiers.trapezoid_team },
        kenpom_sleeper: { count: tiers.kenpom_sleeper.length, teams: tiers.kenpom_sleeper },
        long_shot: { count: tiers.long_shot.length, teams: tiers.long_shot },
      }, null, 2);
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "You're sending too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "data: " + JSON.stringify({ error: "ANTHROPIC_API_KEY not configured. Add it to your .env.local file." }) + "\n\n",
      { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }

  const client = new Anthropic({ apiKey });

  const body = await req.json();
  const { messages, context } = body;

  // Build context-aware system addition
  let contextNote = "";
  if (context?.selectedTeam) {
    contextNote += `\n\nThe user is currently viewing ${context.selectedTeam.name} (${context.selectedTeam.seed}-seed, ${context.selectedTeam.region}).`;
  }
  if (context?.matchup) {
    contextNote += `\n\nThe user is looking at the matchup: ${context.matchup.teamA.name} vs ${context.matchup.teamB.name}.`;
  }
  if (context?.view) {
    contextNote += `\n\nThe user is on the ${context.view} view.`;
  }

  const systemPrompt = SYSTEM_PROMPT + contextNote;

  // Convert messages to Anthropic format
  const anthropicMessages: Anthropic.Messages.MessageParam[] = messages.map(
    (m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  // Create streaming response
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Agentic loop: keep calling Claude until no more tool use
        let currentMessages = [...anthropicMessages];
        let continueLoop = true;

        while (continueLoop) {
          continueLoop = false;

          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            tools,
            messages: currentMessages,
            stream: true,
          });

          let assistantText = "";
          const toolUseBlocks: { id: string; name: string; input: string }[] = [];
          let currentToolId = "";
          let currentToolName = "";
          let currentToolInput = "";
          let inToolUse = false;

          for await (const event of response) {
            if (event.type === "content_block_start") {
              if (event.content_block.type === "tool_use") {
                inToolUse = true;
                currentToolId = event.content_block.id;
                currentToolName = event.content_block.name;
                currentToolInput = "";
              }
            } else if (event.type === "content_block_delta") {
              if (event.delta.type === "text_delta") {
                assistantText += event.delta.text;
                controller.enqueue(
                  encoder.encode("data: " + JSON.stringify({ text: event.delta.text }) + "\n\n")
                );
              } else if (event.delta.type === "input_json_delta") {
                currentToolInput += event.delta.partial_json;
              }
            } else if (event.type === "content_block_stop") {
              if (inToolUse) {
                toolUseBlocks.push({
                  id: currentToolId,
                  name: currentToolName,
                  input: currentToolInput,
                });
                inToolUse = false;
              }
            }
          }

          // If there were tool calls, execute them and continue
          if (toolUseBlocks.length > 0) {
            continueLoop = true;

            // Build the assistant message with all content blocks
            const assistantContent: Anthropic.Messages.ContentBlockParam[] = [];
            if (assistantText) {
              assistantContent.push({ type: "text", text: assistantText });
            }
            for (const tb of toolUseBlocks) {
              let parsedInput = {};
              try { parsedInput = JSON.parse(tb.input); } catch { /* empty */ }
              assistantContent.push({
                type: "tool_use",
                id: tb.id,
                name: tb.name,
                input: parsedInput,
              });
            }

            currentMessages = [
              ...currentMessages,
              { role: "assistant" as const, content: assistantContent },
            ];

            // Execute tools and add results
            const toolResults: Anthropic.Messages.ToolResultBlockParam[] = toolUseBlocks.map((tb) => {
              let parsedInput: Record<string, string> = {};
              try { parsedInput = JSON.parse(tb.input); } catch { /* empty */ }
              const result = executeToolCall(tb.name, parsedInput);
              return {
                type: "tool_result" as const,
                tool_use_id: tb.id,
                content: result,
              };
            });

            currentMessages.push({ role: "user" as const, content: toolResults });
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(
          encoder.encode("data: " + JSON.stringify({ error: errorMsg }) + "\n\n")
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

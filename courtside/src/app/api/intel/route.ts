import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "edge";

interface NewsItem {
  headline: string;
  detail: string;
  source: string;
  category: "injury" | "upset_alert" | "stat" | "storyline" | "bracket_tip";
}

// In-memory cache (persists across requests within the same edge function instance)
let cachedIntel: { items: NewsItem[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  // Return cached data if still fresh
  if (cachedIntel && Date.now() - cachedIntel.timestamp < CACHE_TTL) {
    return NextResponse.json({
      items: cachedIntel.items,
      timestamp: cachedIntel.timestamp,
      cached: true,
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    // Use web search tool to get real tournament news
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3,
        } as unknown as Anthropic.Messages.Tool,
      ],
      messages: [
        {
          role: "user",
          content:
            'Search for the latest 2026 NCAA March Madness tournament news, injury updates, and interesting stats from today. Only include information from legitimate sports news sources (ESPN, The Athletic, Yahoo Sports, CBS Sports, AP, SI). Return exactly 6 items as a JSON array where each item has: headline (short, punchy), detail (1-2 sentences), source (publication name), and category (one of: \'injury\', \'upset_alert\', \'stat\', \'storyline\', \'bracket_tip\'). Only include facts you can verify from search results. Do not fabricate anything. Return ONLY the JSON array, no other text.',
        },
      ],
    });

    // Extract text content from response
    let text = "";
    for (const block of response.content) {
      if (block.type === "text") {
        text += block.text;
      }
    }

    // Parse JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse news data" },
        { status: 500 }
      );
    }

    const items: NewsItem[] = JSON.parse(jsonMatch[0]);

    // Validate and sanitize
    const validCategories = new Set([
      "injury",
      "upset_alert",
      "stat",
      "storyline",
      "bracket_tip",
    ]);
    const sanitized = items
      .filter(
        (item) =>
          item.headline &&
          item.detail &&
          item.source &&
          validCategories.has(item.category)
      )
      .slice(0, 6);

    const now = Date.now();
    cachedIntel = { items: sanitized, timestamp: now };

    return NextResponse.json({
      items: sanitized,
      timestamp: now,
      cached: false,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to fetch tournament intel",
      },
      { status: 500 }
    );
  }
}

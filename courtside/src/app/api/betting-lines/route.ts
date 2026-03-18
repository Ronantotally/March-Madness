import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  In-memory cache (30 min TTL)                                       */
/* ------------------------------------------------------------------ */

interface CachedData {
  data: BettingGame[];
  fetchedAt: number;
}

let cache: CachedData | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BettingGame {
  teamA: string;
  teamB: string;
  moneylineA: string;
  moneylineB: string;
  mlBetPctA: string;
  mlBetPctB: string;
  mlDollarPctA: string;
  mlDollarPctB: string;
  spread: string;
  spreadBetPctA: string;
  spreadBetPctB: string;
  spreadDollarPctA: string;
  spreadDollarPctB: string;
  total: string;
  gameDate: string;
  gameTime: string;
}

/* ------------------------------------------------------------------ */
/*  Team name mapping: abbreviations → full names from teams.json      */
/* ------------------------------------------------------------------ */

const ABBREV_TO_FULL: Record<string, string> = {
  // East Region
  DUK: "Duke", DUKE: "Duke",
  SIE: "Siena", SIENA: "Siena",
  OSU: "Ohio St.", "OHIO ST": "Ohio St.", OHST: "Ohio St.",
  TCU: "TCU",
  SJU: "St. John's", "ST JOHN'S": "St. John's", STJN: "St. John's", "ST. JOHN'S": "St. John's",
  NIA: "Northern Iowa", UNI: "Northern Iowa", "N IOWA": "Northern Iowa", "NORTHERN IOWA": "Northern Iowa",
  KU: "Kansas", KAN: "Kansas", KANSAS: "Kansas",
  CBU: "Cal Baptist", "CAL BAPTIST": "Cal Baptist", CALB: "Cal Baptist", CBP: "Cal Baptist",
  LOU: "Louisville", LOUISVILLE: "Louisville",
  USF: "South Florida", "S FLORIDA": "South Florida", "SOUTH FLORIDA": "South Florida",
  MSU: "Michigan St.", "MICH ST": "Michigan St.", MICHST: "Michigan St.", "MICHIGAN ST": "Michigan St.",
  NDSU: "N. Dakota St.", "N DAKOTA ST": "N. Dakota St.", "ND STATE": "N. Dakota St.", NDS: "N. Dakota St.",
  UCLA: "UCLA",
  UCF: "UCF",
  UCONN: "UConn", CONN: "UConn",
  FUR: "Furman", FURMAN: "Furman",

  // South Region
  FLA: "Florida", FLORIDA: "Florida", UF: "Florida",
  LEH: "Lehigh", LEHIGH: "Lehigh",
  PVAM: "Prairie View A&M", "PRAIRIE VIEW": "Prairie View A&M", PV: "Prairie View A&M", "PRAIRIE VIEW A&M": "Prairie View A&M",
  CLEM: "Clemson", CLEMSON: "Clemson",
  IOWA: "Iowa",
  VAN: "Vanderbilt", VANDY: "Vanderbilt", VANDERBILT: "Vanderbilt",
  MCN: "McNeese", MCNEESE: "McNeese",
  NEB: "Nebraska", NEBRASKA: "Nebraska",
  TROY: "Troy",
  UNC: "North Carolina", "N CAROLINA": "North Carolina", "NORTH CAROLINA": "North Carolina",
  VCU: "VCU",
  ILL: "Illinois", ILLINOIS: "Illinois",
  PENN: "Penn",
  SMC: "Saint Mary's", "SAINT MARY'S": "Saint Mary's", "ST MARY'S": "Saint Mary's", STMAR: "Saint Mary's",
  TAMU: "Texas A&M", "TEXAS A&M": "Texas A&M", "TEX A&M": "Texas A&M", TAM: "Texas A&M",
  HOU: "Houston", HOUSTON: "Houston",
  IDHO: "Idaho", IDAHO: "Idaho",

  // Midwest Region
  MICH: "Michigan", MICHIGAN: "Michigan", UM: "Michigan",
  UMBC: "UMBC",
  HOW: "Howard", HOWARD: "Howard",
  UGA: "Georgia", GEORGIA: "Georgia", GA: "Georgia",
  SLU: "Saint Louis", "SAINT LOUIS": "Saint Louis", "ST LOUIS": "Saint Louis",
  TTU: "Texas Tech", "TEXAS TECH": "Texas Tech", TT: "Texas Tech", "TEX TECH": "Texas Tech",
  AKR: "Akron", AKRON: "Akron",
  BAMA: "Alabama", ALA: "Alabama", ALABAMA: "Alabama",
  HOF: "Hofstra", HOFSTRA: "Hofstra",
  TENN: "Tennessee", TENNESSEE: "Tennessee",
  SMU: "SMU",
  "MIAMI OH": "Miami OH", MOH: "Miami OH", MIAOH: "Miami OH",
  UVA: "Virginia", VA: "Virginia", VIRGINIA: "Virginia",
  WSU: "Wright St.", "WRIGHT ST": "Wright St.", WRST: "Wright St.",
  UK: "Kentucky", KY: "Kentucky", KENTUCKY: "Kentucky",
  SCU: "Santa Clara", "SANTA CLARA": "Santa Clara",
  ISU: "Iowa St.", "IOWA ST": "Iowa St.", IAST: "Iowa St.",
  TNST: "Tennessee St.", "TENN ST": "Tennessee St.", "TENNESSEE ST": "Tennessee St.", TSU: "Tennessee St.",

  // West Region
  ARIZ: "Arizona", AZ: "Arizona", ARIZONA: "Arizona",
  LIU: "LIU",
  NOVA: "Villanova", VILLANOVA: "Villanova", VILL: "Villanova",
  USU: "Utah St.", "UTAH ST": "Utah St.", UTST: "Utah St.",
  WIS: "Wisconsin", WISC: "Wisconsin", WISCONSIN: "Wisconsin",
  HP: "High Point", "HIGH POINT": "High Point",
  ARK: "Arkansas", ARKANSAS: "Arkansas",
  HAW: "Hawaii", HAWAII: "Hawaii",
  BYU: "BYU",
  NCST: "N.C. State", "NC STATE": "N.C. State", "NC ST": "N.C. State", "N.C. STATE": "N.C. State",
  TEX: "Texas", TEXAS: "Texas",
  GONZ: "Gonzaga", ZAGS: "Gonzaga", GONZAGA: "Gonzaga", GU: "Gonzaga",
  KENN: "Kennesaw St.", "KENNESAW ST": "Kennesaw St.", KSU: "Kennesaw St.", KNST: "Kennesaw St.",
  MIA: "Miami FL", MIAMI: "Miami FL", "MIAMI FL": "Miami FL",
  MIZ: "Missouri", MISSOURI: "Missouri", MO: "Missouri",
  PUR: "Purdue", PURDUE: "Purdue",
  QU: "Queens", QUEENS: "Queens",
};

/**
 * Try to resolve a raw team name/abbreviation to our canonical name.
 */
function resolveTeamName(raw: string): string {
  const upper = raw.trim().toUpperCase();
  // Direct match
  if (ABBREV_TO_FULL[upper]) return ABBREV_TO_FULL[upper];
  // Partial match: check if it starts with any known key
  for (const [abbr, full] of Object.entries(ABBREV_TO_FULL)) {
    if (upper.startsWith(abbr) || abbr.startsWith(upper)) return full;
  }
  // Fuzzy: check if the raw string is a substring of a full name
  for (const full of Object.values(ABBREV_TO_FULL)) {
    if (full.toUpperCase().includes(upper) || upper.includes(full.toUpperCase())) return full;
  }
  return raw.trim();
}

/* ------------------------------------------------------------------ */
/*  Fetch betting data via Anthropic API with web search               */
/* ------------------------------------------------------------------ */

const PROMPT = `Search for NCAA Tournament 2026 first round betting lines, moneylines, spreads, and public betting percentages from sportsbettingdime.com college basketball public betting trends page. For each first round game, extract: team names, moneyline for each team, spread, and the BET% and $% columns for both moneyline and spread. BET% is the percentage of individual bets and $% is the percentage of total money wagered. Return as a JSON array where each game is: { "teamA": "<team name>", "teamB": "<team name>", "moneylineA": "<value>", "moneylineB": "<value>", "mlBetPctA": "<value>", "mlBetPctB": "<value>", "mlDollarPctA": "<value>", "mlDollarPctB": "<value>", "spread": "<value>", "spreadBetPctA": "<value>", "spreadBetPctB": "<value>", "spreadDollarPctA": "<value>", "spreadDollarPctB": "<value>", "total": "<value>", "gameDate": "<value>", "gameTime": "<value>" }. Get ALL tournament first round games. IMPORTANT: Return ONLY a raw JSON array, no markdown formatting, no code blocks, no explanation. Just the JSON.`;

async function fetchBettingData(): Promise<BettingGame[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  // Use raw fetch to avoid SDK typing issues with web_search tool
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 10,
        },
      ],
      messages: [
        {
          role: "user",
          content: PROMPT,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errBody}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body = (await res.json()) as any;

  // Extract text content from response
  let jsonText = "";
  for (const block of body.content ?? []) {
    if (block.type === "text") {
      jsonText += block.text;
    }
  }

  if (!jsonText) {
    throw new Error("No text content in Anthropic response");
  }

  // Strip markdown code fences if present
  jsonText = jsonText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  // Find the JSON array
  const arrayStart = jsonText.indexOf("[");
  const arrayEnd = jsonText.lastIndexOf("]");
  if (arrayStart === -1 || arrayEnd === -1) {
    throw new Error("No JSON array found in response");
  }

  const parsed = JSON.parse(jsonText.slice(arrayStart, arrayEnd + 1)) as BettingGame[];

  // Resolve team names
  return parsed.map((game) => ({
    ...game,
    teamA: resolveTeamName(game.teamA),
    teamB: resolveTeamName(game.teamB),
  }));
}

/* ------------------------------------------------------------------ */
/*  GET handler                                                        */
/* ------------------------------------------------------------------ */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forceRefresh = url.searchParams.get("refresh") === "1";

  // Return cached data if fresh
  if (!forceRefresh && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      games: cache.data,
      fetchedAt: cache.fetchedAt,
      cached: true,
    });
  }

  try {
    const games = await fetchBettingData();
    cache = { data: games, fetchedAt: Date.now() };

    return NextResponse.json({
      games,
      fetchedAt: cache.fetchedAt,
      cached: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch betting data";
    console.error("Betting lines fetch error:", msg);
    // Return stale cache if available
    if (cache) {
      return NextResponse.json({
        games: cache.data,
        fetchedAt: cache.fetchedAt,
        cached: true,
        stale: true,
        error: msg,
      });
    }
    return NextResponse.json({ error: msg, games: [] }, { status: 500 });
  }
}

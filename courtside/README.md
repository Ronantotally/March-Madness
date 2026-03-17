# Courtside — March Madness Analytics 2026

Interactive analytics app for the 2026 NCAA Tournament featuring the Trapezoid of Excellence visualization, an interactive bracket builder, and an AI-powered analyst chat.

## Features

- **Trapezoid of Excellence** — Custom SVG scatter plot of all 68 tournament teams by pace vs. net rating, with tier-based coloring, filters, and detailed team cards
- **Bracket Builder** — Interactive bracket with click-to-pick, cascade clearing, matchup confidence colors, win probability, and upset risk analysis
- **AI Analyst Chat** — Claude-powered analyst with tool use for team stats, head-to-head comparisons, upset candidates, and title contender breakdowns
- **Cross-page Navigation** — Click "View in Bracket" from a team card or "View on Trapezoid" from a matchup to jump between views
- **Share Cards** — Generate and share your bracket summary with champion, Final Four, and stats

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (dark theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Fonts**: Geist Sans / Geist Mono

## Data Sources

- **KenPom** (kenpom.com) — All team statistics (AdjO, AdjD, AdjEM, AdjT, SOS, etc.)
- **Trapezoid of Excellence** — Ryan Hammer (@RyanHammer09) — boundary coordinates and framework
- **Championship Formula** — 22 of last 23 champions met: top 25 AdjO, top 25 AdjD, top 25 overall, top 45 SOS

## Setup

```bash
# Clone and install
git clone <repo-url>
cd courtside
npm install

# Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local and add your key

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The Trapezoid and Bracket views work without an API key. The AI chat requires an Anthropic API key.

## Deploy to Vercel

1. Push your repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Set the **Root Directory** to `courtside`
4. Add the environment variable `ANTHROPIC_API_KEY` in Vercel project settings
5. Deploy

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes (for chat) | Your Anthropic API key. Server-side only — never exposed to the client. |

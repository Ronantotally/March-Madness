"use client";

import { LatLng } from "@/data/locations";

/**
 * Minimal US map SVG with flight-path lines from two team campuses to a venue.
 * Uses an Albers-like projection (simplified) to map lat/lng → pixel coords.
 * Hawaii is placed in an inset position.
 */

/* ------------------------------------------------------------------ */
/*  Map dimensions & projection                                        */
/* ------------------------------------------------------------------ */

const W = 250;
const H = 150;
const PAD = 14;

// Simple equirectangular projection bounds for continental US
const LNG_MIN = -125;
const LNG_MAX = -66;
const LAT_MIN = 24;
const LAT_MAX = 50;

function project(coord: LatLng): { x: number; y: number } {
  // Hawaii special case: place in bottom-left inset
  if (coord.lat < 23) {
    return { x: PAD + 15, y: H - PAD - 5 };
  }
  const x = PAD + ((coord.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (W - 2 * PAD);
  const y = PAD + ((LAT_MAX - coord.lat) / (LAT_MAX - LAT_MIN)) * (H - 2 * PAD);
  return { x, y };
}

/* ------------------------------------------------------------------ */
/*  Simplified US state outlines                                       */
/*  Minimal paths for the continental US boundary + a few key state     */
/*  borders to give geographic context. Deliberately low-detail.        */
/* ------------------------------------------------------------------ */

// Continental US outline (very simplified polygon)
const US_OUTLINE =
  "M30,25 L35,22 L42,20 L50,18 L58,16 L68,15 L78,14 L88,16 L98,18 " +
  "L108,17 L118,16 L128,18 L138,20 L148,18 L155,17 L162,20 L168,22 " +
  "L175,20 L182,22 L190,25 L200,24 L208,26 L215,30 L220,35 L222,42 " +
  "L225,50 L226,60 L224,70 L220,78 L218,85 L220,90 L224,95 L226,100 " +
  "L222,108 L218,112 L212,115 L205,112 L200,114 L195,118 L188,122 " +
  "L180,125 L172,126 L165,128 L158,130 L150,128 L142,125 L135,122 " +
  "L128,120 L120,122 L112,125 L105,128 L98,130 L90,128 L82,125 " +
  "L75,122 L68,118 L60,115 L52,118 L45,122 L38,125 L32,128 L28,125 " +
  "L25,120 L22,112 L20,105 L18,98 L16,90 L15,82 L16,75 L18,68 " +
  "L20,60 L22,52 L24,45 L26,38 L28,32 Z";

// A few internal state boundary lines (approximate) for visual texture
const STATE_LINES = [
  // Mississippi River (roughly)
  "M145,30 L143,45 L142,60 L140,75 L138,90 L136,105 L138,115 L140,125",
  // Appalachian divide
  "M198,35 L195,50 L192,65 L190,80 L192,95 L195,105 L198,115",
  // Great Plains vertical
  "M108,25 L108,45 L108,65 L108,85 L108,105 L108,120",
  // Southern border states
  "M60,115 L80,112 L100,115 L120,118 L140,120",
  // Northern tier
  "M30,45 L60,42 L90,40 L120,38 L150,40 L180,38 L200,40",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface TravelMapProps {
  venueCoord: LatLng;
  teamACoord: LatLng;
  teamBCoord: LatLng;
  teamAName: string;
  teamBName: string;
  teamAMiles: number;
  teamBMiles: number;
  compact?: boolean; // Smaller version for upset radar
}

export default function TravelMap({
  venueCoord,
  teamACoord,
  teamBCoord,
  teamAName,
  teamBName,
  teamAMiles,
  teamBMiles,
  compact = false,
}: TravelMapProps) {
  const venue = project(venueCoord);
  const a = project(teamACoord);
  const b = project(teamBCoord);

  const aCloser = teamAMiles <= teamBMiles;

  const w = compact ? 200 : W;
  const h = compact ? 120 : H;

  // Abbreviate team name for labels
  const abbrev = (name: string) => {
    if (name.length <= 6) return name;
    // Use first word or abbreviation
    const parts = name.split(/[\s.]+/);
    if (parts.length > 1) return parts.map(p => p[0]).join("").toUpperCase().slice(0, 4);
    return name.slice(0, 5);
  };

  const teamALabel = abbrev(teamAName);
  const teamBLabel = abbrev(teamBName);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
    >
      {/* Background */}
      <rect width={W} height={H} rx={6} fill="var(--hex-bg)" />

      {/* US outline */}
      <path
        d={US_OUTLINE}
        fill="none"
        stroke="var(--hex-text-2)"
        strokeWidth={0.5}
        strokeOpacity={0.15}
      />

      {/* State lines for texture */}
      {STATE_LINES.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="var(--hex-text-2)"
          strokeWidth={0.3}
          strokeOpacity={0.08}
        />
      ))}

      {/* Flight path lines */}
      <line
        x1={venue.x} y1={venue.y}
        x2={a.x} y2={a.y}
        stroke={aCloser ? "#2EC4B6" : "var(--hex-text-2)"}
        strokeWidth={aCloser ? 1.5 : 1}
        strokeOpacity={aCloser ? 0.8 : 0.35}
        strokeDasharray={aCloser ? "none" : "3 2"}
      />
      <line
        x1={venue.x} y1={venue.y}
        x2={b.x} y2={b.y}
        stroke={!aCloser ? "#2EC4B6" : "var(--hex-text-2)"}
        strokeWidth={!aCloser ? 1.5 : 1}
        strokeOpacity={!aCloser ? 0.8 : 0.35}
        strokeDasharray={!aCloser ? "none" : "3 2"}
      />

      {/* Team A dot + label */}
      <circle cx={a.x} cy={a.y} r={3} fill={aCloser ? "#2EC4B6" : "var(--hex-text-2)"} fillOpacity={aCloser ? 1 : 0.5} />
      <text
        x={a.x}
        y={a.y - 6}
        textAnchor="middle"
        fill={aCloser ? "#2EC4B6" : "var(--hex-text-2)"}
        fontSize={compact ? 6 : 7}
        fontFamily="var(--font-mono)"
        fontWeight={aCloser ? 700 : 400}
        opacity={aCloser ? 1 : 0.6}
      >
        {teamALabel} {teamAMiles.toLocaleString()}mi
      </text>

      {/* Team B dot + label */}
      <circle cx={b.x} cy={b.y} r={3} fill={!aCloser ? "#2EC4B6" : "var(--hex-text-2)"} fillOpacity={!aCloser ? 1 : 0.5} />
      <text
        x={b.x}
        y={b.y + 11}
        textAnchor="middle"
        fill={!aCloser ? "#2EC4B6" : "var(--hex-text-2)"}
        fontSize={compact ? 6 : 7}
        fontFamily="var(--font-mono)"
        fontWeight={!aCloser ? 700 : 400}
        opacity={!aCloser ? 1 : 0.6}
      >
        {teamBLabel} {teamBMiles.toLocaleString()}mi
      </text>

      {/* Venue dot (on top) */}
      <circle cx={venue.x} cy={venue.y} r={4} fill="#F5A623" fillOpacity={0.9} />
      <circle cx={venue.x} cy={venue.y} r={7} fill="none" stroke="#F5A623" strokeWidth={0.8} strokeOpacity={0.4} />
    </svg>
  );
}

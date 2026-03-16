import teamsData from "./teams.json";
import { TrapezoidVertex, TeamsData } from "@/types";

const data = teamsData as TeamsData;
const boundary = data.trapezoidBoundary;

/**
 * Returns the 4 vertices of the trapezoid in order (for rendering and ray casting).
 * Order: topLeft → topRight → bottomRight → bottomLeft
 */
export function getTrapezoidVertices(): TrapezoidVertex[] {
  return [
    boundary.topLeft,
    boundary.topRight,
    boundary.bottomRight,
    boundary.bottomLeft,
  ];
}

/**
 * Ray casting algorithm to determine if a point (pace, netRtg) is inside the trapezoid.
 * Casts a ray from the point to the right and counts edge crossings.
 */
export function isInsideTrapezoid(pace: number, netRtg: number): boolean {
  const vertices = getTrapezoidVertices();
  const n = vertices.length;
  let inside = false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].pace;
    const yi = vertices[i].netRtg;
    const xj = vertices[j].pace;
    const yj = vertices[j].netRtg;

    const intersect =
      yi > netRtg !== yj > netRtg &&
      pace < ((xj - xi) * (netRtg - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates signed distance from a point to the trapezoid boundary.
 * Positive = inside, negative = outside.
 * Uses minimum distance to each edge of the trapezoid.
 */
export function distanceFromTrapezoid(pace: number, netRtg: number): number {
  const vertices = getTrapezoidVertices();
  const n = vertices.length;
  let minDist = Infinity;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dist = pointToSegmentDistance(
      pace,
      netRtg,
      vertices[i].pace,
      vertices[i].netRtg,
      vertices[j].pace,
      vertices[j].netRtg
    );
    minDist = Math.min(minDist, dist);
  }

  return isInsideTrapezoid(pace, netRtg) ? minDist : -minDist;
}

/**
 * Distance from point (px, py) to line segment (x1, y1) → (x2, y2).
 */
function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

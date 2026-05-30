import type { LevelDef } from "./types";

/**
 * Toy palette — high-saturation pastel that survives the soft drop shadow.
 */
const PALETTE = {
  red:    "#ef4444",
  orange: "#f97316",
  amber:  "#f59e0b",
  yellow: "#facc15",
  lime:   "#84cc16",
  green:  "#22c55e",
  teal:   "#14b8a6",
  cyan:   "#06b6d4",
  blue:   "#3b82f6",
  indigo: "#6366f1",
  violet: "#a855f7",
  pink:   "#ec4899",
} as const;

/**
 * Levels are hand-crafted and validated by the BFS solver (see solver.ts):
 *  - no two vehicles overlap at start,
 *  - every level is fully solvable,
 *  - `optimal` is the authored estimate; the true minimum is computed at
 *    runtime via `optimalFor(level)` and drives the star rating, so it is
 *    always at least the number of vehicles (each must be clicked to exit).
 *
 * `kind` is purely cosmetic (car / bus / truck / limo / bike) — it never
 * affects movement, only the silhouette drawn in Vehicle.tsx. By convention:
 * length 1 → bike, 2 → car, 3 → bus or limo, 4 → truck.
 *
 * Coordinate system: row 0 = top, col 0 = left.
 * direction: +1 = right/down (h/v), -1 = left/up.
 */
export const LEVELS: LevelDef[] = [
  /* ── EASY 1 ───────────────────────────────────────────────── */
  {
    id: "e1",
    name: "Warm-up",
    difficulty: "easy",
    rows: 5,
    cols: 5,
    optimal: 3,
    vehicles: [
      { id: "a", row: 2, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car", color: PALETTE.red },
      { id: "b", row: 0, col: 3, length: 2, orientation: "v", direction: 1,  kind: "car", color: PALETTE.cyan },
      { id: "c", row: 4, col: 1, length: 3, orientation: "h", direction: -1, kind: "bus", color: PALETTE.amber },
    ],
  },

  /* ── EASY 2 ───────────────────────────────────────────────── */
  {
    id: "e2",
    name: "Make Room",
    difficulty: "easy",
    rows: 5,
    cols: 5,
    optimal: 4,
    vehicles: [
      { id: "a", row: 2, col: 1, length: 2, orientation: "h", direction: 1,  kind: "car", color: PALETTE.red },
      { id: "b", row: 1, col: 4, length: 2, orientation: "v", direction: -1, kind: "car", color: PALETTE.violet },
      { id: "c", row: 0, col: 0, length: 2, orientation: "v", direction: 1,  kind: "car", color: PALETTE.green },
      { id: "d", row: 4, col: 2, length: 3, orientation: "h", direction: -1, kind: "bus", color: PALETTE.amber },
    ],
  },

  /* ── EASY 3 ───────────────────────────────────────────────── */
  {
    id: "e3",
    name: "Lane Swap",
    difficulty: "easy",
    rows: 6,
    cols: 5,
    optimal: 4,
    vehicles: [
      { id: "a", row: 0, col: 0, length: 2, orientation: "v", direction: 1,  kind: "car",  color: PALETTE.green },
      { id: "b", row: 2, col: 2, length: 2, orientation: "h", direction: 1,  kind: "car",  color: PALETTE.red },
      { id: "c", row: 4, col: 1, length: 2, orientation: "v", direction: -1, kind: "car",  color: PALETTE.blue },
      { id: "d", row: 0, col: 4, length: 3, orientation: "v", direction: 1,  kind: "limo", color: PALETTE.pink },
    ],
  },

  /* ── EASY 4 — bikes ───────────────────────────────────────── */
  {
    id: "e4",
    name: "Scooter Lane",
    difficulty: "easy",
    rows: 5,
    cols: 5,
    optimal: 6,
    vehicles: [
      { id: "a", row: 2, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car",  color: PALETTE.red },
      { id: "b", row: 2, col: 3, length: 1, orientation: "v", direction: 1,  kind: "bike", color: PALETTE.lime },
      { id: "d", row: 2, col: 4, length: 1, orientation: "v", direction: -1, kind: "bike", color: PALETTE.cyan },
      { id: "e", row: 4, col: 0, length: 3, orientation: "h", direction: 1,  kind: "bus",  color: PALETTE.amber },
      { id: "f", row: 0, col: 0, length: 2, orientation: "v", direction: 1,  kind: "car",  color: PALETTE.violet },
      { id: "g", row: 0, col: 2, length: 1, orientation: "h", direction: 1,  kind: "bike", color: PALETTE.pink },
    ],
  },

  /* ── MEDIUM 1 ─────────────────────────────────────────────── */
  {
    id: "m1",
    name: "Cross Traffic",
    difficulty: "medium",
    rows: 6,
    cols: 6,
    optimal: 5,
    vehicles: [
      { id: "a", row: 2, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car", color: PALETTE.red },
      { id: "b", row: 0, col: 3, length: 3, orientation: "v", direction: 1,  kind: "bus", color: PALETTE.indigo },
      { id: "c", row: 3, col: 2, length: 2, orientation: "h", direction: -1, kind: "car", color: PALETTE.teal },
      { id: "d", row: 4, col: 4, length: 2, orientation: "v", direction: 1,  kind: "car", color: PALETTE.orange },
      { id: "e", row: 0, col: 1, length: 2, orientation: "v", direction: -1, kind: "car", color: PALETTE.lime },
    ],
  },

  /* ── MEDIUM 2 ─────────────────────────────────────────────── */
  {
    id: "m2",
    name: "Gridlock",
    difficulty: "medium",
    rows: 6,
    cols: 6,
    optimal: 6,
    vehicles: [
      { id: "a", row: 1, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car",  color: PALETTE.red },
      { id: "b", row: 0, col: 2, length: 3, orientation: "v", direction: 1,  kind: "limo", color: PALETTE.violet },
      { id: "c", row: 3, col: 3, length: 2, orientation: "h", direction: -1, kind: "car",  color: PALETTE.amber },
      { id: "d", row: 4, col: 0, length: 3, orientation: "h", direction: 1,  kind: "bus",  color: PALETTE.cyan },
      { id: "e", row: 0, col: 5, length: 2, orientation: "v", direction: -1, kind: "car",  color: PALETTE.pink },
      { id: "f", row: 4, col: 4, length: 2, orientation: "v", direction: 1,  kind: "car",  color: PALETTE.green },
    ],
  },

  /* ── MEDIUM 3 — full valet mix ────────────────────────────── */
  {
    id: "m3",
    name: "Valet",
    difficulty: "medium",
    rows: 6,
    cols: 6,
    optimal: 8,
    vehicles: [
      { id: "a", row: 2, col: 1, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.red },
      { id: "b", row: 2, col: 4, length: 1, orientation: "v", direction: 1,  kind: "bike",  color: PALETTE.lime },
      { id: "c", row: 0, col: 0, length: 3, orientation: "v", direction: 1,  kind: "limo",  color: PALETTE.violet },
      { id: "d", row: 5, col: 0, length: 4, orientation: "h", direction: 1,  kind: "truck", color: PALETTE.teal },
      { id: "e", row: 0, col: 2, length: 3, orientation: "h", direction: 1,  kind: "bus",   color: PALETTE.indigo },
      { id: "f", row: 2, col: 5, length: 1, orientation: "v", direction: -1, kind: "bike",  color: PALETTE.cyan },
      { id: "g", row: 3, col: 5, length: 2, orientation: "v", direction: 1,  kind: "car",   color: PALETTE.orange },
    ],
  },

  /* ── HARD 1 ───────────────────────────────────────────────── */
  {
    id: "h1",
    name: "Tight Lot",
    difficulty: "hard",
    rows: 6,
    cols: 6,
    optimal: 7,
    vehicles: [
      { id: "a", row: 2, col: 1, length: 2, orientation: "h", direction: 1,  kind: "car",  color: PALETTE.red },
      { id: "b", row: 0, col: 0, length: 2, orientation: "v", direction: 1,  kind: "car",  color: PALETTE.lime },
      { id: "c", row: 0, col: 4, length: 3, orientation: "v", direction: 1,  kind: "bus",  color: PALETTE.indigo },
      { id: "d", row: 3, col: 0, length: 3, orientation: "h", direction: 1,  kind: "limo", color: PALETTE.amber },
      { id: "e", row: 4, col: 3, length: 2, orientation: "h", direction: 1,  kind: "car",  color: PALETTE.teal },
      { id: "f", row: 5, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car",  color: PALETTE.pink },
      { id: "g", row: 0, col: 2, length: 2, orientation: "v", direction: -1, kind: "car",  color: PALETTE.orange },
    ],
  },

  /* ── HARD 2 ───────────────────────────────────────────────── */
  {
    id: "h2",
    name: "Logjam",
    difficulty: "hard",
    rows: 6,
    cols: 6,
    optimal: 7,
    vehicles: [
      { id: "a", row: 2, col: 2, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.red },
      { id: "b", row: 0, col: 0, length: 3, orientation: "v", direction: 1,  kind: "limo",  color: PALETTE.violet },
      { id: "c", row: 0, col: 3, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.cyan },
      { id: "d", row: 3, col: 4, length: 3, orientation: "v", direction: 1,  kind: "bus",   color: PALETTE.amber },
      { id: "e", row: 4, col: 0, length: 4, orientation: "h", direction: 1,  kind: "truck", color: PALETTE.green },
      { id: "f", row: 1, col: 5, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.pink },
      { id: "g", row: 5, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.orange },
    ],
  },

  /* ── EXPERT ───────────────────────────────────────────────── */
  {
    id: "x1",
    name: "Rush Hour",
    difficulty: "expert",
    rows: 7,
    cols: 7,
    optimal: 9,
    vehicles: [
      { id: "a", row: 3, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.red },
      { id: "b", row: 0, col: 2, length: 3, orientation: "v", direction: 1,  kind: "bus",   color: PALETTE.indigo },
      { id: "c", row: 0, col: 5, length: 2, orientation: "v", direction: 1,  kind: "car",   color: PALETTE.cyan },
      { id: "d", row: 1, col: 0, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.lime },
      { id: "e", row: 4, col: 3, length: 4, orientation: "h", direction: 1,  kind: "truck", color: PALETTE.amber },
      { id: "f", row: 0, col: 4, length: 3, orientation: "v", direction: -1, kind: "limo",  color: PALETTE.violet },
      { id: "g", row: 5, col: 0, length: 2, orientation: "v", direction: 1,  kind: "car",   color: PALETTE.teal },
      { id: "h", row: 5, col: 2, length: 2, orientation: "h", direction: 1,  kind: "car",   color: PALETTE.pink },
      { id: "i", row: 0, col: 6, length: 3, orientation: "v", direction: 1,  kind: "bus",   color: PALETTE.orange },
    ],
  },
];

export function levelIndex(id: string): number {
  return LEVELS.findIndex(l => l.id === id);
}

export function nextLevelId(id: string): string | null {
  const i = levelIndex(id);
  if (i < 0 || i >= LEVELS.length - 1) return null;
  return LEVELS[i + 1].id;
}

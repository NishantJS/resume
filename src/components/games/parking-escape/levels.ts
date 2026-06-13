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
 * Levels are machine-searched against the BFS solver (see solver.ts and
 * /tmp-style generators in scripts/) and hand-finished, optimising for
 * genuine puzzle depth rather than "click every car once":
 *  - every level's true optimal EXCEEDS its vehicle count — at least one
 *    vehicle must park mid-board and be clicked again later,
 *  - several levels have first moves that deadlock the lot (undo/restart
 *    or a hint gets you out), so move order genuinely matters,
 *  - no two vehicles overlap at start and every level is fully solvable.
 * `optimal` matches the solver's true minimum (validated by
 * scripts/validate-levels.ts); the star rating uses the runtime solver.
 *
 * `kind` is purely cosmetic (car / bus / truck / limo / bike) — it never
 * affects movement, only the silhouette drawn in Vehicle.tsx. By convention:
 * length 1 → bike, 2 → car, 3 → bus or limo, 4 → truck.
 *
 * Coordinate system: row 0 = top, col 0 = left.
 * direction: +1 = right/down (h/v), -1 = left/up.
 */
export const LEVELS: LevelDef[] = [
  /* ── EASY 1 — optimal 5 with 4 vehicles: one re-click, forgiving ── */
  {
    id: "e1",
    name: "Warm-up",
    difficulty: "easy",
    rows: 5,
    cols: 5,
    optimal: 5,
    vehicles: [
      { id: "a", row: 0, col: 0, length: 3, orientation: "h", direction:  1, kind: "bus",   color: PALETTE.red },
      { id: "b", row: 3, col: 1, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.cyan },
      { id: "c", row: 0, col: 4, length: 3, orientation: "v", direction:  1, kind: "limo",  color: PALETTE.amber },
      { id: "d", row: 4, col: 3, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.violet },
    ],
  },

  /* ── EASY 2 — optimal 5, fewer useful first moves than e1 ───── */
  {
    id: "e2",
    name: "Make Room",
    difficulty: "easy",
    rows: 5,
    cols: 5,
    optimal: 5,
    vehicles: [
      { id: "a", row: 0, col: 0, length: 3, orientation: "v", direction:  1, kind: "bus",   color: PALETTE.red },
      { id: "b", row: 0, col: 1, length: 3, orientation: "h", direction: -1, kind: "limo",  color: PALETTE.cyan },
      { id: "c", row: 2, col: 2, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.amber },
      { id: "d", row: 4, col: 0, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.violet },
    ],
  },

  /* ── EASY 3 — first level where a wrong first move deadlocks ── */
  {
    id: "e3",
    name: "Lane Swap",
    difficulty: "easy",
    rows: 6,
    cols: 5,
    optimal: 6,
    vehicles: [
      { id: "a", row: 1, col: 1, length: 1, orientation: "h", direction:  1, kind: "bike",  color: PALETTE.red },
      { id: "b", row: 3, col: 1, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.cyan },
      { id: "c", row: 3, col: 3, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.amber },
      { id: "d", row: 2, col: 2, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.violet },
      { id: "e", row: 0, col: 3, length: 3, orientation: "v", direction:  1, kind: "bus",   color: PALETTE.green },
    ],
  },

  /* ── EASY 4 — optimal 8 with 6 vehicles: two parked re-clicks ── */
  {
    id: "e4",
    name: "Scooter Lane",
    difficulty: "easy",
    rows: 5,
    cols: 5,
    optimal: 8,
    vehicles: [
      { id: "a", row: 4, col: 0, length: 3, orientation: "h", direction:  1, kind: "bus",   color: PALETTE.red },
      { id: "b", row: 3, col: 0, length: 1, orientation: "h", direction:  1, kind: "bike",  color: PALETTE.cyan },
      { id: "c", row: 1, col: 2, length: 3, orientation: "h", direction: -1, kind: "limo",  color: PALETTE.amber },
      { id: "d", row: 2, col: 4, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.violet },
      { id: "e", row: 0, col: 1, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.green },
      { id: "f", row: 1, col: 0, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.pink },
    ],
  },

  /* ── MEDIUM 1 — half of the legal first moves deadlock the lot ── */
  {
    id: "m1",
    name: "Cross Traffic",
    difficulty: "medium",
    rows: 6,
    cols: 6,
    optimal: 9,
    vehicles: [
      { id: "a", row: 0, col: 3, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.red },
      { id: "b", row: 1, col: 4, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.cyan },
      { id: "c", row: 4, col: 1, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.amber },
      { id: "d", row: 0, col: 2, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.violet },
      { id: "e", row: 4, col: 0, length: 1, orientation: "v", direction: -1, kind: "bike",  color: PALETTE.green },
      { id: "f", row: 5, col: 2, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.pink },
      { id: "g", row: 3, col: 0, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.blue },
    ],
  },

  /* ── MEDIUM 2 — 8 vehicles, two of four openings are traps ───── */
  {
    id: "m2",
    name: "Gridlock",
    difficulty: "medium",
    rows: 6,
    cols: 6,
    optimal: 9,
    vehicles: [
      { id: "a", row: 3, col: 5, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.red },
      { id: "b", row: 2, col: 1, length: 3, orientation: "h", direction:  1, kind: "limo",  color: PALETTE.cyan },
      { id: "c", row: 1, col: 4, length: 3, orientation: "v", direction:  1, kind: "bus",   color: PALETTE.amber },
      { id: "d", row: 4, col: 2, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.violet },
      { id: "e", row: 0, col: 3, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.green },
      { id: "f", row: 3, col: 1, length: 3, orientation: "h", direction: -1, kind: "limo",  color: PALETTE.pink },
      { id: "g", row: 0, col: 4, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.blue },
      { id: "h", row: 1, col: 0, length: 3, orientation: "v", direction:  1, kind: "bus",   color: PALETTE.orange },
    ],
  },

  /* ── MEDIUM 3 — optimal 12 with 9 vehicles: deep shuffle ─────── */
  {
    id: "m3",
    name: "Valet",
    difficulty: "medium",
    rows: 6,
    cols: 6,
    optimal: 12,
    vehicles: [
      { id: "a", row: 0, col: 4, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.red },
      { id: "b", row: 4, col: 2, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.cyan },
      { id: "c", row: 5, col: 0, length: 1, orientation: "h", direction:  1, kind: "bike",  color: PALETTE.amber },
      { id: "d", row: 2, col: 1, length: 4, orientation: "h", direction: -1, kind: "truck", color: PALETTE.violet },
      { id: "e", row: 3, col: 3, length: 1, orientation: "h", direction: -1, kind: "bike",  color: PALETTE.green },
      { id: "f", row: 3, col: 4, length: 1, orientation: "h", direction: -1, kind: "bike",  color: PALETTE.pink },
      { id: "g", row: 4, col: 4, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.blue },
      { id: "h", row: 3, col: 1, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.orange },
      { id: "i", row: 1, col: 1, length: 3, orientation: "h", direction:  1, kind: "limo",  color: PALETTE.teal },
    ],
  },

  /* ── HARD 1 — optimal 12, a third of the openings deadlock ───── */
  {
    id: "h1",
    name: "Tight Lot",
    difficulty: "hard",
    rows: 6,
    cols: 6,
    optimal: 12,
    vehicles: [
      { id: "a", row: 1, col: 3, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.red },
      { id: "b", row: 0, col: 0, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.cyan },
      { id: "c", row: 4, col: 3, length: 3, orientation: "h", direction: -1, kind: "limo",  color: PALETTE.amber },
      { id: "d", row: 0, col: 4, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.violet },
      { id: "e", row: 0, col: 2, length: 1, orientation: "h", direction:  1, kind: "bike",  color: PALETTE.green },
      { id: "f", row: 3, col: 1, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.pink },
      { id: "g", row: 2, col: 2, length: 4, orientation: "v", direction: -1, kind: "truck", color: PALETTE.blue },
      { id: "h", row: 2, col: 4, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.orange },
      { id: "i", row: 1, col: 1, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.teal },
    ],
  },

  /* ── HARD 2 — 10 vehicles, ~6 700 reachable states to navigate ── */
  {
    id: "h2",
    name: "Logjam",
    difficulty: "hard",
    rows: 6,
    cols: 6,
    optimal: 11,
    vehicles: [
      { id: "a", row: 1, col: 2, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.red },
      { id: "b", row: 3, col: 2, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.cyan },
      { id: "c", row: 3, col: 3, length: 3, orientation: "v", direction: -1, kind: "bus",   color: PALETTE.amber },
      { id: "d", row: 2, col: 4, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.violet },
      { id: "e", row: 4, col: 5, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.green },
      { id: "f", row: 2, col: 1, length: 1, orientation: "h", direction:  1, kind: "bike",  color: PALETTE.pink },
      { id: "g", row: 0, col: 0, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.blue },
      { id: "h", row: 0, col: 4, length: 2, orientation: "h", direction: -1, kind: "car",   color: PALETTE.orange },
      { id: "i", row: 2, col: 0, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.teal },
      { id: "j", row: 5, col: 0, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.indigo },
    ],
  },

  /* ── EXPERT — 11 vehicles incl. three trucks, ~27 000 states ──── */
  {
    id: "x1",
    name: "Rush Hour",
    difficulty: "expert",
    rows: 7,
    cols: 7,
    optimal: 12,
    vehicles: [
      { id: "a", row: 0, col: 5, length: 2, orientation: "v", direction:  1, kind: "car",   color: PALETTE.red },
      { id: "b", row: 2, col: 4, length: 2, orientation: "v", direction: -1, kind: "car",   color: PALETTE.cyan },
      { id: "c", row: 3, col: 2, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.amber },
      { id: "d", row: 0, col: 1, length: 3, orientation: "h", direction: -1, kind: "bus",   color: PALETTE.violet },
      { id: "e", row: 1, col: 6, length: 4, orientation: "v", direction: -1, kind: "truck", color: PALETTE.green },
      { id: "f", row: 6, col: 3, length: 4, orientation: "h", direction: -1, kind: "truck", color: PALETTE.pink },
      { id: "g", row: 4, col: 1, length: 3, orientation: "v", direction: -1, kind: "limo",  color: PALETTE.blue },
      { id: "h", row: 2, col: 2, length: 1, orientation: "h", direction:  1, kind: "bike",  color: PALETTE.orange },
      { id: "i", row: 3, col: 0, length: 4, orientation: "v", direction:  1, kind: "truck", color: PALETTE.teal },
      { id: "j", row: 5, col: 4, length: 3, orientation: "h", direction: -1, kind: "bus",   color: PALETTE.indigo },
      { id: "k", row: 1, col: 0, length: 2, orientation: "h", direction:  1, kind: "car",   color: PALETTE.lime },
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

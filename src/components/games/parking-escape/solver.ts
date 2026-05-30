import { moveVehicle, type VehicleMap } from "./gameLogic";
import type { LevelDef } from "./types";

/**
 * Breadth-first solver over board states.
 *
 * A "move" is a click on one vehicle, which deterministically slides it until
 * blocked or off the board. The goal is the empty board (every vehicle exited).
 * BFS therefore yields the minimum number of clicks — the true optimal used
 * for star ratings and the hint system.
 *
 * State space is small (a handful of vehicles, each with few legal positions),
 * so plain BFS with a visited set resolves every shipped level in well under a
 * few milliseconds.
 */

function cloneMap(vehicles: VehicleMap): VehicleMap {
  const out: VehicleMap = {};
  for (const id in vehicles) out[id] = { ...vehicles[id] };
  return out;
}

/** Canonical, order-independent key for a board state. */
function keyOf(vehicles: VehicleMap): string {
  const ids = Object.keys(vehicles).sort();
  let s = "";
  for (const id of ids) {
    const v = vehicles[id];
    s += `${id}${v.row},${v.col};`;
  }
  return s;
}

interface SolveResult {
  /** Sequence of vehicle ids to click for an optimal clear, or null if unsolvable. */
  path: string[] | null;
  /** Minimum clicks to clear, or Infinity if unsolvable. */
  optimal: number;
  /** States explored (diagnostic). */
  explored: number;
}

function solveMap(start: VehicleMap, rows: number, cols: number): SolveResult {
  const startKey = keyOf(start);
  if (Object.keys(start).length === 0) return { path: [], optimal: 0, explored: 0 };

  const queue: VehicleMap[] = [start];
  const visited = new Set<string>([startKey]);
  // parent: childKey -> { parentKey, moveId }
  const parent = new Map<string, { key: string; move: string }>();
  const stateByKey = new Map<string, VehicleMap>([[startKey, start]]);

  let head = 0;
  let explored = 0;

  while (head < queue.length) {
    const cur = queue[head++];
    explored++;
    const ids = Object.keys(cur);

    if (ids.length === 0) {
      // Reconstruct path back to start.
      const path: string[] = [];
      let k = keyOf(cur);
      while (parent.has(k)) {
        const p = parent.get(k)!;
        path.push(p.move);
        k = p.key;
      }
      path.reverse();
      return { path, optimal: path.length, explored };
    }

    const curKey = keyOf(cur);
    for (const id of ids) {
      const res = moveVehicle(cur, rows, cols, id);
      if (!res.changed) continue;
      const childKey = keyOf(res.vehicles);
      if (visited.has(childKey)) continue;
      visited.add(childKey);
      parent.set(childKey, { key: curKey, move: id });
      const child = cloneMap(res.vehicles);
      stateByKey.set(childKey, child);
      queue.push(child);
    }
  }

  return { path: null, optimal: Infinity, explored };
}

/** Solve a full level from its initial layout. */
export function solveLevel(level: LevelDef): SolveResult {
  const start: VehicleMap = {};
  for (const v of level.vehicles) start[v.id] = { ...v };
  return solveMap(start, level.rows, level.cols);
}

/** Solve from an arbitrary mid-game position (used by the hint button). */
export function solveFrom(vehicles: VehicleMap, rows: number, cols: number): SolveResult {
  return solveMap(cloneMap(vehicles), rows, cols);
}

/* ── memoised optimal per level ───────────────────────────── */
const optimalCache = new Map<string, number>();

export function optimalFor(level: LevelDef): number {
  const cached = optimalCache.get(level.id);
  if (cached !== undefined) return cached;
  const { optimal } = solveLevel(level);
  // Fall back to the authored hint if a level is somehow unsolvable.
  const value = Number.isFinite(optimal) ? optimal : level.optimal;
  optimalCache.set(level.id, value);
  return value;
}

/** Next vehicle id to click on a shortest path from the current position. */
export function hintFrom(vehicles: VehicleMap, rows: number, cols: number): string | null {
  const { path } = solveFrom(vehicles, rows, cols);
  return path && path.length > 0 ? path[0] : null;
}

/* ── design-time validation ───────────────────────────────── */

export interface LevelValidation {
  id: string;
  overlaps: Array<[string, string, number, number]>;
  outOfBounds: string[];
  solvable: boolean;
  optimal: number;
  vehicleCount: number;
  explored: number;
}

export function validateLevel(level: LevelDef): LevelValidation {
  const grid: (string | null)[][] = Array.from({ length: level.rows }, () =>
    Array<string | null>(level.cols).fill(null),
  );
  const overlaps: Array<[string, string, number, number]> = [];
  const outOfBounds: string[] = [];

  for (const v of level.vehicles) {
    const cells: Array<[number, number]> =
      v.orientation === "h"
        ? Array.from({ length: v.length }, (_, i) => [v.row, v.col + i] as [number, number])
        : Array.from({ length: v.length }, (_, i) => [v.row + i, v.col] as [number, number]);
    for (const [r, c] of cells) {
      if (r < 0 || r >= level.rows || c < 0 || c >= level.cols) {
        outOfBounds.push(v.id);
        continue;
      }
      const occ = grid[r][c];
      if (occ) overlaps.push([occ, v.id, r, c]);
      else grid[r][c] = v.id;
    }
  }

  const { optimal, explored } = solveLevel(level);
  return {
    id: level.id,
    overlaps,
    outOfBounds,
    solvable: Number.isFinite(optimal),
    optimal: Number.isFinite(optimal) ? optimal : -1,
    vehicleCount: level.vehicles.length,
    explored,
  };
}

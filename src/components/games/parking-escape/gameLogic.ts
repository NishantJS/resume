import type {
  GameState,
  HistoryEntry,
  LevelDef,
  MoveOutcome,
  Vehicle,
} from "./types";

/* ════════════════════════════════════════════════════════════
   PURE CORE
   Operates on a plain id→Vehicle map so it can be reused by both
   the React game state and the BFS solver. No React, no history.
   ════════════════════════════════════════════════════════════ */

export type VehicleMap = Record<string, Vehicle>;

/** Returns the list of (row, col) cells a vehicle currently occupies. */
export function cellsOf(v: Vehicle): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  if (v.orientation === "h") {
    for (let i = 0; i < v.length; i++) out.push([v.row, v.col + i]);
  } else {
    for (let i = 0; i < v.length; i++) out.push([v.row + i, v.col]);
  }
  return out;
}

/** Build an occupancy grid keyed by vehicle id (or null). */
export function buildGrid(
  vehicles: VehicleMap,
  rows: number,
  cols: number,
): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: rows }, () =>
    Array<string | null>(cols).fill(null),
  );
  for (const id in vehicles) {
    const v = vehicles[id];
    for (const [r, c] of cellsOf(v)) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = v.id;
    }
  }
  return grid;
}

/** The single cell just past a vehicle's leading edge. */
function frontCell(v: Vehicle): [number, number] {
  if (v.orientation === "h") {
    return v.direction === 1 ? [v.row, v.col + v.length] : [v.row, v.col - 1];
  }
  return v.direction === 1 ? [v.row + v.length, v.col] : [v.row - 1, v.col];
}

/** Advance a vehicle one cell forward (returns a new vehicle object). */
function step(v: Vehicle): Vehicle {
  if (v.orientation === "h") return { ...v, col: v.col + v.direction };
  return { ...v, row: v.row + v.direction };
}

/**
 * Compute how far a vehicle slides forward along its single allowed
 * direction. It stops when the next cell is occupied (blocked) or runs off
 * the board (exit).
 *  - steps: empty cells advanced before stopping (board steps only).
 *  - exits: true when the slide carries the vehicle off the board.
 */
export function computeSlide(
  vehicles: VehicleMap,
  rows: number,
  cols: number,
  id: string,
): { steps: number; exits: boolean } {
  const v = vehicles[id];
  if (!v) return { steps: 0, exits: false };

  const grid = buildGrid(vehicles, rows, cols);
  let current = v;
  let steps = 0;

  for (;;) {
    const [fr, fc] = frontCell(current);
    const offBoard = fr < 0 || fr >= rows || fc < 0 || fc >= cols;
    if (offBoard) return { steps, exits: true };
    if (grid[fr][fc] !== null) return { steps, exits: false };

    // Vacate the trailing cell, occupy the new front cell.
    const tail: [number, number] = current.orientation === "h"
      ? [current.row, current.direction === 1 ? current.col : current.col + current.length - 1]
      : [current.direction === 1 ? current.row : current.row + current.length - 1, current.col];
    grid[tail[0]][tail[1]] = null;
    grid[fr][fc] = current.id;
    current = step(current);
    steps += 1;
    if (steps > rows * cols) return { steps, exits: false }; // safety bound
  }
}

export interface PureMove {
  vehicles: VehicleMap;
  changed: boolean;
  exited: boolean;
  steps: number;
  from: { row: number; col: number };
  to: { row: number; col: number };
}

/** Apply one slide to a vehicle, returning a brand-new vehicle map. */
export function moveVehicle(
  vehicles: VehicleMap,
  rows: number,
  cols: number,
  id: string,
): PureMove {
  const v = vehicles[id];
  if (!v) {
    return { vehicles, changed: false, exited: false, steps: 0, from: { row: 0, col: 0 }, to: { row: 0, col: 0 } };
  }

  const { steps, exits } = computeSlide(vehicles, rows, cols, id);
  const from = { row: v.row, col: v.col };

  if (!exits && steps === 0) {
    return { vehicles, changed: false, exited: false, steps: 0, from, to: from };
  }

  let next = v;
  for (let i = 0; i < steps; i++) next = step(next);
  const to = { row: next.row, col: next.col };

  if (exits) {
    const { [id]: _gone, ...rest } = vehicles;
    void _gone;
    return { vehicles: rest, changed: true, exited: true, steps, from, to };
  }
  return { vehicles: { ...vehicles, [id]: next }, changed: true, exited: false, steps, from, to };
}

/* ════════════════════════════════════════════════════════════
   STATEFUL WRAPPERS (used by the React hook)
   ════════════════════════════════════════════════════════════ */

export function initialState(level: LevelDef): GameState {
  const vehicles: VehicleMap = {};
  const order: string[] = [];
  for (const v of level.vehicles) {
    vehicles[v.id] = { ...v };
    order.push(v.id);
  }
  return { level, vehicles, order, exited: [], moves: 0, history: [], cleared: false };
}

function snapshot(state: GameState): HistoryEntry {
  return {
    vehicles: Object.fromEntries(
      Object.entries(state.vehicles).map(([k, v]) => [k, { ...v }]),
    ),
    order: [...state.order],
    exited: [...state.exited],
  };
}

export function applyMove(
  state: GameState,
  id: string,
): { state: GameState; outcome: MoveOutcome } {
  const { level } = state;
  const res = moveVehicle(state.vehicles, level.rows, level.cols, id);

  if (!res.changed) return { state, outcome: { kind: "none" } };

  const history = [...state.history, snapshot(state)];

  if (res.exited) {
    const newOrder = state.order.filter(x => x !== id);
    return {
      state: {
        ...state,
        vehicles: res.vehicles,
        order: newOrder,
        exited: [...state.exited, id],
        moves: state.moves + 1,
        history,
        cleared: newOrder.length === 0,
      },
      outcome: { kind: "exited", steps: res.steps, from: res.from, exitAt: res.to },
    };
  }

  return {
    state: {
      ...state,
      vehicles: res.vehicles,
      moves: state.moves + 1,
      history,
    },
    outcome: { kind: "moved", steps: res.steps, from: res.from, to: res.to },
  };
}

export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return {
    ...state,
    vehicles: prev.vehicles,
    order: prev.order,
    exited: prev.exited,
    moves: Math.max(0, state.moves - 1),
    history: state.history.slice(0, -1),
    cleared: false,
  };
}

export function restart(state: GameState): GameState {
  return initialState(state.level);
}

/* ── star rating (relative to the true optimal) ───────────── */

export function starsFor(optimal: number, moves: number): number {
  if (moves <= optimal) return 3;
  if (moves <= optimal + 2) return 2;
  return 1;
}

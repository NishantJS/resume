/** Orientation determines the axis the vehicle can travel on. */
export type Orientation = "h" | "v";

/** +1 = right (h) / down (v). -1 = left (h) / up (v). */
export type Direction = 1 | -1;

export type VehicleKind = "car" | "bus" | "truck" | "bike" | "limo";

export interface Vehicle {
  id: string;
  /** Top-left cell. For h vehicles this is the leftmost cell; for v, topmost. */
  row: number;
  col: number;
  /** Number of cells the vehicle spans along its orientation axis. */
  length: number;
  orientation: Orientation;
  direction: Direction;
  kind: VehicleKind;
  /** Body fill color (toy palette). */
  color: string;
}

export interface LevelDef {
  id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  rows: number;
  cols: number;
  /** Minimum number of moves to clear; used for star rating. */
  optimal: number;
  vehicles: Vehicle[];
}

export interface GameState {
  level: LevelDef;
  /** Active vehicles currently on the board (id-keyed for stable identity). */
  vehicles: Record<string, Vehicle>;
  /** Ids in stable render order — needed for layered shadows. */
  order: string[];
  /** Ids that have exited (still tracked for stats / replay). */
  exited: string[];
  moves: number;
  /** Snapshots for undo. */
  history: HistoryEntry[];
  /** Cleared = all vehicles exited. */
  cleared: boolean;
}

export interface HistoryEntry {
  vehicles: Record<string, Vehicle>;
  order: string[];
  exited: string[];
}

export type MoveOutcome =
  | { kind: "none" } // click did nothing (already exited / blocked at start)
  | { kind: "moved"; steps: number; from: { row: number; col: number }; to: { row: number; col: number } }
  | { kind: "exited"; steps: number; from: { row: number; col: number }; exitAt: { row: number; col: number } };

export interface SaveData {
  /** levelId -> best star count (0–3) */
  bestStars: Record<string, number>;
  /** levelId -> best move count */
  bestMoves: Record<string, number>;
  /** Last level the player was on. */
  lastLevelId?: string;
  /** Unlocked level ids. */
  unlocked: string[];
}

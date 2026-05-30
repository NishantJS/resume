import { LEVELS } from "./levels";
import type { SaveData } from "./types";
import { idbGet, idbSet } from "../idb";

/** IndexedDB record key (and the legacy localStorage key we migrate from). */
const KEY = "parking-escape:save:v1";

const empty: SaveData = {
  bestStars: {},
  bestMoves: {},
  unlocked: [LEVELS[0].id],
};

/** In-memory mirror so the first synchronous render has something to draw. */
let cache: SaveData = { ...empty };

function normalize(parsed: Partial<SaveData> | undefined | null): SaveData {
  if (!parsed) return { ...empty };
  return {
    bestStars: parsed.bestStars ?? {},
    bestMoves: parsed.bestMoves ?? {},
    lastLevelId: parsed.lastLevelId,
    unlocked: parsed.unlocked && parsed.unlocked.length ? parsed.unlocked : [LEVELS[0].id],
  };
}

/** Synchronous best-effort snapshot — the last hydrated or saved value. */
export function load(): SaveData {
  return cache;
}

/** Read any save left over in the old localStorage slot, then clear it. */
function migrateFromLocalStorage(): SaveData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = normalize(JSON.parse(raw) as Partial<SaveData>);
    window.localStorage.removeItem(KEY);
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Async source of truth. Reads IndexedDB; if empty, migrates a legacy
 * localStorage save into it. Updates the synchronous cache and returns it.
 */
export async function hydrate(): Promise<SaveData> {
  let data = await idbGet<SaveData>(KEY);
  if (!data) {
    const migrated = migrateFromLocalStorage();
    if (migrated) {
      data = migrated;
      await idbSet(KEY, data);
    }
  }
  cache = normalize(data);
  return cache;
}

export function save(data: SaveData): void {
  cache = data;
  void idbSet(KEY, data);
}

export function recordWin(
  data: SaveData,
  levelId: string,
  moves: number,
  stars: number,
): SaveData {
  const next: SaveData = {
    ...data,
    bestStars: { ...data.bestStars },
    bestMoves: { ...data.bestMoves },
    unlocked: [...data.unlocked],
  };
  const prevStars = next.bestStars[levelId] ?? 0;
  const prevMoves = next.bestMoves[levelId] ?? Infinity;
  if (stars > prevStars) next.bestStars[levelId] = stars;
  if (moves < prevMoves) next.bestMoves[levelId] = moves;

  // Unlock the next level.
  const i = LEVELS.findIndex(l => l.id === levelId);
  if (i >= 0 && i < LEVELS.length - 1) {
    const nextId = LEVELS[i + 1].id;
    if (!next.unlocked.includes(nextId)) next.unlocked.push(nextId);
  }
  next.lastLevelId = levelId;
  return next;
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyMove,
  initialState,
  restart as restartState,
  starsFor,
  undo as undoState,
} from "./gameLogic";
import { hintFrom, optimalFor } from "./solver";
import { hydrate, load, recordWin, save } from "./storage";
import { LEVELS, levelIndex, nextLevelId } from "./levels";
import { sfx } from "../sound";
import type { GameState, LevelDef, MoveOutcome, SaveData } from "./types";

/**
 * Approximate duration (ms) of a slide animation. The hook uses this to gate
 * clicks while a vehicle is mid-motion so state and screen stay aligned.
 */
const MOVE_LOCK_MS = 220;
const EXIT_LOCK_MS = 380;
/** Delay before showing the level-complete overlay (lets the last car exit fully). */
const COMPLETE_DELAY_MS = 480;

export interface UseGameStateApi {
  state: GameState;
  savedata: SaveData;
  optimal: number;
  lastOutcome: { id: string; outcome: MoveOutcome; ts: number } | null;
  /** Last vehicle that wiggled (blocked click) — bumped each time. */
  blocked: { id: string; ts: number } | null;
  /** Vehicle the hint system is currently pointing at (with a bump ts). */
  hint: { id: string; ts: number } | null;
  /** Whether the level-complete overlay is open. */
  showComplete: boolean;
  stars: number;
  bestStars: number;
  /** Hints remaining for the current level (capped at one per level). */
  hintsLeft: number;
  /** Whether a hint can be requested right now. */
  canHint: boolean;
  click: (id: string) => void;
  undo: () => void;
  restart: () => void;
  loadLevel: (id: string) => void;
  goNextLevel: () => void;
  dismissComplete: () => void;
  requestHint: () => void;
  canUndo: boolean;
  isLevelUnlocked: (id: string) => boolean;
}

/** One hint per level. */
const HINTS_PER_LEVEL = 1;

export function useGameState(initialLevelId?: string): UseGameStateApi {
  const [savedata, setSavedata] = useState<SaveData>(() => load());

  const startId =
    initialLevelId && LEVELS.some(l => l.id === initialLevelId)
      ? initialLevelId
      : savedata.lastLevelId && LEVELS.some(l => l.id === savedata.lastLevelId)
        ? savedata.lastLevelId
        : LEVELS[0].id;

  const findLevel = (id: string): LevelDef =>
    LEVELS.find(l => l.id === id) ?? LEVELS[0];

  const [state, setState] = useState<GameState>(() => initialState(findLevel(startId)));
  const [lastOutcome, setLastOutcome] = useState<UseGameStateApi["lastOutcome"]>(null);
  const [blocked, setBlocked] = useState<UseGameStateApi["blocked"]>(null);
  const [hint, setHint] = useState<UseGameStateApi["hint"]>(null);
  const [showComplete, setShowComplete] = useState(false);
  const [hintsLeft, setHintsLeftState] = useState(HINTS_PER_LEVEL);

  const lockUntil = useRef(0);
  // True once the player has interacted, so async hydration won't yank them
  // off the level they're already playing.
  const startedRef = useRef(false);
  // Mirror hintsLeft in a ref so the stable click/hint callbacks read fresh.
  const hintsLeftRef = useRef(HINTS_PER_LEVEL);
  const setHintsLeft = useCallback((n: number) => {
    hintsLeftRef.current = n;
    setHintsLeftState(n);
  }, []);
  // Ref to current state so the click handler stays referentially stable and
  // never runs side effects from inside a setState updater (StrictMode safe).
  const stateRef = useRef(state);
  stateRef.current = state;

  const optimal = useMemo(() => optimalFor(state.level), [state.level]);

  // Hydrate the real save from IndexedDB (migrating any legacy localStorage
  // save). Until it resolves we render the default; when it lands we adopt the
  // progress and, if the player hasn't touched anything, resume their last level.
  useEffect(() => {
    let cancelled = false;
    hydrate().then(data => {
      if (cancelled) return;
      setSavedata(data);
      if (
        !startedRef.current &&
        !initialLevelId &&
        data.lastLevelId &&
        data.lastLevelId !== stateRef.current.level.id
      ) {
        const lvl = LEVELS.find(l => l.id === data.lastLevelId);
        if (lvl) setState(initialState(lvl));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [initialLevelId]);

  const click = useCallback((id: string) => {
    const now = performance.now();
    if (now < lockUntil.current) return;

    startedRef.current = true;
    setHint(null);
    const { state: next, outcome } = applyMove(stateRef.current, id);
    if (outcome.kind === "none") {
      setBlocked({ id, ts: now });
      sfx.hit();
      return;
    }
    if (outcome.kind === "exited") sfx.pop(); else sfx.move();
    lockUntil.current =
      outcome.kind === "exited" ? now + EXIT_LOCK_MS : now + MOVE_LOCK_MS;
    setLastOutcome({ id, outcome, ts: now });
    setState(next);
  }, []);

  const undo = useCallback(() => {
    setState(prev => undoState(prev));
    setLastOutcome(null);
    setHint(null);
    setShowComplete(false);
  }, []);

  const restart = useCallback(() => {
    setState(prev => restartState(prev));
    setLastOutcome(null);
    setHint(null);
    setShowComplete(false);
    setHintsLeft(HINTS_PER_LEVEL);
  }, [setHintsLeft]);

  const loadLevel = useCallback((id: string) => {
    startedRef.current = true;
    setState(initialState(findLevel(id)));
    setLastOutcome(null);
    setHint(null);
    setShowComplete(false);
    setHintsLeft(HINTS_PER_LEVEL);
    setSavedata(prev => {
      const next = { ...prev, lastLevelId: id };
      save(next);
      return next;
    });
  }, [setHintsLeft]);

  const requestHint = useCallback(() => {
    const s = stateRef.current;
    if (s.cleared || hintsLeftRef.current <= 0) return;
    const id = hintFrom(s.vehicles, s.level.rows, s.level.cols);
    if (id) {
      setHint({ id, ts: performance.now() });
      setHintsLeft(hintsLeftRef.current - 1);
    }
  }, [setHintsLeft]);

  // When level is cleared, schedule completion overlay + persist progress.
  useEffect(() => {
    if (!state.cleared) return;
    const stars = starsFor(optimal, state.moves);
    const t = window.setTimeout(() => {
      sfx.win();
      setSavedata(prev => {
        const next = recordWin(prev, state.level.id, state.moves, stars);
        save(next);
        return next;
      });
      setShowComplete(true);
    }, COMPLETE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [state.cleared, state.level, state.moves, optimal]);

  const goNextLevel = useCallback(() => {
    const id = nextLevelId(state.level.id);
    if (!id) return;
    loadLevel(id);
  }, [loadLevel, state.level.id]);

  const dismissComplete = useCallback(() => setShowComplete(false), []);

  const stars = useMemo(
    () => (state.cleared ? starsFor(optimal, state.moves) : 0),
    [state.cleared, optimal, state.moves],
  );

  const bestStars = savedata.bestStars[state.level.id] ?? 0;

  const isLevelUnlocked = useCallback(
    (id: string) => {
      if (id === LEVELS[0].id) return true;
      if (savedata.unlocked.includes(id)) return true;
      const i = levelIndex(id);
      if (i <= 0) return true;
      const prev = LEVELS[i - 1].id;
      return (savedata.bestStars[prev] ?? 0) > 0;
    },
    [savedata],
  );

  return {
    state,
    savedata,
    optimal,
    lastOutcome,
    blocked,
    hint,
    showComplete,
    stars,
    bestStars,
    hintsLeft,
    canHint: hintsLeft > 0 && !state.cleared,
    click,
    undo,
    restart,
    loadLevel,
    goNextLevel,
    dismissComplete,
    requestHint,
    canUndo: state.history.length > 0,
    isLevelUnlocked,
  };
}

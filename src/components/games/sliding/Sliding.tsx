import { FC, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import { solvePath } from "./solver";
import "./sliding.css";

const N = 4;
const SIZE = N * N;
const SAVE_KEY = "sliding-puzzle:v1";

const INFO: GameInfo = {
  about:
    "The classic 15-puzzle. Fifteen numbered tiles and one empty space — slide tiles into the gap until they read 1 to 15 in order.",
  howTo: [
    "Tap a tile next to the empty space to slide it in.",
    "Or swipe in the direction you want a tile to move.",
    "Order the tiles 1–15 with the gap in the bottom-right.",
    "Try to solve it in as few moves as possible.",
  ],
  controls: [
    { keys: "Tap / Click", desc: "Slide a tile" },
    { keys: "Swipe / arrows", desc: "Slide into the gap" },
    { keys: "Hint", desc: "Glow the next tile on a winning line" },
  ],
  tips: [
    "Solve the top rows first, then the left columns.",
    "The hint stays lit until you slide that tile — follow it repeatedly and it walks you to the solution.",
  ],
};

const solvedBoard = () => [...Array(SIZE - 1)].map((_, i) => i + 1).concat(0);
const isSolved = (b: number[]) => b.every((v, i) => v === (i + 1) % SIZE);

function neighbors(pos: number): number[] {
  const r = Math.floor(pos / N), c = pos % N;
  const out: number[] = [];
  if (r > 0) out.push(pos - N);
  if (r < N - 1) out.push(pos + N);
  if (c > 0) out.push(pos - 1);
  if (c < N - 1) out.push(pos + 1);
  return out;
}

function scramble(): number[] {
  const b = solvedBoard();
  let empty = SIZE - 1;
  for (let k = 0; k < 240; k++) {
    const nbrs = neighbors(empty);
    const n = nbrs[Math.floor(Math.random() * nbrs.length)];
    [b[empty], b[n]] = [b[n], b[empty]];
    empty = n;
  }
  return isSolved(b) ? scramble() : b;
}

/** A solved line of play from a specific board position. `key` is the board
 *  the NEXT move in `path` applies to — if the real board drifts from it the
 *  plan is stale and gets recomputed on the next hint request. */
interface HintPlan { path: number[]; idx: number; key: string }

const Sliding: FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [board, setBoard] = useState<number[]>(() => scramble());
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [hintValue, setHintValue] = useState<number | null>(null);
  const savedRef = useRef(false);
  const planRef = useRef<HintPlan | null>(null);

  const won = isSolved(board);
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    idbGet<{ best: number }>(SAVE_KEY).then(d => { if (d?.best) setBest(d.best); });
  }, []);

  useEffect(() => {
    if (!won || savedRef.current || moves === 0) return;
    savedRef.current = true;
    sfx.win();
    setBest(prev => {
      const next = prev === 0 ? moves : Math.min(prev, moves);
      void idbSet(SAVE_KEY, { best: next });
      return next;
    });
  }, [won, moves]);

  const newGame = useCallback(() => {
    savedRef.current = false;
    setHintValue(null);
    planRef.current = null;
    const next = scramble();
    boardRef.current = next;
    setBoard(next);
    setMoves(0);
  }, []);

  const slideAt = useCallback((pos: number) => {
    const b = boardRef.current;
    const empty = b.indexOf(0);
    if (!neighbors(pos).includes(empty)) return;
    const moved = b[pos];
    sfx.move();
    const next = [...b];
    [next[pos], next[empty]] = [next[empty], next[pos]];

    // Keep the solved plan in sync: following the hinted move advances the
    // plan (so the next hint is instant); any other move makes it stale.
    const plan = planRef.current;
    if (plan) {
      if (plan.path[plan.idx] === moved) {
        plan.idx += 1;
        plan.key = next.join(",");
        if (plan.idx >= plan.path.length) planRef.current = null;
      } else {
        planRef.current = null;
      }
    }
    setHintValue(null);

    setBoard(next);
    setMoves(m => m + 1);
  }, []);

  /** Hint = the next move of a real solution computed by the staged solver.
   *  It stays lit until that exact tile is slid, and asking again after
   *  following it continues the same winning line. */
  const requestHint = useCallback(() => {
    if (won) return;
    const b = boardRef.current;
    const key = b.join(",");
    let plan = planRef.current;
    if (!plan || plan.key !== key || plan.idx >= plan.path.length) {
      const path = solvePath(b);
      if (!path || path.length === 0) return; // unreachable for legal scrambles
      plan = { path, idx: 0, key };
      planRef.current = plan;
    }
    sfx.pop();
    setHintValue(plan.path[plan.idx]);
  }, [won]);

  const slideDir = useCallback((dir: "up" | "down" | "left" | "right") => {
    const empty = board.indexOf(0);
    const r = Math.floor(empty / N), c = empty % N;
    let src = -1;
    if (dir === "left" && c < N - 1) src = empty + 1;
    else if (dir === "right" && c > 0) src = empty - 1;
    else if (dir === "up" && r < N - 1) src = empty + N;
    else if (dir === "down" && r > 0) src = empty - N;
    if (src >= 0) slideAt(src);
  }, [board, slideAt]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, "up" | "down" | "left" | "right"> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      };
      const d = map[e.key];
      if (!d) return;
      e.preventDefault();
      slideDir(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideDir]);

  // swipe
  const playRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = playRef.current;
    if (!el) return;
    // No setPointerCapture here: capturing retargets the derived `click`
    // event to the container, which silently killed tile taps (the board
    // looked unresponsive and "hints stopped working"). The window-level
    // pointerup still catches swipes that end outside the board.
    const onDown = (e: PointerEvent) => {
      swipeStart.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      const d = swipeStart.current; swipeStart.current = null;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) < 20) return; // tap — the tile's onClick handles it
      if (Math.abs(dx) > Math.abs(dy)) slideDir(dx > 0 ? "right" : "left");
      else slideDir(dy > 0 ? "down" : "up");
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, [slideDir]);

  return (
    <GameShell
      slug="sliding-puzzle"
      subtitle={won ? "Solved!" : "Order 1–15"}
      info={INFO}
      stats={
        <>
          <span className="game-stat"><i>Moves</i><b>{moves}</b></span>
          <span className="game-stat"><i>Best</i><b>{best || "—"}</b></span>
        </>
      }
      toolbar={
        <>
          <button type="button" className="sld-btn ghost" onClick={requestHint} disabled={won}>Hint</button>
          <button type="button" className="sld-btn" onClick={newGame}>Shuffle</button>
        </>
      }
    >
      <div ref={playRef} className="sld-play">
        <div className="sld-wrap">
          <div className="sld-board" aria-label="Sliding puzzle">
            {Array.from({ length: SIZE - 1 }, (_, k) => k + 1).map(value => {
              const pos = board.indexOf(value);
              const r = Math.floor(pos / N), c = pos % N;
              const isHint = hintValue === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  className={`sld-tile ${won ? "won" : ""}`.trim()}
                  /* data-hint drives the highlight via CSS attr selector — this
                     sidesteps a Motion layout/className race where the class
                     was applied before the tile animated to its new position. */
                  data-hint={isHint ? "true" : undefined}
                  style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
                  layout={!reduced}
                  transition={{ type: "spring", stiffness: 560, damping: 38 }}
                  onClick={() => slideAt(pos)}
                  aria-label={`Tile ${value}${isHint ? " — hint" : ""}`}
                >
                  {value}
                </motion.button>
              );
            })}
            {won && (
              <div className="sld-win">
                <span>Solved in {moves}!</span>
                <button type="button" className="sld-btn primary" onClick={newGame}>New puzzle</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default Sliding;

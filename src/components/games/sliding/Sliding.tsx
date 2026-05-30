import { FC, useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
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
  ],
  tips: ["Solve the top rows first, then the left columns.", "Work the last two rows together, column by column."],
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

/** Total Manhattan distance of every tile from its goal — the hint heuristic. */
function manhattan(b: number[]): number {
  let d = 0;
  for (let p = 0; p < SIZE; p++) {
    const v = b[p];
    if (v === 0) continue;
    const target = v - 1;
    d += Math.abs(Math.floor(p / N) - Math.floor(target / N)) + Math.abs((p % N) - (target % N));
  }
  return d;
}

const Sliding: FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [board, setBoard] = useState<number[]>(() => scramble());
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [hintValue, setHintValue] = useState<number | null>(null);
  const savedRef = useRef(false);
  const hintTimer = useRef(0);

  const won = isSolved(board);
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    idbGet<{ best: number }>(SAVE_KEY).then(d => { if (d?.best) setBest(d.best); });
    return () => window.clearTimeout(hintTimer.current);
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
    setBoard(scramble());
    setMoves(0);
  }, []);

  const slideAt = useCallback((pos: number) => {
    const b = boardRef.current;
    const empty = b.indexOf(0);
    if (!neighbors(pos).includes(empty)) return;
    sfx.move();
    setHintValue(null);
    const next = [...b];
    [next[pos], next[empty]] = [next[empty], next[pos]];
    setBoard(next);
    setMoves(m => m + 1);
  }, []);

  const requestHint = useCallback(() => {
    if (won) return;
    const b = boardRef.current;
    const empty = b.indexOf(0);
    const candidates = neighbors(empty);

    // First preference: a neighbor tile that is already AT its goal position
    // after the swap (moving it is unambiguously good).
    for (const src of candidates) {
      const val = b[src];
      if (val === 0) continue;
      const goalPos = val - 1; // 0-indexed goal for value 1..15
      if (empty === goalPos) {
        sfx.pop();
        setHintValue(val);
        window.clearTimeout(hintTimer.current);
        hintTimer.current = window.setTimeout(() => setHintValue(null), 1600);
        return;
      }
    }

    // Second preference: the swap that most reduces total Manhattan distance.
    let bestSrc = -1, bestDelta = -Infinity;
    for (const src of candidates) {
      const after = [...b];
      [after[src], after[empty]] = [after[empty], after[src]];
      const delta = manhattan(b) - manhattan(after);
      if (delta > bestDelta) { bestDelta = delta; bestSrc = src; }
    }
    if (bestSrc >= 0 && bestDelta >= 0) {
      sfx.pop();
      setHintValue(b[bestSrc]);
      window.clearTimeout(hintTimer.current);
      hintTimer.current = window.setTimeout(() => setHintValue(null), 1600);
    }
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
    const onDown = (e: PointerEvent) => {
      // Tiles are buttons — record start but let clicks through.
      swipeStart.current = { x: e.clientX, y: e.clientY };
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const onUp = (e: PointerEvent) => {
      const d = swipeStart.current; swipeStart.current = null;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) < 20) return; // tap — let the button onClick handle it
      if (Math.abs(dx) > Math.abs(dy)) slideDir(dx > 0 ? "right" : "left");
      else slideDir(dy > 0 ? "down" : "up");
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
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
              return (
                <motion.button
                  key={value}
                  type="button"
                  className={`sld-tile ${won ? "won" : ""} ${hintValue === value ? "hint" : ""}`}
                  style={{ gridColumnStart: c + 1, gridRowStart: r + 1 }}
                  layout={!reduced}
                  transition={{ type: "spring", stiffness: 560, damping: 38 }}
                  onClick={() => slideAt(pos)}
                  aria-label={`Tile ${value}`}
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

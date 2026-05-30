import { FC, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./g2048.css";

const SIZE = 4;
const SAVE_KEY = "2048:v1";

type Dir = "up" | "down" | "left" | "right";
interface Tile { id: number; value: number; r: number; c: number; merged?: boolean; isNew?: boolean; }

const G2048_INFO: GameInfo = {
  about:
    "Slide the board; tiles move as far as they can and equal tiles merge into one of double the value. Keep merging to build the 2048 tile — then chase a higher score.",
  howTo: [
    "Swipe (or press an arrow key) to slide every tile that way.",
    "Two touching tiles of the same number merge and double.",
    "A new 2 (or 4) appears after each move.",
    "Reach 2048 to win — keep going for a high score. No moves left = game over.",
  ],
  controls: [
    { keys: "Swipe", desc: "Slide tiles" },
    { keys: "← → ↑ ↓", desc: "Slide tiles" },
    { keys: "W A S D", desc: "Slide tiles" },
  ],
  tips: [
    "Keep your biggest tile pinned in a corner.",
    "Build in one direction so the board stays orderly.",
  ],
};

let uid = 0;
const nextId = () => ++uid;

function emptyCells(tiles: Tile[]): Array<[number, number]> {
  const taken = new Set(tiles.map(t => t.r * SIZE + t.c));
  const out: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!taken.has(r * SIZE + c)) out.push([r, c]);
  return out;
}

function addRandomTile(tiles: Tile[]): Tile[] {
  const cells = emptyCells(tiles);
  if (cells.length === 0) return tiles;
  const [r, c] = cells[Math.floor(Math.random() * cells.length)];
  return [...tiles, { id: nextId(), value: Math.random() < 0.9 ? 2 : 4, r, c, isNew: true }];
}

function spawnInitial(): Tile[] {
  return addRandomTile(addRandomTile([]));
}

/** Traversal lines (cells from the destination wall outward) per direction. */
function lines(dir: Dir): Array<Array<[number, number]>> {
  const out: Array<Array<[number, number]>> = [];
  for (let i = 0; i < SIZE; i++) {
    const line: Array<[number, number]> = [];
    for (let j = 0; j < SIZE; j++) {
      if (dir === "left") line.push([i, j]);
      else if (dir === "right") line.push([i, SIZE - 1 - j]);
      else if (dir === "up") line.push([j, i]);
      else line.push([SIZE - 1 - j, i]);
    }
    out.push(line);
  }
  return out;
}

function move(tiles: Tile[], dir: Dir): { tiles: Tile[]; moved: boolean; gained: number } {
  const grid: (Tile | null)[][] = Array.from({ length: SIZE }, () => Array<Tile | null>(SIZE).fill(null));
  tiles.forEach(t => { grid[t.r][t.c] = t; });

  const result: Tile[] = [];
  let moved = false;
  let gained = 0;

  for (const line of lines(dir)) {
    const seq = line.map(([r, c]) => grid[r][c]).filter((t): t is Tile => !!t);
    const merged: Tile[] = [];
    for (let i = 0; i < seq.length; i++) {
      if (i + 1 < seq.length && seq[i].value === seq[i + 1].value) {
        const value = seq[i].value * 2;
        gained += value;
        merged.push({ id: seq[i].id, value, r: 0, c: 0, merged: true });
        i++; // absorb the next tile
      } else {
        merged.push({ id: seq[i].id, value: seq[i].value, r: 0, c: 0 });
      }
    }
    for (let k = 0; k < merged.length; k++) {
      const [nr, nc] = line[k];
      result.push({ ...merged[k], r: nr, c: nc });
    }
  }

  // Determine movement: a tile changed cell, or a merge reduced the count.
  if (result.length !== tiles.length) moved = true;
  else {
    const before = new Map(tiles.map(t => [t.id, t]));
    for (const t of result) {
      const b = before.get(t.id);
      if (!b || b.r !== t.r || b.c !== t.c) { moved = true; break; }
    }
  }
  return { tiles: result, moved, gained };
}

function canMove(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true;
  const grid: (number | null)[][] = Array.from({ length: SIZE }, () => Array<number | null>(SIZE).fill(null));
  tiles.forEach(t => { grid[t.r][t.c] = t.value; });
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const v = grid[r][c];
      if (c + 1 < SIZE && grid[r][c + 1] === v) return true;
      if (r + 1 < SIZE && grid[r + 1][c] === v) return true;
    }
  return false;
}

const TILE_STYLES: Record<number, { bg: string; fg: string }> = {
  2: { bg: "#fef3e2", fg: "#7c5a37" },
  4: { bg: "#fde6c4", fg: "#7c5a37" },
  8: { bg: "#fbbf6e", fg: "#fff" },
  16: { bg: "#f99d4c", fg: "#fff" },
  32: { bg: "#f97c4a", fg: "#fff" },
  64: { bg: "#ef5a35", fg: "#fff" },
  128: { bg: "#f6cf63", fg: "#fff" },
  256: { bg: "#f5ca4e", fg: "#fff" },
  512: { bg: "#f3c531", fg: "#fff" },
  1024: { bg: "#f1c00f", fg: "#fff" },
  2048: { bg: "#edb700", fg: "#fff" },
};
const styleFor = (v: number) => TILE_STYLES[v] ?? { bg: "#3c3a32", fg: "#fff" };

const G2048: FC = () => {
  const reduced = useReducedMotion() ?? false;
  const [tiles, setTiles] = useState<Tile[]>(() => spawnInitial());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [status, setStatus] = useState<"playing" | "won" | "over">("playing");

  const tilesRef = useRef(tiles); tilesRef.current = tiles;
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const statusRef = useRef(status); statusRef.current = status;
  const keptRef = useRef(false);

  useEffect(() => {
    idbGet<{ best: number }>(SAVE_KEY).then(d => {
      if (d?.best) { bestRef.current = d.best; setBest(d.best); }
    });
  }, []);

  const newGame = useCallback(() => {
    keptRef.current = false;
    scoreRef.current = 0;
    setScore(0);
    setStatus("playing");
    setTiles(spawnInitial());
  }, []);

  const doMove = useCallback((dir: Dir) => {
    if (statusRef.current === "over") return;
    const { tiles: movedTiles, moved, gained } = move(tilesRef.current, dir);
    if (!moved) return;
    const withNew = addRandomTile(movedTiles);
    setTiles(withNew);
    if (gained > 0) sfx.pop(); else sfx.move();

    if (gained > 0) {
      const ns = scoreRef.current + gained;
      scoreRef.current = ns;
      setScore(ns);
      if (ns > bestRef.current) { bestRef.current = ns; setBest(ns); void idbSet(SAVE_KEY, { best: ns }); }
    }

    if (statusRef.current !== "won" && !keptRef.current && withNew.some(t => t.value >= 2048)) {
      sfx.win();
      setStatus("won");
    } else if (!canMove(withNew)) {
      sfx.lose();
      setStatus("over");
    }
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
        W: "up", S: "down", A: "left", D: "right",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [doMove]);

  // Swipe / wheel — attach with native listeners so setPointerCapture works
  // reliably even when the pointerdown target is a child element (e.g. a tile).
  const playRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const wheelCooldown = useRef(0);

  useEffect(() => {
    const el = playRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest("button")) return;
      swipeRef.current = { x: e.clientX, y: e.clientY };
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const onUp = (e: PointerEvent) => {
      const d = swipeRef.current; swipeRef.current = null;
      if (!d) return;
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? "right" : "left");
      else doMove(dy > 0 ? "down" : "up");
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = performance.now();
      if (now < wheelCooldown.current) return;
      const { deltaX, deltaY } = e;
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      wheelCooldown.current = now + 240;
      if (Math.abs(deltaX) > Math.abs(deltaY)) doMove(deltaX > 0 ? "right" : "left");
      else doMove(deltaY > 0 ? "down" : "up");
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [doMove]);

  const keepPlaying = () => { keptRef.current = true; setStatus("playing"); };

  return (
    <GameShell
      slug="2048"
      info={G2048_INFO}
      stats={
        <>
          <span className="game-stat"><i>Score</i><b>{score}</b></span>
          <span className="game-stat"><i>Best</i><b>{best}</b></span>
        </>
      }
      toolbar={<button type="button" className="g2048-btn" onClick={newGame}>New game</button>}
    >
      <div ref={playRef} className="g2048-play">
        <div className="g2048-board" role="application" aria-label="2048 board">
          <div className="g2048-cells">
            {Array.from({ length: SIZE * SIZE }, (_, i) => <div key={i} className="g2048-cell" />)}
          </div>
          <div className="g2048-tiles">
            <AnimatePresence>
              {tiles.map(t => {
                const s = styleFor(t.value);
                return (
                  <motion.div
                    key={t.id}
                    className="g2048-tile"
                    style={{ gridColumnStart: t.c + 1, gridRowStart: t.r + 1, background: s.bg, color: s.fg }}
                    layout={!reduced}
                    initial={{ scale: t.isNew && !reduced ? 0 : 1 }}
                    animate={{ scale: t.merged && !reduced ? [1, 1.14, 1] : 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 520, damping: 34, scale: { duration: 0.18 } }}
                  >
                    <span className={t.value >= 1000 ? "g2048-tile-sm" : ""}>{t.value}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {status !== "playing" && (
              <motion.div
                className="g2048-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="g2048-overlay-title">{status === "won" ? "2048! 🎉" : "Game over"}</p>
                <p className="g2048-overlay-sub mono">Score {score}</p>
                <div className="g2048-overlay-btns">
                  {status === "won" && <button type="button" className="g2048-btn primary" onClick={keepPlaying}>Keep going</button>}
                  <button type="button" className="g2048-btn" onClick={newGame}>New game</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameShell>
  );
};

export default G2048;

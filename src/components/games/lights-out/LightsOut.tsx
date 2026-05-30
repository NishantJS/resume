import { FC, useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./lights-out.css";

const N = 5;
const SAVE_KEY = "lights-out:v1";

const INFO: GameInfo = {
  about:
    "A logic puzzle on a 5×5 grid. Every tap flips the tapped light and its four neighbours. Find the sequence that turns the whole board off.",
  howTo: [
    "Tap any cell to toggle it and the cells above, below, left and right.",
    "Lit cells are on; dark cells are off.",
    "Switch every light off to win.",
    "Stuck? The hint points at a cell on the solution.",
  ],
  controls: [
    { keys: "Tap / Click", desc: "Toggle a cross of lights" },
    { keys: "Hint", desc: "Highlight a solving cell" },
  ],
  tips: ["Order doesn't matter — only whether each cell is tapped an odd number of times.", "Clear the top rows first, then fix the bottom."],
};

const idx = (r: number, c: number) => r * N + c;

function toggle(grid: boolean[], i: number): boolean[] {
  const next = [...grid];
  const r = Math.floor(i / N), c = i % N;
  const flip = (rr: number, cc: number) => {
    if (rr >= 0 && rr < N && cc >= 0 && cc < N) next[idx(rr, cc)] = !next[idx(rr, cc)];
  };
  flip(r, c); flip(r - 1, c); flip(r + 1, c); flip(r, c - 1); flip(r, c + 1);
  return next;
}

interface Puzzle { grid: boolean[]; solution: boolean[]; }

/** Start from all-off and apply random taps — guarantees a solvable board.
 *  `solution` tracks which cells still need an (odd) tap to finish. */
function scramble(): Puzzle {
  let grid = Array<boolean>(N * N).fill(false);
  const solution = Array<boolean>(N * N).fill(false);
  const taps = 6 + Math.floor(Math.random() * 6);
  for (let k = 0; k < taps; k++) {
    const i = Math.floor(Math.random() * N * N);
    grid = toggle(grid, i);
    solution[i] = !solution[i];
  }
  if (grid.every(v => !v)) {
    const i = Math.floor(Math.random() * N * N);
    grid = toggle(grid, i);
    solution[i] = !solution[i];
  }
  return { grid, solution };
}

const LightsOut: FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle>(scramble);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [hint, setHint] = useState<number | null>(null);
  const savedRef = useRef(false);
  const hintTimer = useRef(0);

  const { grid, solution } = puzzle;
  const won = grid.every(v => !v);
  const lit = grid.filter(Boolean).length;

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
    setHint(null);
    setPuzzle(scramble());
    setMoves(0);
  }, []);

  const tap = (i: number) => {
    if (won) return;
    sfx.click();
    setHint(null);
    setPuzzle(p => ({
      grid: toggle(p.grid, i),
      solution: p.solution.map((v, k) => (k === i ? !v : v)),
    }));
    setMoves(m => m + 1);
  };

  const requestHint = useCallback(() => {
    if (won) return;
    const cell = solution.findIndex(Boolean);
    if (cell < 0) return;
    sfx.pop();
    setHint(cell);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 1500);
  }, [solution, won]);

  return (
    <GameShell
      slug="lights-out"
      subtitle={won ? "All clear!" : `${lit} lit`}
      info={INFO}
      stats={
        <>
          <span className="game-stat"><i>Moves</i><b>{moves}</b></span>
          <span className="game-stat"><i>Best</i><b>{best || "—"}</b></span>
        </>
      }
      toolbar={
        <>
          <button type="button" className="lo-btn ghost" onClick={requestHint} disabled={won}>Hint</button>
          <button type="button" className="lo-btn" onClick={newGame}>New game</button>
        </>
      }
    >
      <div className="lo-play">
        <div className="lo-wrap">
          <div className="lo-board" role="grid" aria-label="Lights Out board">
            {grid.map((on, i) => (
              <button
                key={i}
                type="button"
                className={`lo-cell ${on ? "on" : "off"} ${hint === i ? "hint" : ""}`}
                onClick={() => tap(i)}
                disabled={won}
                aria-label={`${on ? "On" : "Off"} light ${i + 1}`}
              />
            ))}
            {won && (
              <div className="lo-win">
                <span>Solved in {moves}!</span>
                <button type="button" className="lo-btn primary" onClick={newGame}>New game</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </GameShell>
  );
};

export default LightsOut;

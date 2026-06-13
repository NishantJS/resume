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
    "Stuck? The hint marks a cell from the shortest solution — it stays lit until you tap it.",
  ],
  controls: [
    { keys: "Tap / Click", desc: "Toggle a cross of lights" },
    { keys: "Hint", desc: "Mark a cell on the shortest solution" },
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

/** Start from all-off and apply random taps — guarantees a solvable board. */
function scramble(): boolean[] {
  let grid = Array<boolean>(N * N).fill(false);
  const taps = 6 + Math.floor(Math.random() * 6);
  for (let k = 0; k < taps; k++) {
    grid = toggle(grid, Math.floor(Math.random() * N * N));
  }
  if (grid.every(v => !v)) grid = toggle(grid, Math.floor(Math.random() * N * N));
  return grid;
}

/** Exact minimum-tap solution for the CURRENT board via light chasing:
 *  try all 32 first-row press patterns, chase the lights downward, keep
 *  patterns whose last row ends dark, and return the fewest-presses set.
 *  Always correct no matter what the player has tapped so far (the old
 *  scramble-tracked solution was neither minimal nor obviously trustworthy). */
function minimalSolution(grid: boolean[]): number[] {
  let best: number[] | null = null;
  for (let mask = 0; mask < 1 << N; mask++) {
    let g = grid;
    const presses: number[] = [];
    for (let c = 0; c < N; c++) {
      if (mask & (1 << c)) { g = toggle(g, c); presses.push(c); }
    }
    for (let r = 1; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (g[idx(r - 1, c)]) { const i = idx(r, c); g = toggle(g, i); presses.push(i); }
      }
    }
    let solved = true;
    for (let c = 0; c < N; c++) if (g[idx(N - 1, c)]) { solved = false; break; }
    if (solved && (!best || presses.length < best.length)) best = presses;
  }
  return best ?? [];
}

const LightsOut: FC = () => {
  const [grid, setGrid] = useState<boolean[]>(scramble);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [hint, setHint] = useState<number | null>(null);
  const savedRef = useRef(false);

  const won = grid.every(v => !v);
  const lit = grid.filter(Boolean).length;

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
    setHint(null);
    setGrid(scramble());
    setMoves(0);
  }, []);

  const tap = (i: number) => {
    if (won) return;
    sfx.click();
    // The hint stays lit until used; tapping a different cell changes the
    // board, so the marked cell may no longer be optimal — clear it then too.
    setHint(null);
    setGrid(g => toggle(g, i));
    setMoves(m => m + 1);
  };

  const requestHint = useCallback(() => {
    if (won) return;
    const solution = minimalSolution(grid);
    if (solution.length === 0) return;
    sfx.pop();
    setHint(solution[0]);
  }, [grid, won]);

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

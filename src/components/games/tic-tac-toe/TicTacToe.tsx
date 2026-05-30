import { FC, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import GameShell, { type GameInfo } from "../GameShell";
import { idbGet, idbSet } from "../idb";
import { sfx } from "../sound";
import "./tic-tac-toe.css";

const TTT_INFO: GameInfo = {
  about:
    "The classic 3×3 game. Get three of your marks in a row — horizontally, vertically or diagonally — before your opponent does.",
  howTo: [
    "You play X and always move first; tap any empty square.",
    "In “vs Bot” mode the computer answers as O.",
    "Switch to “2 Players” to pass-and-play on one screen.",
    "First to line up three wins; a full board with no line is a draw.",
  ],
  controls: [
    { keys: "Tap / Click", desc: "Place your mark" },
  ],
  tips: [
    "Hard mode runs full minimax and can’t be beaten — aim for a draw.",
    "Grab the centre and corners early.",
  ],
};

type Mark = "X" | "O";
type Cell = Mark | null;
type Mode = "ai" | "2p";
type Difficulty = "easy" | "medium" | "hard";

interface Scores { x: number; o: number; draw: number; }
interface Persisted { scores: Scores; mode: Mode; difficulty: Difficulty; }

const SAVE_KEY = "tic-tac-toe:v1";
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],            // diagonals
];

const HUMAN: Mark = "X";
const AI: Mark = "O";

function winnerOf(b: Cell[]): { player: Mark; line: number[] } | null {
  for (const line of LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { player: b[a] as Mark, line };
  }
  return null;
}
const isFull = (b: Cell[]) => b.every(Boolean);
const emptyCells = (b: Cell[]) => b.flatMap((v, i) => (v ? [] : [i]));

/** Minimax — AI maximises, human minimises. Depth keeps it preferring quick wins. */
function minimax(b: Cell[], turn: Mark, depth: number): number {
  const w = winnerOf(b);
  if (w) return w.player === AI ? 10 - depth : depth - 10;
  if (isFull(b)) return 0;
  const next = turn === AI ? HUMAN : AI;
  const scores = emptyCells(b).map(i => {
    b[i] = turn;
    const s = minimax(b, next, depth + 1);
    b[i] = null;
    return s;
  });
  return turn === AI ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(b: Cell[]): number {
  let best = -Infinity, move = -1;
  for (const i of emptyCells(b)) {
    b[i] = AI;
    const s = minimax(b, HUMAN, 0);
    b[i] = null;
    if (s > best) { best = s; move = i; }
  }
  return move;
}

/** Returns the cell the AI should play given the difficulty. */
function aiMove(b: Cell[], difficulty: Difficulty): number {
  const empties = emptyCells(b);
  if (empties.length === 0) return -1;
  const random = () => empties[Math.floor(Math.random() * empties.length)];
  if (difficulty === "easy") return random();
  if (difficulty === "medium") return Math.random() < 0.55 ? bestMove(b) : random();
  return bestMove(b);
}

/* ── Marks (animated stroke draw-in) ──────────────────────────── */
const XMark: FC<{ reduced: boolean }> = ({ reduced }) => {
  const init = { pathLength: reduced ? 1 : 0 };
  return (
    <svg className="ttt-mark ttt-x" viewBox="0 0 100 100" aria-hidden>
      <motion.line x1="24" y1="24" x2="76" y2="76" initial={init} animate={{ pathLength: 1 }} transition={{ duration: 0.28, ease: "easeOut" }} />
      <motion.line x1="76" y1="24" x2="24" y2="76" initial={init} animate={{ pathLength: 1 }} transition={{ duration: 0.28, delay: reduced ? 0 : 0.16, ease: "easeOut" }} />
    </svg>
  );
};
const OMark: FC<{ reduced: boolean }> = ({ reduced }) => (
  <svg className="ttt-mark ttt-o" viewBox="0 0 100 100" aria-hidden>
    <motion.circle
      cx="50" cy="50" r="28"
      initial={{ pathLength: reduced ? 1 : 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ rotate: -90, transformOrigin: "50% 50%" }}
    />
  </svg>
);

const TicTacToe: FC = () => {
  const reduced = useReducedMotion() ?? false;

  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<Mark>(HUMAN);
  const [mode, setMode] = useState<Mode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [scores, setScores] = useState<Scores>({ x: 0, o: 0, draw: 0 });
  const [hydrated, setHydrated] = useState(false);

  const result = winnerOf(board);
  const draw = !result && isFull(board);
  const over = !!result || draw;
  const scoredRef = useRef(false);

  // Hydrate saved scores + preferences from IndexedDB.
  useEffect(() => {
    let cancelled = false;
    idbGet<Persisted>(SAVE_KEY).then(data => {
      if (cancelled || !data) { setHydrated(true); return; }
      if (data.scores) setScores(data.scores);
      if (data.mode) setMode(data.mode);
      if (data.difficulty) setDifficulty(data.difficulty);
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, []);

  // Persist whenever something meaningful changes (after first hydrate).
  useEffect(() => {
    if (!hydrated) return;
    void idbSet<Persisted>(SAVE_KEY, { scores, mode, difficulty });
  }, [scores, mode, difficulty, hydrated]);

  // Tally the score once per finished game.
  useEffect(() => {
    if (!over || scoredRef.current) return;
    scoredRef.current = true;
    if (result) sfx.win(); else sfx.move();
    setScores(s =>
      draw ? { ...s, draw: s.draw + 1 }
        : result!.player === "X" ? { ...s, x: s.x + 1 } : { ...s, o: s.o + 1 },
    );
  }, [over, draw, result]);

  const play = useCallback((i: number) => {
    setBoard(prev => {
      if (prev[i] || winnerOf(prev)) return prev;
      const next = [...prev];
      next[i] = turn;
      return next;
    });
    setTurn(t => (t === "X" ? "O" : "X"));
    sfx.place();
  }, [turn]);

  // AI takes its turn.
  useEffect(() => {
    if (mode !== "ai" || turn !== AI || over) return;
    const snapshot = [...board];
    const id = window.setTimeout(() => {
      const move = aiMove(snapshot, difficulty);
      if (move >= 0) {
        setBoard(prev => {
          if (prev[move] || winnerOf(prev)) return prev;
          const next = [...prev];
          next[move] = AI;
          return next;
        });
        setTurn(HUMAN);
        sfx.place();
      }
    }, reduced ? 120 : 420);
    return () => window.clearTimeout(id);
  }, [mode, turn, over, board, difficulty, reduced]);

  // Next game's starter — alternates each round like real life. Game 1 is the
  // player (X); the bot/other player takes the first move next time, and so on.
  const [nextStarter, setNextStarter] = useState<Mark>(AI);

  const newRound = useCallback(() => {
    scoredRef.current = false;
    setBoard(Array(9).fill(null));
    setTurn(nextStarter);
    setNextStarter(s => (s === "X" ? "O" : "X"));
  }, [nextStarter]);

  // Fresh game that resets the alternation (used when changing mode/difficulty).
  const resetGame = useCallback(() => {
    scoredRef.current = false;
    setBoard(Array(9).fill(null));
    setTurn(HUMAN);
    setNextStarter(AI);
  }, []);

  const resetScores = useCallback(() => {
    setScores({ x: 0, o: 0, draw: 0 });
    resetGame();
  }, [resetGame]);

  const cellDisabled = (i: number) =>
    over || !!board[i] || (mode === "ai" && turn === AI);

  const status = result
    ? mode === "ai"
      ? result.player === HUMAN ? "You win! 🎉" : "Bot wins"
      : `${result.player} wins! 🎉`
    : draw
      ? "Draw"
      : mode === "ai"
        ? turn === HUMAN ? "Your move" : "Bot thinking…"
        : `${turn} to move`;

  const oLabel = mode === "ai" ? "Bot (O)" : "Player O";

  return (
    <GameShell
      slug="tic-tac-toe"
      subtitle={mode === "ai" ? `vs Bot · ${difficulty}` : "2 players · same screen"}
      info={TTT_INFO}
      stats={
        <>
          <span className={`game-stat ${turn === "X" && !over ? "active" : ""}`}>
            <i>{mode === "ai" ? "You (X)" : "Player X"}</i><b style={{ color: "#7c3aed" }}>{scores.x}</b>
          </span>
          <span className="game-stat"><i>Draws</i><b>{scores.draw}</b></span>
          <span className={`game-stat ${turn === "O" && !over ? "active" : ""}`}>
            <i>{oLabel}</i><b style={{ color: "#f43f5e" }}>{scores.o}</b>
          </span>
        </>
      }
    >
      <div className="ttt-play">
        {/* Board */}
        <div className="ttt-board-wrap">
          <div className="ttt-board" role="grid" aria-label="Tic-tac-toe board">
            {board.map((cell, i) => {
              const winning = result?.line.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  className={`ttt-cell ${winning ? "win" : ""}`}
                  onClick={() => play(i)}
                  disabled={cellDisabled(i)}
                  aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ", empty"}`}
                >
                  <AnimatePresence>
                    {cell && (
                      <motion.span
                        key={cell}
                        className="ttt-cell-inner"
                        initial={{ scale: reduced ? 1 : 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 340, damping: 20 }}
                      >
                        {cell === "X" ? <XMark reduced={reduced} /> : <OMark reduced={reduced} />}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {over && (
              <motion.div
                className="ttt-result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span>{status}</span>
                <button type="button" className="ttt-btn primary" onClick={newRound}>Play again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!over && <p className="ttt-status mono">{status}</p>}

        {/* Controls */}
        <div className="ttt-controls">
          <div className="ttt-seg" role="tablist" aria-label="Mode">
            <button type="button" role="tab" aria-selected={mode === "ai"} className={mode === "ai" ? "on" : ""} onClick={() => { setMode("ai"); resetGame(); }}>vs Bot</button>
            <button type="button" role="tab" aria-selected={mode === "2p"} className={mode === "2p" ? "on" : ""} onClick={() => { setMode("2p"); resetGame(); }}>2 Players</button>
          </div>

          <div className={`ttt-seg ${mode === "2p" ? "is-hidden" : ""}`} role="tablist" aria-label="Difficulty">
            {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
              <button key={d} type="button" role="tab" aria-selected={difficulty === d} className={difficulty === d ? "on" : ""} onClick={() => { setDifficulty(d); resetGame(); }}>
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <button type="button" className="ttt-btn" onClick={resetScores}>Reset scores</button>
        </div>
      </div>
    </GameShell>
  );
};

export default TicTacToe;
